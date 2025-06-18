
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/Mascot';
import { useAuth } from '../context/AuthContext';

const OnboardingWelcome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-siksha-purple/10">
      <div className="w-full max-w-md mx-auto text-center animate-fade-in">
        <Mascot size="lg" expression="excited" />
        
        <h1 className="text-3xl font-bold mt-8 text-siksha-purple">Welcome to Siksha AI!</h1>
        
        <p className="mt-4 text-lg">
          Hi{user?.name ? `, ${user.name}` : ''}! I'm Buddhi, your AI learning companion. 
          I'm here to help you learn smarter, remember better, and achieve your educational goals.
        </p>
        
        <p className="mt-4">
          Let's set up your learning profile so I can personalize your experience.
        </p>
        
        <Button 
          onClick={() => navigate('/onboarding/purpose')} 
          className="mt-8 bg-siksha-purple hover:bg-siksha-purple-dark"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
