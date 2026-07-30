import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import TimeTrackingService from '@/services/TimeTrackingService';
import StreakService from '@/services/StreakService';

// Max ms to wait for Supabase before giving up and unblocking the UI
const AUTH_INIT_TIMEOUT_MS = 12000;

export type UserType = {
  id: string;
  name: string;
  email: string;
  age?: number;
  class?: string;
  state?: string;
  board?: string;
  xp: number;
  level: number;
  streak: number;
  neurons: number;
  joinedDate: string;
  purpose?: string;
  profileImage?: string;
  rank?: number;
  questsCompleted: number;
  achievements: string[];
  isGuest: boolean;
  onboardingComplete: boolean;
  role?: string;
}

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseReachable: boolean;
  supabaseUser: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{error: any | null}>;
  signup: (email: string, password: string, name: string, role?: 'school' | 'teacher' | 'student', metadata?: any) => Promise<{error: any | null}>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  completeOnboarding: (userData: Partial<UserType>) => Promise<void>;
  profileError: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  supabaseReachable: true,
  supabaseUser: null,
  session: null,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  updateUserProfile: async () => {},
  completeOnboarding: async () => {},
  profileError: null,
});

export const useAuth = () => useContext(AuthContext);

function isSameUser(u1: User | null, u2: User | null) {
  if (!u1 || !u2) return u1 === u2;
  return u1.id === u2.id && JSON.stringify(u1.user_metadata) === JSON.stringify(u2.user_metadata);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [supabaseUserRole, setSupabaseUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseReachable, setSupabaseReachable] = useState(true);
  const authInitialized = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastFetchedUserId = useRef<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Hard timeout: if Supabase hasn't responded in AUTH_INIT_TIMEOUT_MS, unblock the UI
    const timeoutId = setTimeout(() => {
      if (!authInitialized.current) {
        console.warn('[AuthContext] Supabase init timed out – project may be paused.');
        setSupabaseReachable(false);
        setIsLoading(false);
        authInitialized.current = true;
      }
    }, AUTH_INIT_TIMEOUT_MS);

    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] onAuthStateChange event:', event, session);
        setSession(prev => {
          if (prev === session) return prev;
          console.log('[AuthContext] setSession:', session);
          return session;
        });
        setSupabaseUserId(prev => {
          if (prev === session?.user?.id) return prev;
          console.log('[AuthContext] setSupabaseUserId:', session?.user?.id);
          return session?.user?.id ?? null;
        });
        setSupabaseUserRole(prev => {
          let newRole = session?.user?.user_metadata?.role ?? null;
          
          // HUGE HACK: Intercept role if we are currently signing up to prevent race condition 
          // where the DB trigger temporarily sets the role to 'teacher'.
          if (window.__pendingSignupRole) {
            newRole = window.__pendingSignupRole;
          }
          
          if (prev === newRole) return prev;
          console.log('[AuthContext] setSupabaseUserRole:', newRole);
          return newRole;
        });
        if (!session?.user) {
          console.log('[AuthContext] setUser: null (no session user)');
          setUser(null);
          if (!authInitialized.current) {
            authInitialized.current = true;
            clearTimeout(timeoutId);
          }
          setIsLoading(false);
          return;
        }
        // Mark as initialized on first successful event
        if (!authInitialized.current) {
          authInitialized.current = true;
          clearTimeout(timeoutId);
        }
        // Update streak on signin
        if (event === 'SIGNED_IN') {
          const role = session.user.user_metadata?.role;
          if (role !== 'school') {
            setTimeout(async () => {
              try {
                await StreakService.recordDailyLogin(session.user.id);
              } catch (error) {
                console.error('Error updating streak:', error);
              }
            }, 0);
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(prev => {
        if (prev === session) return prev;
        console.log('[AuthContext] setSession (getSession):', session);
        return session;
      });
      setSupabaseUserId(prev => {
        if (prev === session?.user?.id) return prev;
        console.log('[AuthContext] setSupabaseUserId (getSession):', session?.user?.id);
        return session?.user?.id ?? null;
      });
      setSupabaseUserRole(prev => {
        const newRole = session?.user?.user_metadata?.role ?? null;
        if (prev === newRole) return prev;
        console.log('[AuthContext] setSupabaseUserRole (getSession):', newRole);
        return newRole;
      });
      if (!session?.user) {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('[AuthContext] getSession error:', err);
      // Don't set isLoading false here — the timeout will handle it
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // New effect: fetch profile when supabaseUserId is set, and update role if it changes
  useEffect(() => {
    if (supabaseUserId) {
      if (user && user.id === supabaseUserId && supabaseUserRole && user.role !== supabaseUserRole) {
        console.log('[AuthContext] Role updated dynamically to', supabaseUserRole);
        setUser(prev => prev ? { ...prev, role: supabaseUserRole as any } : null);
      } else if (!user || user.id !== supabaseUserId) {
        fetchUserProfile(supabaseUserId);
      }
    }
    if (!supabaseUserId) {
      lastFetchedUserId.current = null;
    }
  }, [supabaseUserId, supabaseUserRole, user]);

  // Remove the routing effect since we'll handle navigation in the components
  
  const logout = async () => {
    try {
      // End any active time tracking session
      if (user) {
        const timeTracker = TimeTrackingService.getInstance();
        await timeTracker.endSession();
      }
      
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
      setProfileError(null);
      
      // Navigate after state updates
      setTimeout(() => {
        navigate('/');
      }, 0);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (user && user.id === userId) return;
    try {
      setProfileError(null); // reset error before fetch
      if (!supabaseUserId) {
        console.log('[AuthContext] fetchUserProfile called but supabaseUserId is null. Aborting.');
        setIsLoading(false);
        return;
      }
      // Get the role from the state
      let role = supabaseUserRole;
      console.log('[AuthContext] Fetched supabaseUserId:', supabaseUserId);
      console.log('[AuthContext] Initial role from state:', role);
      let profileData = null;
      let userData: UserType | null = null;
      let fetchError = null;
      if (role === 'school') {
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', userId)
          .single();
        if (schoolError) {
          fetchError = schoolError;
          console.error('[AuthContext] Error fetching school profile:', schoolError);
          profileData = null;
        } else {
          profileData = schoolData;
          userData = {
            id: userId,
            email: session?.user?.email || '',
            role: 'school',
            name: profileData?.school_name || '',
            onboardingComplete: true,
            xp: 0,
            level: 1,
            streak: 1,
            neurons: 0,
            joinedDate: profileData?.created_at || new Date().toISOString(),
            questsCompleted: 0,
            achievements: [],
            isGuest: false
          };
        }
      } else if (role === 'teacher') {
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (teacherError) {
          fetchError = teacherError;
          console.error('[AuthContext] Error fetching teacher profile:', teacherError);
          profileData = null;
        } else {
          profileData = teacherData;
          userData = {
            id: userId,
            email: session?.user?.email || '',
            role: 'teacher',
            name: profileData?.name || '',
            onboardingComplete: true,
            xp: 0,
            level: 1,
            streak: 1,
            neurons: 0,
            joinedDate: profileData?.created_at || new Date().toISOString(),
            questsCompleted: 0,
            achievements: [],
            isGuest: false
          };
        }
      } else {
        // Default to student
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (studentError) {
          fetchError = studentError;
          console.error('[AuthContext] Error fetching student profile:', studentError);
          profileData = null;
        } else {
          profileData = studentData;
          userData = {
            id: userId,
            email: session?.user?.email || '',
            role: role || 'student',
            name: profileData?.full_name || '',
            onboardingComplete: !!profileData?.onboarding_complete,
            xp: profileData?.xp || 0,
            level: profileData?.level || 1,
            streak: profileData?.streak || 1,
            neurons: profileData?.neurons || 0,
            joinedDate: profileData?.joined_date || new Date().toISOString(),
            questsCompleted: profileData?.quests_completed || 0,
            achievements: profileData?.achievements || [],
            isGuest: false
          };
        }
      }
      if (fetchError && fetchError.code === '42501') {
        // Permission denied (RLS)
        setUser(null);
        setProfileError('You do not have permission to view this profile. Please contact support if this is an error.');
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to view this profile. Please contact support if this is an error.',
          variant: 'destructive',
        });
      } else {
        console.log('[AuthContext] Setting user data:', userData);
        setUser(prev => {
          if (prev && JSON.stringify(prev) === JSON.stringify(userData)) return prev;
          return userData;
        });
      }
    } catch (error) {
      console.error('[AuthContext] Error in fetchUserProfile:', error);
      setUser(null);
      setProfileError('An unexpected error occurred while fetching your profile.');
      toast({
        title: 'Profile Error',
        description: 'An unexpected error occurred while fetching your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (data?.user) {
        console.log('[AuthContext] User logged in:', data.user);
        console.log('[AuthContext] User role:', data.user.user_metadata?.role);
      }
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role?: 'school' | 'teacher' | 'student', metadata?: any) => {
    try {
      setIsLoading(true);
      
      // Set the pending role to intercept in onAuthStateChange
      (window as any).__pendingSignupRole = role || 'student';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role || 'student',
            ...metadata
          },
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (data?.user) {
        // Fix for rogue handle_new_teacher database trigger hijacking all signups
        const intendedRole = role || 'student';
        if (data.user.user_metadata?.role !== intendedRole) {
          await supabase.auth.updateUser({
            data: { role: intendedRole }
          });
          data.user.user_metadata.role = intendedRole;
          
          // Force React state update to avoid race condition with onAuthStateChange
          setSupabaseUserRole(intendedRole);
          setUser(prev => prev ? { ...prev, role: intendedRole as any } : null);
        }

        console.log('[AuthContext] User signed up:', data.user);
        console.log('[AuthContext] User role:', data.user.user_metadata?.role);
        
        // Clear the pending role
        (window as any).__pendingSignupRole = null;
      }
      
      if (error) {
        // Clear the pending role
        (window as any).__pendingSignupRole = null;
        
        let errorMsg = error.message;
        if (errorMsg.toLowerCase().includes('email') && error.status === 500) {
          errorMsg = "Supabase email limit reached. Please go to your Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF 'Confirm email'.";
        }
        toast({
          title: "Sign Up Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { error: new Error(errorMsg) };
      }

      // Check if user was created but email confirmation is pending
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Sign Up Failed",
          description: "This email is already registered or requires confirmation.",
          variant: "destructive",
        });
        return { error: new Error("Email exists or needs confirmation") };
      }

      toast({
        title: "Sign Up Successful",
        description: "Your account has been created successfully!",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!user || !supabaseUserId) return;
    
    try {
      setIsLoading(true);
      
      // Map from our app's UserType to the database fields
      const profileData: any = {};
      
      if (data.name !== undefined) profileData.full_name = data.name;
      if (data.age !== undefined) profileData.age = data.age;
      if (data.class !== undefined) profileData.class = data.class;
      if (data.state !== undefined) profileData.state = data.state;
      if (data.board !== undefined) profileData.board = data.board;
      if (data.purpose !== undefined) profileData.purpose = data.purpose;
      if (data.profileImage !== undefined) profileData.profile_image_url = data.profileImage;
      if (data.xp !== undefined) profileData.xp = data.xp;
      if (data.level !== undefined) profileData.level = data.level;
      if (data.streak !== undefined) profileData.streak = data.streak;
      if (data.neurons !== undefined) profileData.neurons = data.neurons;
      if (data.questsCompleted !== undefined) profileData.quests_completed = data.questsCompleted;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      console.error('Error in updateUserProfile:', error);
      toast({
        title: "Profile Update Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (userData: Partial<UserType>) => {
    if (!user || !supabaseUserId) return;
    
    try {
      setIsLoading(true);
      
      // Map from our app's UserType to the database fields
      const profileData: any = {
        onboarding_complete: true
      };
      
      if (userData.name !== undefined) profileData.full_name = userData.name;
      if (userData.age !== undefined) profileData.age = userData.age;
      if (userData.class !== undefined) profileData.class = userData.class;
      if (userData.state !== undefined) profileData.state = userData.state;
      if (userData.board !== undefined) profileData.board = userData.board;
      if (userData.purpose !== undefined) profileData.purpose = userData.purpose;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error completing onboarding:', error);
        toast({
          title: "Onboarding Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        ...userData, 
        onboardingComplete: true 
      } : null);
      
      navigate('/home');
    } catch (error: any) {
      console.error('Error in completeOnboarding:', error);
      toast({
        title: "Onboarding Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        supabaseReachable,
        supabaseUser: session?.user ?? null,
        session,
        login, 
        signup, 
        logout, 
        updateUserProfile,
        completeOnboarding,
        profileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
