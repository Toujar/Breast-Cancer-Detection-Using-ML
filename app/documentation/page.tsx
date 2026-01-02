'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  BarChart3, 
  Shield, 
  Download,
  CheckCircle,
  HelpCircle,
  Users,
  Brain
} from 'lucide-react';

export default function DocumentationPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-4">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Complete guide for using the AI Breast Cancer Detection platform
          </p>
        </div>

        {/* Introduction */}
        <Card className="border border-gray-700/30 shadow-2xl mb-8 bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span>Welcome to AI Breast Cancer Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-300 leading-relaxed">
              This advanced AI-powered platform provides comprehensive breast cancer detection and analysis 
              capabilities. Our system combines cutting-edge machine learning algorithms with medical imaging 
              technology to assist healthcare professionals and patients in early detection and diagnosis.
            </p>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="border border-gray-700/30 shadow-2xl mb-8 bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Follow these steps to begin using the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-400 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Account Setup</h3>
                  <p className="text-gray-400">Create your secure account using our authentication system. Your data is protected with enterprise-grade security.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                  <span className="text-green-400 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Choose Analysis Method</h3>
                  <p className="text-gray-400">Navigate to the Prediction Center to select between image analysis or data-based prediction methods.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-400 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Review Results</h3>
                  <p className="text-gray-400">Access comprehensive results, analytics, and history from your personalized dashboard.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border border-gray-700/30 shadow-2xl mb-8 bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Brain className="h-6 w-6 text-purple-400" />
              <span>Platform Features</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Advanced AI capabilities and tools</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Upload className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Image Analysis</h3>
                    <p className="text-gray-400 text-sm">Advanced CNN models for medical image analysis with 97.6% accuracy rate.</p>
                    <Badge className="mt-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">Deep Learning</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Data Analysis</h3>
                    <p className="text-gray-400 text-sm">Machine learning algorithms for clinical data processing and prediction.</p>
                    <Badge className="mt-2 bg-green-500/20 text-green-400 border border-green-500/30">ML Algorithm</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Analytics Dashboard</h3>
                    <p className="text-gray-400 text-sm">Comprehensive analytics, trends, and performance metrics visualization.</p>
                    <Badge className="mt-2 bg-orange-500/20 text-orange-400 border border-orange-500/30">Analytics</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Download className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Export & Sharing</h3>
                    <p className="text-gray-400 text-sm">PDF export, secure sharing links, and comprehensive result documentation.</p>
                    <Badge className="mt-2 bg-purple-500/20 text-purple-400 border border-purple-500/30">Export</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-red-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Security & Privacy</h3>
                    <p className="text-gray-400 text-sm">HIPAA-compliant security measures and encrypted data storage.</p>
                    <Badge className="mt-2 bg-red-500/20 text-red-400 border border-red-500/30">HIPAA</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-teal-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Role-Based Access</h3>
                    <p className="text-gray-400 text-sm">Secure multi-role system for patients, doctors, and administrators.</p>
                    <Badge className="mt-2 bg-teal-500/20 text-teal-400 border border-teal-500/30">Multi-Role</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <HelpCircle className="h-6 w-6 text-yellow-400" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Common questions and answers</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500/30 pl-4">
                <h3 className="font-semibold text-white mb-2">What image formats are supported?</h3>
                <p className="text-gray-400">
                  We support PNG, JPEG, and DICOM formats up to 10MB. Images should be high-quality medical scans 
                  for optimal analysis accuracy.
                </p>
              </div>
              <div className="border-l-4 border-green-500/30 pl-4">
                <h3 className="font-semibold text-white mb-2">How accurate are the AI predictions?</h3>
                <p className="text-gray-400">
                  Our image analysis model achieves 97.6% accuracy, while our data analysis model reaches 95.2% accuracy. 
                  These results are based on extensive validation with medical datasets.
                </p>
              </div>
              <div className="border-l-4 border-purple-500/30 pl-4">
                <h3 className="font-semibold text-white mb-2">Can I download and share my results?</h3>
                <p className="text-gray-400">
                  Yes, you can export results as PDF reports and generate secure sharing links for healthcare providers. 
                  All sharing is HIPAA-compliant and encrypted.
                </p>
              </div>
              <div className="border-l-4 border-orange-500/30 pl-4">
                <h3 className="font-semibold text-white mb-2">Is my medical data secure?</h3>
                <p className="text-gray-400">
                  Absolutely. We implement enterprise-grade security with end-to-end encryption, HIPAA compliance, 
                  and secure cloud infrastructure to protect all medical information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
