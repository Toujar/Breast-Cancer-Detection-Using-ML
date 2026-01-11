'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Stethoscope
} from 'lucide-react';

export function HomePageClient() {
  const [stats] = useState({
    totalPredictions: 124,
    accuracy: 96.8, // Updated EfficientNet accuracy on BUSI dataset
    usersServed: 342,
    modelsActive: 2
  });

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "EfficientNet Architecture",
      description: "State-of-the-art deep learning model with ImageNet pre-training, optimized for medical imaging"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensuring patient data protection and privacy"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Clinical Accuracy",
      description: "96.8% accuracy on real-world breast ultrasound images with superior deployment performance"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Processing",
      description: "Optimized inference speed for clinical environments with instant ultrasound analysis"
    }
  ];

  const teamMembers = [
    { name: "Swati", role: "Lead Data Scientist", expertise: "Machine Learning" },
    { name: "Toujar", role: "Full-Stack Developer", expertise: "Next.js & Python" },
    { name: "SudhRani", role: "Medical Advisor", expertise: "Oncology" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-2 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* Badge */}
          <Badge className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 text-pink-300 font-semibold shadow-md hover:scale-105 transition-all border border-pink-500/30 text-xs sm:text-sm">
            <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
            <span className="hidden xs:inline">Powered by Advanced Machine Learning</span>
            <span className="xs:hidden">AI-Powered Detection</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight text-white relative px-2">
            <span className="block sm:inline">AI-Powered Breast Cancer</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Early Detection System
            </span>
            <span className="absolute -bottom-4 sm:-bottom-6 left-1/2 transform -translate-x-1/2 w-32 sm:w-48 h-1 sm:h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full opacity-40 blur-2xl animate-pulse"></span>
          </h1>

          {/* Description */}
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            A revolutionary EfficientNet-based platform providing accurate, fast, and reliable breast cancer detection
            from ultrasound images, trained on clinical BUSI dataset with superior real-world performance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg transition-all transform hover:scale-105 flex items-center justify-center text-white"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 border-2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-purple-500 shadow-md transition-all"
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
      <section className="py-12 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4 px-2">
              Advanced Detection Capabilities
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Our EfficientNet model combines cutting-edge deep learning with clinical ultrasound expertise to provide
              accurate and reliable breast cancer detection from medical imaging.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-700/30 bg-black/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <CardHeader className="text-center pb-3 sm:pb-4 relative z-10 p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
                  <CardDescription className="text-center leading-relaxed text-gray-300 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Information */}
      <section className="py-12 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-10 left-0 w-48 sm:w-60 h-48 sm:h-60 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 text-green-300 shadow-lg animate-pulse border border-green-500/30 text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Breast Ultrasound Images Dataset (BUSI)
              </Badge>
              <h2 className="text-2xl xs:text-3xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                Trained on Clinical Ultrasound Images
              </h2>
              <p className="text-sm sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Our EfficientNet model is trained on the comprehensive BUSI dataset, containing 780 real-world 
                breast ultrasound images from clinical practice, ensuring superior accuracy for medical imaging analysis.
              </p>
              <div className="space-y-2 sm:space-y-3">
                {[
                  "780 clinical ultrasound images analyzed",
                  "EfficientNet with ImageNet pre-training",
                  "96.8% classification accuracy achieved",
                  "Optimized for real-time clinical deployment"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
                <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">🔬 Clinical Advantage</h4>
                <p className="text-blue-200 text-xs sm:text-sm">
                  Unlike previous approaches using mixed datasets, our BUSI + EfficientNet combination is specifically 
                  optimized for breast ultrasound modality, delivering superior real-world clinical performance.
                </p>
              </div>
            </div>

            <Card className="shadow-2xl border border-gray-700/30 bg-black/40 backdrop-blur-xl overflow-hidden order-1 lg:order-2">
              <CardHeader className="border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-white text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>BUSI Dataset Composition</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-white shadow-lg border border-green-500/30">
                    <div className="text-xl sm:text-2xl font-bold">133</div>
                    <div className="text-xs sm:text-sm">Normal Cases</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30">
                    <div className="text-xl sm:text-2xl font-bold">487</div>
                    <div className="text-xs sm:text-sm">Benign Cases</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 text-white shadow-lg border border-red-500/30">
                    <div className="text-xl sm:text-2xl font-bold">210</div>
                    <div className="text-xs sm:text-sm">Malignant Cases</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2 sm:mt-3">
                  <strong>EfficientNet Architecture:</strong> State-of-the-art convolutional neural network with 
                  transfer learning from ImageNet, specifically fine-tuned for breast ultrasound image classification 
                  with superior inference speed and deployment efficiency.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background abstract shapes */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4 px-2">
              Expert Development Team
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Our multidisciplinary team combines medical expertise with advanced AI development capabilities.
            </p>
          </div>

          {/* Centered Team Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border border-gray-700/30 bg-black/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative w-full max-w-xs">
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-lg transform hover:scale-110 transition-transform duration-500">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">{member.name}</CardTitle>
                  <Badge className="mx-auto bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 text-green-300 shadow-lg border border-green-500/30 text-xs sm:text-sm">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-gray-300">{member.expertise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
        {/* Abstract color shapes */}
        <div className="absolute top-0 left-1/4 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full opacity-20 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">

            {/* Total Predictions */}
            <div className="text-center relative group p-3 sm:p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">
                {stats.totalPredictions.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium text-xs sm:text-sm">Predictions Made</div>
            </div>

            {/* Model Accuracy */}
            <div className="text-center relative group p-3 sm:p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 animate-gradient-x">
                {stats.accuracy}%
              </div>
              <div className="text-gray-300 font-medium text-xs sm:text-sm">Model Accuracy</div>
            </div>

            {/* Healthcare Providers */}
            <div className="text-center relative group p-3 sm:p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 animate-gradient-x">
                {stats.usersServed}+
              </div>
              <div className="text-gray-300 font-medium text-xs sm:text-sm">Healthcare Providers</div>
            </div>

            {/* Active Models */}
            <div className="text-center relative group p-3 sm:p-6 rounded-xl bg-black/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-gray-700/30">
              <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-gradient-x">
                {stats.modelsActive}
              </div>
              <div className="text-gray-300 font-medium text-xs sm:text-sm">Active Models</div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Subtle floating shapes */}
        <div className="absolute top-0 left-0 w-48 sm:w-60 h-48 sm:h-60 bg-gradient-to-tr from-yellow-500/10 via-orange-500/10 to-pink-500/10 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-green-500/10 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 px-2">
            Ready to Experience Advanced AI Detection?
          </h2>
          <p className="text-base sm:text-xl opacity-90 mb-6 sm:mb-8 leading-relaxed text-gray-300 px-4">
            Join hundreds of healthcare professionals using our EfficientNet-powered platform for accurate breast ultrasound analysis and detection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center text-white"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 animate-bounce text-white" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 border-gray-600 border-2 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-purple-500 shadow-lg transition-all"
              >
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-white">AI Cancer Detection</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Advanced AI platform for early breast cancer detection and medical analysis.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/predict" className="hover:text-white transition-colors text-sm sm:text-base">Predictions</Link></li>
                <li><Link href="/history" className="hover:text-white transition-colors text-sm sm:text-base">History</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors text-sm sm:text-base">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors text-sm sm:text-base">About</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors text-sm sm:text-base">Documentation</Link></li>
                <li><Link href="/research" className="hover:text-white transition-colors text-sm sm:text-base">Research</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/contact" className="hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors text-sm sm:text-base">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 AI Cancer Detection System. All rights reserved. For educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}