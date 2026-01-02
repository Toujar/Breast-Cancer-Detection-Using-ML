'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import { FileText, Upload, Brain, Target } from 'lucide-react';

export default function PredictPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'image' | 'tabular'>('image');

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

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-4">
              AI Prediction Center
            </h1>
            <p className="text-gray-400 text-lg">
              Choose your analysis method to get started with AI-powered breast cancer detection
            </p>
          </div>

          <Card className="shadow-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/30">
            <CardHeader className="border-b border-gray-700/30">
              <CardTitle className="text-center text-2xl font-semibold text-white">
                Prediction Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Toggle Buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant={activeTab === 'image' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('image')}
                  className={`px-6 py-3 text-lg transition-all duration-300 ${
                    activeTab === 'image' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Image Analysis
                </Button>
                <Button
                  variant={activeTab === 'tabular' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('tabular')}
                  className={`px-6 py-3 text-lg transition-all duration-300 ${
                    activeTab === 'tabular' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Data Analysis
                </Button>
              </div>

              {/* Render Content */}
              <div className="border border-gray-700/30 rounded-xl p-8 bg-gray-900/50">
                {activeTab === 'image' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                      <Upload className="h-10 w-10 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-white">Image Analysis</h2>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Upload medical images for AI-powered analysis using our advanced deep learning models. 
                      Supports ultrasound, mammography, and other medical imaging formats.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1 text-green-400" />
                          <span>94.6% Accuracy</span>
                        </div>
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-1 text-blue-400" />
                          <span>Deep Learning</span>
                        </div>
                      </div>
                      <Link href="/predict/image">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 px-8 py-3 text-lg">
                          <Upload className="h-5 w-5 mr-2" />
                          Start Image Analysis
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                      <FileText className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-white">Data Analysis</h2>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Input clinical data and patient information for comprehensive analysis. 
                      Our machine learning models process multiple data points for accurate predictions.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1 text-green-400" />
                          <span>95.0% Accuracy</span>
                        </div>
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-1 text-blue-400" />
                          <span>ML Algorithm</span>
                        </div>
                      </div>
                      <Link href="/predict/tabular">
                        <Button className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 px-8 py-3 text-lg">
                          <FileText className="h-5 w-5 mr-2" />
                          Start Data Analysis
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
