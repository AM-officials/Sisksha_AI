
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import Mascot from '@/components/Mascot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get token and type from URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (token && type === 'signup') {
          // Handle email verification
          navigate('/onboarding/welcome');
          setSuccess(true);
        } else if (token && type === 'recovery') {
          // Handle password recovery
          navigate('/reset-password');
          setSuccess(true);
        } else {
          setError("Invalid verification link");
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || "An error occurred during verification");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-siksha-purple/10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Mascot size="lg" expression={error ? "neutral" : loading ? "thinking" : "excited"} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              {loading ? "Verifying your email..." : 
               error ? "Verification Failed" : 
               "Email successfully verified!"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-siksha-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <p className="text-red-500">{error}</p>
                <p>The verification link may have expired or is invalid.</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4">Your email has been verified successfully!</p>
                <p>You can now continue with setting up your account.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            {!loading && (
              <Button 
                onClick={() => navigate(error ? '/' : '/onboarding/welcome')}
                className="bg-siksha-purple hover:bg-siksha-purple-dark"
              >
                {error ? "Return to Login" : "Continue to Onboarding"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
