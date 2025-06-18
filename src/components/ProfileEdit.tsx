
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileEdit: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(user?.profileImage || null);
  
  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateUserProfile({ name });
      toast({
        title: "Profile Updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // Create a folder structure with user ID to ensure proper RLS policy match
      const filePath = `${user.id}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update the user profile with the new image URL
      await updateUserProfile({ profileImage: publicUrl });
      setImageUrl(publicUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your image. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-siksha-purple">
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div className="w-full">
            <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center justify-center space-x-2 bg-siksha-purple text-white px-4 py-2 rounded-md hover:bg-siksha-purple-dark">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload New Picture'}</span>
              </div>
              <Input 
                id="profile-image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <div className="flex space-x-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
            <Button onClick={handleNameUpdate}>Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEdit;
