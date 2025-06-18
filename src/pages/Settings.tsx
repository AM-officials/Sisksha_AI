import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { Bell, Volume2, HelpCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleToggleChange = (setting: string) => {
    toast({
      title: "Setting Updated",
      description: `${setting} setting has been updated.`,
    });
  };
  
  const handleSignOut = () => {
    logout();
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          {/* Notifications Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-siksha-purple" />
                  <Label htmlFor="push-notifications">Push notifications</Label>
                </div>
                <Switch 
                  id="push-notifications" 
                  defaultChecked={true} 
                  onCheckedChange={() => handleToggleChange('Push notifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-siksha-purple" />
                  <Label htmlFor="streak-reminders">Streak reminders</Label>
                </div>
                <Switch 
                  id="streak-reminders" 
                  defaultChecked={true} 
                  onCheckedChange={() => handleToggleChange('Streak reminders')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-siksha-purple" />
                  <Label htmlFor="achievement-notifications">Achievement notifications</Label>
                </div>
                <Switch 
                  id="achievement-notifications" 
                  defaultChecked={true} 
                  onCheckedChange={() => handleToggleChange('Achievement notifications')}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Sounds Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Sounds</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-siksha-purple" />
                  <Label htmlFor="sound-effects">Sound effects</Label>
                </div>
                <Switch 
                  id="sound-effects" 
                  defaultChecked={true}
                  onCheckedChange={() => handleToggleChange('Sound effects')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-siksha-purple" />
                  <Label htmlFor="audio-hints">Audio hints</Label>
                </div>
                <Switch 
                  id="audio-hints" 
                  defaultChecked={false}
                  onCheckedChange={() => handleToggleChange('Audio hints')}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Appearance Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-size">Text size</Label>
                <Select defaultValue="medium" onValueChange={(val) => handleToggleChange(`Text size: ${val}`)}>
                  <SelectTrigger id="text-size">
                    <SelectValue placeholder="Select text size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Support Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Support</h2>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start"
                onClick={() => toast({
                  title: "Help Center",
                  description: "This feature will be available soon!"
                })}
              >
                <HelpCircle className="w-5 h-5 mr-2 text-siksha-purple" />
                Help Center
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start"
                onClick={() => toast({
                  title: "Privacy Policy",
                  description: "This feature will be available soon!"
                })}
              >
                <HelpCircle className="w-5 h-5 mr-2 text-siksha-purple" />
                Privacy Policy
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Sign Out Section */}
          <div>
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Settings;
