
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Mascot from '@/components/Mascot';
import { useAuth } from '../context/AuthContext';

const OnboardingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [educationClass, setEducationClass] = useState('');
  const [state, setState] = useState('');
  const [board, setBoard] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert age to number
    const ageNum = age ? parseInt(age, 10) : undefined;
    
    completeOnboarding({
      name: name || undefined,
      age: ageNum,
      class: educationClass || undefined,
      state: state || undefined,
      board: board || undefined
    });
    
    navigate('/home');
    setIsSubmitting(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-siksha-purple/10">
      <div className="w-full max-w-md mx-auto animate-scale-in">
        <div className="flex items-center justify-center mb-8">
          <Mascot size="md" expression="happy" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Tell us about yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="5"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Class/Grade</Label>
                <Select value={educationClass} onValueChange={setEducationClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Class {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Your state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="board">Educational Board</Label>
                <Select value={board} onValueChange={setBoard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbse">CBSE</SelectItem>
                    <SelectItem value="icse">ICSE</SelectItem>
                    <SelectItem value="state">State Board</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-siksha-purple hover:bg-siksha-purple-dark"
            >
              Complete Setup
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingDetails;
