import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Brain, LogIn } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleNeuronsClick = () => {
    toast({
      title: "Neurons Shop",
      description: "The shop feature will be available soon!",
      duration: 3000,
    });
  };

  return (
    <div className="topbar sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="h-16 flex items-center justify-between px-4">
        {/* User Icon or Login Link */}
        {user ? (
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage}
                    alt="User Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-siksha-purple" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="flex flex-col">
                <div className="flex items-center space-x-3 p-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-siksha-purple flex items-center justify-center text-white">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage}
                        alt="User Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="p-4 border-b">
                  <div className="flex justify-between mb-1">
                    <span>Level {user.level}</span>
                    <span>{user.xp} XP</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-siksha-purple rounded-full"
                      style={{ width: `${Math.min(100, (user.xp ?? 0) % 100)}%` }}
                    ></div>
                  </div>
                  
                </div>
                
                <div className="p-4">
                  {user.isGuest ? (
                    <NavLink to="/" className="w-full">
                      <Button variant="outline" className="w-full">Sign In / Sign Up</Button>
                    </NavLink>
                  ) : (
                    <>
                      <NavLink to="/profile" className="w-full block mb-2" onClick={() => setUserMenuOpen(false)}>
                        <Button variant="outline" className="w-full">View Profile</Button>
                      </NavLink>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 hover:text-red-700"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <NavLink to="/">
            <Button variant="ghost" className="flex items-center space-x-1">
              <LogIn className="h-5 w-5 text-siksha-purple" />
              <span>Sign In</span>
            </Button>
          </NavLink>
        )}

        {/* Branding */}
        <NavLink to={user?.isGuest ? "/study" : "/home"}>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-siksha-purple">Siksha AI</h1>
          </div>
        </NavLink>

        {/* Neurons (only for non-guest users) */}
        {user && !user.isGuest && (
          <Button variant="ghost" onClick={handleNeuronsClick} className="flex items-center space-x-1">
            <Brain className="w-5 h-5 text-siksha-purple" />
            <span className="font-bold">{user.neurons || 0}</span>
          </Button>
        )}
        
        {/* Empty div for non-authenticated users to maintain layout */}
        {!user && <div className="w-[42px]"></div>}
      </div>
    </div>
  );
};

export default TopBar;
