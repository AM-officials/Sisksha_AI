
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Mascot from '@/components/Mascot';
import { useAuth } from '../context/AuthContext';

const purposeOptions = [
  {
    id: 'improve_grades',
    title: 'Improve my grades',
    description: 'Get better results in tests and exams'
  },
  {
    id: 'revision',
    title: 'Revision help',
    description: 'More effective study sessions and revision'
  },
  {
    id: 'new_topics',
    title: 'Explore new topics',
    description: 'Learn subjects beyond my curriculum'
  },
  {
    id: 'homework',
    title: 'Homework assistant',
    description: 'Get help with assignments and projects'
  }
];

const OnboardingPurpose: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  
  const handleContinue = () => {
    if (selectedPurpose) {
      updateUserProfile({ purpose: selectedPurpose });
      navigate('/onboarding/details');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-siksha-purple/10">
      <div className="w-full max-w-md mx-auto animate-slide-up">
        <div className="flex items-center justify-center mb-8">
          <Mascot size="md" expression="thinking" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-siksha-purple">
          What brings you to Siksha AI?
        </h1>
        
        <div className="grid gap-4 mb-8">
          {purposeOptions.map((option) => (
            <Card 
              key={option.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedPurpose === option.id 
                  ? 'border-siksha-purple bg-siksha-purple/5' 
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedPurpose(option.id)}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedPurpose === option.id 
                    ? 'border-siksha-purple' 
                    : 'border-gray-300'
                }`}>
                  {selectedPurpose === option.id && (
                    <div className="w-3 h-3 rounded-full bg-siksha-purple"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedPurpose}
            className="bg-siksha-purple hover:bg-siksha-purple-dark"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPurpose;
