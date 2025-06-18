import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { School, Users, BarChart3, Shield, ArrowLeft, GraduationCap, BookOpen, Calendar, Award, LogIn, UserPlus, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import emailjs from 'emailjs-com';

const Schools: React.FC = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const { toast } = useToast();
  
  const [showSchoolAuthModal, setShowSchoolAuthModal] = useState(false);
  const [showTeacherLoginModal, setShowTeacherLoginModal] = useState(false);
  const [showSchoolLoginModal, setShowSchoolLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resettingTeacher, setResettingTeacher] = useState(false);
  
  const [schoolFormData, setSchoolFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    principalName: '',
    contactPhone: '',
    city: '',
    state: '',
    board: 'CBSE'
  });

  const [teacherFormData, setTeacherFormData] = useState({
    email: '',
    password: ''
  });

  const [schoolLoginFormData, setSchoolLoginFormData] = useState({
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({
    schoolName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    contactPhone: ''
  });

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    school: '',
    phone: '',
    datetime: ''
  });
  const [demoError, setDemoError] = useState('');
  const [demoSuccess, setDemoSuccess] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  const features = [
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Student Management",
      description: "Comprehensive student tracking, progress monitoring, and personalized learning paths for every student in your institution."
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-green-600" />,
      title: "Analytics Dashboard",
      description: "Real-time insights into student performance, engagement metrics, and institutional analytics to drive better outcomes."
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-600" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security, data protection, and compliance with educational standards and regulations."
    },
    {
      icon: <BookOpen className="w-12 h-12 text-orange-600" />,
      title: "Curriculum Management",
      description: "Upload and manage syllabi, create assignments, and track curriculum coverage across all classes and subjects."
    },
    {
      icon: <Calendar className="w-12 h-12 text-indigo-600" />,
      title: "Assignment Tracking",
      description: "Create, assign, and monitor student progress on quizzes, flashcards, and custom learning activities."
    },
    {
      icon: <Award className="w-12 h-12 text-yellow-600" />,
      title: "Performance Analytics",
      description: "Detailed reports on student achievements, learning patterns, and areas for improvement with actionable insights."
    }
  ];

  const benefits = [
    "Reduce administrative workload by 60%",
    "Improve student engagement by 40%",
    "Real-time parent communication",
    "Automated progress tracking",
    "Customizable learning paths",
    "Multi-board curriculum support"
  ];

  const handleSchoolAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signup(
        schoolFormData.email, 
        schoolFormData.password, 
        schoolFormData.schoolName,
        'school', // Set role as school
        {
          schoolName: schoolFormData.schoolName,
          principalName: schoolFormData.principalName,
          contactPhone: schoolFormData.contactPhone,
          city: schoolFormData.city,
          state: schoolFormData.state,
          board: schoolFormData.board
        }
      );

      if (error) {
        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account, then login to access your school dashboard.",
        });
        setShowSchoolAuthModal(false);
        // Reset form
        setSchoolFormData({
          email: '',
          password: '',
          confirmPassword: '',
          schoolName: '',
          principalName: '',
          contactPhone: '',
          city: '',
          state: '',
          board: 'CBSE'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(teacherFormData.email, teacherFormData.password);
      if (!error) {
        setShowTeacherLoginModal(false);
        setTeacherFormData({ email: '', password: '' });
        navigate('/teachers_dashboard');
      }
    } catch (error) {
      console.error('Teacher login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await login(schoolLoginFormData.email, schoolLoginFormData.password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error?.message || "Invalid credentials.",
          variant: "destructive",
        });
      } else {
        // First close the modal and clear the form
        setShowSchoolLoginModal(false);
        setSchoolLoginFormData({ email: '', password: '' });
        // Then show success message
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        // Wait for state updates to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        // Finally navigate
        navigate('/schools_dashboard', { replace: true });
      }
    } catch (error) {
      console.error('School login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherPasswordReset = async () => {
    setResettingTeacher(true);
    const { error } = await supabase.auth.resetPasswordForEmail(teacherFormData.email);
    setResettingTeacher(false);
    if (error) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset Email Sent", description: "Check your email for a reset link." });
    }
  };

  const handleDemoInput = (e) => {
    setDemoForm({ ...demoForm, [e.target.name]: e.target.value });
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoError('');
    setDemoSuccess('');
    setDemoLoading(true);
    // Basic validation
    if (!demoForm.name || !demoForm.email || !demoForm.school || !demoForm.phone || !demoForm.datetime) {
      setDemoError('Please fill all fields.');
      setDemoLoading(false);
      return;
    }
    try {
      // 1. Insert into Supabase
      const { error: dbError } = await supabase.from('demo_requests').insert([
        {
          name: demoForm.name,
          email: demoForm.email,
          school_name: demoForm.school,
          contact_phone: demoForm.phone,
          preferred_datetime: demoForm.datetime
        }
      ]);
      if (dbError) {
        setDemoError('Failed to save request. Please try again.');
        setDemoLoading(false);
        return;
      }
      // 2. Send email via EmailJS
      try {
        console.log('Sending EmailJS:', {
          service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
          template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          user: import.meta.env.VITE_EMAILJS_USER_ID,
          data: {
            name: demoForm.name,
            email: demoForm.email,
            school: demoForm.school,
            phone: demoForm.phone,
            datetime: demoForm.datetime
          }
        });
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            name: demoForm.name,
            email: demoForm.email,
            school: demoForm.school,
            phone: demoForm.phone,
            datetime: demoForm.datetime
          },
          import.meta.env.VITE_EMAILJS_USER_ID
        );
        setDemoSuccess('Request submitted! We will contact you soon.');
        setDemoForm({ name: '', email: '', school: '', phone: '', datetime: '' });
        setShowDemoModal(false);
        toast({ title: 'Demo Request Sent', description: 'We will contact you soon.' });
      } catch (emailError) {
        // Log the error object and its properties
        console.error('EmailJS error:', emailError);
        if (emailError && typeof emailError === 'object') {
          for (const key in emailError) {
            if (Object.prototype.hasOwnProperty.call(emailError, key)) {
              console.error(`EmailJS error property [${key}]:`, emailError[key]);
            }
          }
        }
        setDemoError('Request saved, but failed to send email.');
      }
    } catch (err) {
      setDemoError('Unexpected error. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleContactInput = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');
    setContactLoading(true);
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError('Please fill all fields.');
      setContactLoading(false);
      return;
    }
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
        {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      setContactSuccess('Message sent! We will get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
      setShowContactModal(false);
      toast({ title: 'Contact Message Sent', description: 'We will get back to you soon.' });
    } catch (err) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/')} 
            className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setShowSchoolLoginModal(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-full sm:w-auto"
            >
              <LogIn className="w-4 h-4 mr-2" />
              School Login
            </Button>
            <Button
              onClick={() => setShowTeacherLoginModal(true)}
              variant="outline"
              className="border-siksha-purple text-siksha-purple hover:bg-siksha-purple hover:text-white w-full sm:w-auto"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Teacher Login
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
              <School className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
            Siksha AI for
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Schools & Teachers
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Transform your educational institution with our comprehensive AI-powered learning platform. 
            Empower teachers, engage students, and elevate learning outcomes across your entire school.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg w-full sm:w-auto"
              onClick={() => {
                setShowSchoolAuthModal(true);
              }}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register Your School
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto"
              onClick={() => setShowDemoModal(true)}
            >
              Schedule Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Everything Your School Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="text-center pb-2 sm:pb-4">
                  <div className="flex justify-center mb-2 sm:mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-10 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                Why Schools Choose Siksha AI
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Transform Your School?</h3>
                <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Join hundreds of schools already using Siksha AI to revolutionize their educational approach. 
                  Get started with a free consultation and see the difference AI can make.
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 w-full"
                  onClick={() => {
                    setShowSchoolAuthModal(true);
                  }}
                >
                  Get Started Today
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
            Trusted by Educational Leaders
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">500+</div>
              <div className="text-gray-600 text-xs sm:text-base">Partner Schools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">10K+</div>
              <div className="text-gray-600 text-xs sm:text-base">Active Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">100K+</div>
              <div className="text-gray-600 text-xs sm:text-base">Students Benefited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">95%</div>
              <div className="text-gray-600 text-xs sm:text-base">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Contact us to learn more about bringing Siksha AI to your school and revolutionizing education for your students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-siksha-purple hover:bg-siksha-purple-dark text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              onClick={() => setShowContactModal(true)}
            >
              Contact Sales Team
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              onClick={() => window.open('mailto:amprofessional2005a@gmail.com')}
            >
              Email Us
            </Button>
          </div>
        </div>
      </div>

      {/* School Auth Modal */}
      <Dialog open={showSchoolAuthModal} onOpenChange={setShowSchoolAuthModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              Register Your School
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSchoolAuth} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="Enter school name"
                value={schoolFormData.schoolName}
                onChange={(e) => setSchoolFormData({...schoolFormData, schoolName: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={schoolFormData.city}
                  onChange={(e) => setSchoolFormData({...schoolFormData, city: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={schoolFormData.state}
                  onChange={(e) => setSchoolFormData({...schoolFormData, state: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="school@example.com"
                value={schoolFormData.email}
                onChange={(e) => setSchoolFormData({...schoolFormData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={schoolFormData.password}
                onChange={(e) => setSchoolFormData({...schoolFormData, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={schoolFormData.confirmPassword}
                onChange={(e) => setSchoolFormData({...schoolFormData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSchoolAuthModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Processing...' : 'Register School'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Teacher Login Modal */}
      <Dialog open={showTeacherLoginModal} onOpenChange={setShowTeacherLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              Teacher Login
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-email">Email Address</Label>
              <Input
                id="teacher-email"
                type="email"
                placeholder="teacher@school.com"
                value={teacherFormData.email}
                onChange={(e) => setTeacherFormData({...teacherFormData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="teacher-password">Password</Label>
                <a
                  href="#"
                  className="text-xs text-siksha-purple hover:underline"
                  onClick={e => {
                    e.preventDefault();
                    handleTeacherPasswordReset();
                  }}
                >
                  {resettingTeacher ? 'Sending...' : 'Forgot password?'}
                </a>
              </div>
              <Input
                id="teacher-password"
                type="password"
                placeholder="Enter password"
                value={teacherFormData.password}
                onChange={(e) => setTeacherFormData({...teacherFormData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTeacherLoginModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* School Login Modal */}
      <Dialog open={showSchoolLoginModal} onOpenChange={setShowSchoolLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              School Login
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSchoolLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-login-email">Email Address</Label>
              <Input
                id="school-login-email"
                type="email"
                placeholder="school@example.com"
                value={schoolLoginFormData.email}
                onChange={(e) => setSchoolLoginFormData({ ...schoolLoginFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-login-password">Password</Label>
              <Input
                id="school-login-password"
                type="password"
                placeholder="Enter password"
                value={schoolLoginFormData.password}
                onChange={(e) => setSchoolLoginFormData({ ...schoolLoginFormData, password: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSchoolLoginModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Demo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Name</Label>
              <Input id="demo-name" name="name" value={demoForm.name} onChange={handleDemoInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input id="demo-email" name="email" type="email" value={demoForm.email} onChange={handleDemoInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-school">School Name</Label>
              <Input id="demo-school" name="school" value={demoForm.school} onChange={handleDemoInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-phone">Contact Phone</Label>
              <Input id="demo-phone" name="phone" value={demoForm.phone} onChange={handleDemoInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-datetime">Preferred Date/Time</Label>
              <Input id="demo-datetime" name="datetime" value={demoForm.datetime} onChange={handleDemoInput} required />
            </div>
            {demoError && <div className="text-red-500 text-sm">{demoError}</div>}
            {demoSuccess && <div className="text-green-600 text-sm">{demoSuccess}</div>}
            <Button type="submit" className="w-full bg-blue-600 text-white" disabled={demoLoading}>
              {demoLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Sales Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" name="name" value={contactForm.name} onChange={handleContactInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" name="email" type="email" value={contactForm.email} onChange={handleContactInput} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                name="message"
                value={contactForm.message}
                onChange={handleContactInput}
                required
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-siksha-purple focus:border-siksha-purple"
                placeholder="Type your message here..."
              />
            </div>
            {contactError && <div className="text-red-500 text-sm">{contactError}</div>}
            {contactSuccess && <div className="text-green-600 text-sm">{contactSuccess}</div>}
            <Button type="submit" className="w-full bg-siksha-purple text-white" disabled={contactLoading}>
              {contactLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schools;
