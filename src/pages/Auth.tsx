import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Canvas } from '@react-three/fiber';
import InteractiveMascot3D from '@/components/InteractiveMascot3D';
import { useToast } from '@/hooks/use-toast';
import Mascot from '@/components/Mascot';
import { supabase } from '../integrations/supabase/client';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [wrongPortalRole, setWrongPortalRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'school') {
        if (location.pathname !== '/schools_dashboard') {
          navigate('/schools_dashboard');
        }
      } else if (user.role === 'teacher') {
        if (location.pathname !== '/teachers_dashboard') {
          navigate('/teachers_dashboard');
        }
      } else if (user.role === 'superadmin') {
        if (location.pathname !== '/super_admin') {
          navigate('/super_admin');
        }
      } else {
        // Default to student flow
        if (!user.onboardingComplete && location.pathname !== '/onboarding/welcome') {
          navigate('/onboarding/welcome');
        } else if (user.onboardingComplete && location.pathname !== '/home') {
          navigate('/home');
        }
      }
    }
  }, [isAuthenticated, user?.role, user?.onboardingComplete, location.pathname, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const { error } = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    // After login, check the user role and redirect accordingly
    if (!error && user) {
      if (user.role === 'school') {
        setWrongPortalRole('school');
        return;
      } else if (user.role === 'teacher') {
        setWrongPortalRole('teacher');
        return;
      } else if (user.role === 'superadmin') {
        setWrongPortalRole('superadmin');
        return;
      } else if (user.role === 'student') {
        if (!user.onboardingComplete) {
          navigate('/onboarding/welcome');
        } else {
          navigate('/home');
        }
      } else {
        toast({
          title: 'Unknown Role',
          description: 'Your account does not have a valid role.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signup(
      signupEmail,
      signupPassword,
      signupName,
      'student',
      {
        name: signupName,
      }
    );
    setIsSubmitting(false);
  };

  const handlePasswordReset = async () => {
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail);
    setResetting(false);
    if (error) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset Email Sent", description: "Check your email for a reset link." });
    }
  };

  if (wrongPortalRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Wrong Portal</h2>
        <p className="mb-4">
          You tried to log in as a <b>{wrongPortalRole}</b>.<br />
          Please use the correct login page for your role.
        </p>
        <Button onClick={() => setWrongPortalRole(null)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-siksha-purple/10">
      <div className="w-full max-w-md mx-auto space-y-6 mb-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Mascot size="lg" expression="happy" />
          <h1 className="text-3xl font-bold mt-6 text-siksha-purple">Welcome to Siksha AI</h1>
          <p className="text-muted-foreground mt-2">Your AI-powered learning companion</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>Choose how you want to continue</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <a 
                        href="#" 
                        className="text-xs text-siksha-purple hover:underline"
                        onClick={e => {
                          e.preventDefault();
                          handlePasswordReset();
                        }}
                      >
                        {resetting ? 'Sending...' : 'Forgot password?'}
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-siksha-purple hover:bg-siksha-purple-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="p-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-siksha-purple hover:bg-siksha-purple-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
