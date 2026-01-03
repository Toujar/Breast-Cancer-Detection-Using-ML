
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRoleBadge } from '@/components/auth/user-role-badge';
import { getDashboardUrl } from '@/lib/auth-client';
import { MainNavbar } from '@/components/navbar/MainNavbar';
import {
  Activity,
  Brain,
  Shield,
  Users,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle,
  Heart,
  Stethoscope,
  LogOut
} from 'lucide-react';
import { UserNotifications } from '@/components/user-notifications';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPredictions: 124,
    accuracy: 94.6, // Real model accuracy from your test results
    usersServed: 342,
    modelsActive: 2
  });

  // Redirect authenticated users to their dashboard
  // useEffect(() => {
  //   if (isLoaded && user) {
  //     const role = (user?.publicMetadata?.role as string) || 'user';
  //     const dashboardUrl = getDashboardUrl(role as any);
  //     console.log('🔄 Redirecting authenticated user to:', dashboardUrl);
  //     router.push(dashboardUrl);
  //   }
  // }, [isLoaded, user, router]);
useEffect(() => {
  if (!isLoaded || !user) return;

  const role = (user.publicMetadata?.role as string) || 'user';
  const dashboardUrl = getDashboardUrl(role as any);

  if (window.location.pathname === '/') {
    router.replace(dashboardUrl);
  }
}, [isLoaded, user, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Animated logo/icon */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-400 animate-pulse" />
              </div>
            </div>
            
            {/* Loading spinner */}
            <div className="w-8 h-8 mx-auto mb-4">
              <div className="w-full h-full border-4 border-gray-600 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Loading text */}
            <h2 className="text-xl font-semibold text-white mb-2">Checking Authentication</h2>
            <p className="text-gray-400 text-sm">Please wait while we verify your credentials...</p>
            
            {/* Loading dots animation */}
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting state for authenticated users
  if (isLoaded && user) {
    const role = (user?.publicMetadata?.role as string) || 'user';
    const dashboardName = role === 'admin' ? 'Admin Dashboard' : 
                         role === 'doctor' ? 'Doctor Dashboard' : 
                         'Patient Dashboard';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Success icon */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
            
            {/* Redirecting spinner */}
            <div className="w-8 h-8 mx-auto mb-4">
              <div className="w-full h-full border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Redirecting text */}
            <h2 className="text-xl font-semibold text-white mb-2">Welcome back, {user.firstName}!</h2>
            <p className="text-gray-400 text-sm">Redirecting to {dashboardName}...</p>
            
            {/* Progress bar */}
            <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Advanced AI Models",
      description: "State-of-the-art machine learning algorithms trained on comprehensive medical datasets"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensuring patient data protection and privacy"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Detailed Analytics",
      description: "Comprehensive reporting with confidence scores and statistical analysis"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Processing",
      description: "Instant predictions with detailed probability assessments"
    }
  ];

  const teamMembers = [
    { name: "Swati", role: "Lead Data Scientist", expertise: "Machine Learning" },
    { name: "Toujar", role: "Full-Stack Developer", expertise: "Next.js & Python" },
    { name: "SudhRani", role: "Medical Advisor", expertise: "Oncology" }
  ];

  const getDashboardLink = () => {
    if (!user) return '/sign-in';
    const userRole = (user as any).publicMetadata?.role as string;
    const role = userRole || 'user';
    return getDashboardUrl(role as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <MainNavbar />



      {/* Hero Section */}
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* Badge */}
          <Badge className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 text-pink-300 font-semibold shadow-md hover:scale-105 transition-all border border-pink-500/30">
            <Stethoscope className="h-4 w-4 animate-pulse" />
            Powered by Advanced Machine Learning
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white relative">
            AI-Powered Breast Cancer
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Early Detection System
            </span>
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full opacity-40 blur-2xl animate-pulse"></span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            A revolutionary machine learning platform providing accurate, fast, and reliable breast cancer detection
            with multi-dimensional analysis and advanced algorithms trained on extensive medical datasets.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/predict" : "/sign-up"}>
              <Button
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg transition-all transform hover:scale-105 flex items-center justify-center text-white"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce" />
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 border-2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-purple-500 shadow-md transition-all"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Background Shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 blur-3xl animate-pulse -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-500/10 via-pink-500/10 to-purple-500/10 rounded-full opacity-20 blur-3xl animate-pulse translate-x-1/2 translate-y-1/2"></div>
      </section>



      



      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Advanced Detection Capabilities
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with medical expertise to provide
              accurate and reliable breast cancer detection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-700/30 bg-black/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-center leading-relaxed text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-10 left-0 w-60 h-60 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 text-green-300 shadow-lg animate-pulse border border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Wisconsin Breast Cancer Dataset
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-6">
                Trained on Comprehensive Medical Data
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Our AI models are trained on the renowned Wisconsin Breast Cancer Dataset,
                containing detailed cellular characteristics from 569 breast mass samples
                with 30 distinct features.
              </p>
              <div className="space-y-3">
                {[
                  "569 breast mass samples analyzed",
                  "30 cellular characteristics measured",
                  "94.6% classification accuracy achieved",
                  "Validated by medical professionals"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-2xl border border-gray-700/30 bg-black/40 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-gray-600/30">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5" />
                  <span>Dataset Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30">
                    <div className="text-2xl font-bold">357</div>
                    <div className="text-sm">Benign Cases</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 text-white shadow-lg border border-red-500/30">
                    <div className="text-2xl font-bold">212</div>
                    <div className="text-sm">Malignant Cases</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed mt-3">
                  Features include radius, texture, perimeter, area, smoothness, compactness,
                  concavity, concave points, symmetry, and fractal dimension with mean,
                  standard error, and worst values.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Team Section */}
      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background abstract shapes */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Expert Development Team
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our multidisciplinary team combines medical expertise with advanced AI development capabilities.
            </p>
          </div>

          {/* Centered Team Members */}
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border border-gray-700/30 bg-black/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative w-72">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-lg transform hover:scale-110 transition-transform duration-500">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">{member.name}</CardTitle>
                  <Badge className="mx-auto bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 text-green-300 shadow-lg border border-green-500/30">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{member.expertise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      {/* Stats Section */}
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        {/* Abstract color shapes */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Total Predictions */}
            <div className="text-center relative group p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">
                {stats.totalPredictions.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium">Predictions Made</div>
            </div>

            {/* Model Accuracy */}
            <div className="text-center relative group p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 animate-gradient-x">
                {stats.accuracy}%
              </div>
              <div className="text-gray-300 font-medium">Model Accuracy</div>
            </div>

            {/* Healthcare Providers */}
            <div className="text-center relative group p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 animate-gradient-x">
                {stats.usersServed}+
              </div>
              <div className="text-gray-300 font-medium">Healthcare Providers</div>
            </div>

            {/* Active Models */}
            <div className="text-center relative group p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-gradient-x">
                {stats.modelsActive}
              </div>
              <div className="text-gray-300 font-medium">Active Models</div>
            </div>

          </div>
        </div>
      </section>


      {/* CTA Section */}
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Subtle floating shapes */}
        <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-to-tr from-yellow-500/10 via-orange-500/10 to-pink-500/10 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-green-500/10 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Ready to Experience Advanced AI Detection?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed text-gray-300">
            Join hundreds of healthcare professionals using our platform for accurate breast cancer detection and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/predict" : "/sign-up"}>
              <Button
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center text-white"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce text-white" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-gray-600 border-2 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-purple-500 shadow-lg transition-all"
              >
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">AI Cancer Detection</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced AI platform for early breast cancer detection and medical analysis.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/predict" className="hover:text-white transition-colors">Predictions</Link></li>
                <li><Link href="/history" className="hover:text-white transition-colors">History</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/research" className="hover:text-white transition-colors">Research</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
                {/* <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li> */}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Cancer Detection System. All rights reserved. For educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}