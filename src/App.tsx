import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import React, { useEffect } from "react";

// Pages
import Auth from "./pages/Auth";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import OnboardingPurpose from "./pages/OnboardingPurpose";
import OnboardingDetails from "./pages/OnboardingDetails";
import Home from "./pages/Home";
import Study from "./pages/Study";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import EmailVerification from "./pages/EmailVerification";
import ParentAnalytics from "./pages/ParentAnalytics";
import Landing from "./pages/Landing";
import Schools from "./pages/Schools";
import SchoolsDashboard from './pages/SchoolsDashboard';
import TeachersDashboard from './pages/TeachersDashboard';
import SuperAdmin from './pages/super_admin';
import SuperAdminLogin from './pages/super_admin_login';
import ClassroomMode from './pages/ClassroomMode';
import RoleMismatchError from './pages/RoleMismatchError';
import ResetPassword from './pages/ResetPassword';

// Create QueryClient once — outside the component so it's a singleton and never recreated
const queryClient = new QueryClient();

// Create a new QueryClient instance inside the component
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Protected route wrapper that allows only authenticated non-guest users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Onboarding route - only for authenticated users who haven't completed onboarding
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user?.onboardingComplete) {
    return <Navigate to="/home" />;
  }
  
  return <>{children}</>;
};

// Auth route - only for unauthenticated users
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (isAuthenticated) {
    // If onboarding not complete, redirect to onboarding
    if (!user?.onboardingComplete) {
      return <Navigate to="/onboarding/welcome" />;
    }
    
    // Otherwise redirect to home
    return <Navigate to="/home" />;
  }
  
  return <>{children}</>;
};

// Routes that both regular and guest users can access
const SharedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// SuperAdminRoute: Only allows the super admin (by email) to access
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const superAdminEmail = "admin@platform.com"; // Change if needed

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.email !== superAdminEmail) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// SuperAdminLoginRoute: Only allows unauthenticated users or the super admin to access
const SuperAdminLoginRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const superAdminEmail = "admin@platform.com";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If already logged in as super admin, redirect to dashboard
  if (isAuthenticated && user?.email === superAdminEmail) {
    return <Navigate to="/super_admin" />;
  }

  // If logged in as someone else, redirect to home
  if (isAuthenticated && user?.email !== superAdminEmail) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// StudentRoute: Only allows students to access their dashboard
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user.role !== 'student') return <RoleMismatchError requiredRole="student" />;
  return <>{children}</>;
};

// TeacherRoute: Only allows teachers to access their dashboard
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user.role !== 'teacher') return <RoleMismatchError requiredRole="teacher" />;
  return <>{children}</>;
};

// SchoolRoute: Only allows schools to access their dashboard
const SchoolRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user.role !== 'school') return <RoleMismatchError requiredRole="school" />;
  return <>{children}</>;
};

// Main component
const AppContent = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/verify" element={<EmailVerification />} />
      {/* Onboarding routes */}
      <Route path="/onboarding/welcome" element={<OnboardingRoute><OnboardingWelcome /></OnboardingRoute>} />
      <Route path="/onboarding/purpose" element={<OnboardingRoute><OnboardingPurpose /></OnboardingRoute>} />
      <Route path="/onboarding/details" element={<OnboardingRoute><OnboardingDetails /></OnboardingRoute>} />
      {/* Protected routes for regular users only */}
      <Route path="/home" element={<StudentRoute><Home /></StudentRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      {/* Shared routes for all authenticated users (including guests) */}
      <Route path="/study" element={<SharedRoute><Study /></SharedRoute>} />
      <Route path="/settings" element={<SharedRoute><Settings /></SharedRoute>} />
      <Route path="/parent-analytics" element={<ProtectedRoute><ParentAnalytics /></ProtectedRoute>} />
      <Route path="/schools" element={<Schools />} />
      <Route path="/schools_dashboard" element={<SchoolRoute><SchoolsDashboard /></SchoolRoute>} />
      <Route path="/teachers_dashboard" element={<TeacherRoute><TeachersDashboard /></TeacherRoute>} />
      <Route path="/classroom_mode" element={<ProtectedRoute><ClassroomMode /></ProtectedRoute>} />
      {/* Super Admin routes */}
      <Route path="/super_admin_login" element={<SuperAdminLoginRoute><SuperAdminLogin /></SuperAdminLoginRoute>} />
      <Route path="/super_admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
      {/* Reset Password route */}
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
