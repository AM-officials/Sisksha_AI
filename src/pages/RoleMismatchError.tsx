import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const dashboardNames: Record<string, string> = {
  student: "Student's Dashboard",
  teacher: "Teacher's Dashboard",
  school: "School's Dashboard",
};

const RoleMismatchError = ({ requiredRole }: { requiredRole: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTryAgain = async () => {
    await logout();
    navigate('/');
  };

  const userRole = user?.role || 'unknown';
  const dashboard = dashboardNames[requiredRole] || 'Dashboard';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-6 text-gray-700">
          You are logged in as a <span className="font-semibold">{userRole}</span> and trying to access the <span className="font-semibold">{dashboard}</span>.<br />
          Please try with the correct credentials for this dashboard.
        </p>
        <Button onClick={handleTryAgain} className="w-full">Try Again</Button>
      </div>
    </div>
  );
};

export default RoleMismatchError; 