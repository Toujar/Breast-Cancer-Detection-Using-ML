'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  Heart,
  ArrowLeft,
  Download,
  Share2,
  Brain,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Loader2,
  Hospital,
  Stethoscope,
  Activity,
  Shield,
  Target,
  Award,
  Info,
  Phone,
  Users,
  Star,
  LogOut,
  Calendar,
  MapPin
} from 'lucide-react';
import { UserNotifications } from '@/components/user-notifications';
import { AllDoctorsSection } from '@/components/all-doctors-section';

interface PredictionResult {
  id: string;
  type: 'tabular' | 'image' | 'multimodal';
  prediction: 'benign' | 'malignant';
  confidence: number;
  inputData?: any;
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    version?: string;
    algorithm?: string;
  };
  gradcam?: string | null;
  shap?: string | null;
  timestamp: string;
  userId: string;
}

export default function ResultsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const predictionId = params.id as string;

  useEffect(() => {
    // Middleware handles authentication, pollForResult when user is loaded
    if (isLoaded && user) {
      pollForResult();
    }
  }, [isLoaded, user, predictionId]);

  const pollForResult = async () => {
    setIsLoading(true);
    setError('');
    try {
      const maxAttempts = 20;
      const intervalMs = 750;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await fetch(`/api/results/${predictionId}?gradcam=true&shap=true`, { cache: 'no-store' });

        if (response.ok) {
          const data = await response.json();
          
          // Validate the response data structure
          if (data && typeof data === 'object' && data.id && data.prediction && data.confidence !== undefined) {
            // Ensure gradcam and shap are properly handled as optional
            const validatedResult: PredictionResult = {
              ...data,
              gradcam: data.gradcam || null,
              shap: data.shap || null
            };
            setResult(validatedResult);
            setIsLoading(false);
            return;
          } else {
            console.warn('Invalid result data structure received:', data);
            // Continue polling if data structure is invalid
          }
        }

        if (response.status === 401 || response.status === 403) {
          setError('You are not authorized to view this result.');
          setIsLoading(false);
          return;
        }

        if (response.status === 404) {
          setError('Result not found. It may have been deleted or is still being processed.');
          setIsLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

      setError('Result is still being prepared. Please try again in a moment.');
    } catch (error) {
      console.error('Error polling for result:', error);
      setError('Failed to load results. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const url = new URL(`/api/results/${predictionId}/pdf`, window.location.origin);
      const tokenParam = new URLSearchParams(window.location.search).get('token');
      if (tokenParam) url.searchParams.set('token', tokenParam);
      const response = await fetch(url.toString());
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `breast-cancer-analysis-${predictionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/results/${predictionId}/share`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      const shareUrl = data.shareUrl as string;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard');
    } catch (e) {
      alert('Failed to create share link');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Middleware handles authentication redirect, so if we reach here, user should be authenticated
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border border-gray-700/30 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white">Error Loading Results</h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={pollForResult} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-sm sm:text-base">Waiting for analysis result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Actions */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">AI Analysis Results</h1>
            <p className="text-sm sm:text-base text-gray-300">
              Analysis completed on {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={handleDownloadReport} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Download Report</span>
              <span className="xs:hidden">Download</span>
            </Button>
            <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <Card className={`mb-6 sm:mb-8 border border-gray-700/30 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl ${
          result.prediction === 'benign'
            ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-l-4 border-green-500'
            : 'bg-gradient-to-br from-red-900/40 to-pink-900/40 border-l-4 border-red-500'
        }`}>
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              {/* Result Icon */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg ${
                result.prediction === 'benign'
                  ? 'bg-green-500/20 border-4 border-green-400'
                  : 'bg-red-500/20 border-4 border-red-400'
              }`}>
                {result.prediction === 'benign' ? (
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
                ) : (
                  <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                )}
              </div>

              {/* Result Text */}
              <h2 className={`text-xl sm:text-3xl font-bold mb-3 sm:mb-4 px-2 ${
                result.prediction === 'benign' ? 'text-green-300' : 'text-red-300'
              }`}>
                {result.prediction === 'benign' ? '✅ No Cancer Detected' : '⚠️ Cancer Signs Found'}
              </h2>

              <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                {result.prediction === 'benign'
                  ? 'Great news! Your test shows no signs of breast cancer. Continue with regular checkups and maintain a healthy lifestyle.'
                  : 'Cancer symptoms detected. Please consult with a healthcare professional immediately for further evaluation and treatment options.'}
              </p>

              {/* Confidence */}
              <div className="bg-black/40 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-inner max-w-sm mx-auto border border-gray-600/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="font-semibold text-white text-sm sm:text-base">AI Confidence</span>
                  <Badge className={`text-xs sm:text-sm ${
                    result.prediction === 'benign' ? 'bg-green-900/50 text-green-300 border-green-600/30' : 'bg-red-900/50 text-red-300 border-red-600/30'
                  }`}>
                    {result.confidence.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={result.confidence}
                  className={`h-2 sm:h-3 bg-gray-700 ${
                    result.prediction === 'benign'
                      ? '[&>div]:bg-green-500'
                      : '[&>div]:bg-red-500'
                  }`}
                />
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  This shows how confident the AI model is about the prediction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grad-CAM Visualization (for image predictions) */}
        {result.type === 'image' && (
          <Card className="mb-6 sm:mb-8 shadow-lg border border-gray-700/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-gray-600/30 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">AI Visualization {result.gradcam ? '(Grad-CAM)' : '(Analysis Complete)'}</span>
                <span className="sm:hidden">AI Analysis {result.gradcam ? '(Visual)' : '(Complete)'}</span>
              </CardTitle>
              <CardDescription className="text-blue-100 text-sm sm:text-base">
                {result.gradcam 
                  ? 'This heatmap shows which areas the AI focused on when making its prediction'
                  : 'AI analysis completed successfully - visualization not available for this analysis'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {result.gradcam ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                  {/* Left Side - Explanation */}
                  <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                    <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-4 sm:p-6 rounded-xl border border-blue-600/30">
                      <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-blue-300 flex items-center gap-2">
                        <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="hidden sm:inline">Understanding the Heatmap</span>
                        <span className="sm:hidden">Heatmap Guide</span>
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-block w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full shadow-md flex-shrink-0"></span>
                          <span className="text-gray-300 text-sm sm:text-base"><strong>Red areas:</strong> High AI attention - Primary focus regions</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-block w-4 h-4 sm:w-6 sm:h-6 bg-yellow-500 rounded-full shadow-md flex-shrink-0"></span>
                          <span className="text-gray-300 text-sm sm:text-base"><strong>Yellow areas:</strong> Moderate attention - Secondary regions</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-block w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full shadow-md flex-shrink-0"></span>
                          <span className="text-gray-300 text-sm sm:text-base"><strong>Blue areas:</strong> Low attention - Background regions</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 sm:p-6 rounded-xl border border-gray-600/30 shadow-sm">
                      <h4 className="font-semibold text-white mb-2 sm:mb-3 text-base sm:text-lg">Why This Matters:</h4>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        This visualization helps doctors verify that the AI is focusing on the right anatomical structures 
                        and not making decisions based on irrelevant image artifacts or background noise. The heatmap 
                        provides transparency into the AI's decision-making process.
                      </p>
                    </div>
                    
                    <div className="bg-green-900/30 p-4 sm:p-6 rounded-xl border border-green-600/30">
                      <h4 className="font-semibold text-green-300 mb-2 sm:mb-3 text-base sm:text-lg">Clinical Value:</h4>
                      <ul className="space-y-1 sm:space-y-2 text-green-200">
                        <li className="flex items-start gap-2 text-sm sm:text-base">
                          <span className="text-green-400 font-bold mt-1 flex-shrink-0">•</span>
                          <span>Validates AI reasoning for medical professionals</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm sm:text-base">
                          <span className="text-green-400 font-bold mt-1 flex-shrink-0">•</span>
                          <span>Identifies regions of interest for further examination</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm sm:text-base">
                          <span className="text-green-400 font-bold mt-1 flex-shrink-0">•</span>
                          <span>Builds trust through explainable AI technology</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Side - Large Grad-CAM Image */}
                  <div className="flex flex-col items-center order-1 lg:order-2">
                    <div className="w-full max-w-sm sm:max-w-lg">
                      <img 
                        src={`data:image/png;base64,${result.gradcam}`}
                        alt="AI Attention Heatmap"
                        className="w-full h-auto rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-gray-600"
                        style={{ minHeight: '250px', maxHeight: '400px', objectFit: 'contain' }}
                        onError={(e) => {
                          console.error('Failed to load Grad-CAM image');
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-64 sm:h-96 bg-gray-800 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-600 flex items-center justify-center">
                                <div class="text-center text-gray-400">
                                  <div class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg class="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                  <p class="text-sm">Visualization unavailable</p>
                                  <p class="text-xs mt-1">Image data could not be loaded</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-sm text-gray-300 font-medium mb-1 sm:mb-2">
                        AI Attention Heatmap Overlay
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs sm:max-w-sm px-2">
                        Red regions indicate where the AI model focused most when making its prediction
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback UI when Grad-CAM is not available */
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-blue-900/30 rounded-full flex items-center justify-center border-2 border-blue-600/30">
                    <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                    AI Analysis Complete
                  </h3>
                  <p className="text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto px-4 text-sm sm:text-base">
                    The AI has successfully analyzed your image and provided a prediction with {result.confidence.toFixed(1)}% confidence. 
                    While the detailed visualization is not available for this analysis, the core prediction remains reliable and accurate.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 sm:p-6 rounded-xl border border-green-600/30">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-3 sm:mb-4" />
                      <h4 className="font-semibold text-green-300 mb-2 text-sm sm:text-base">Analysis Completed</h4>
                      <p className="text-green-200 text-xs sm:text-sm">
                        Your image has been processed using our advanced AI model with high accuracy standards.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 sm:p-6 rounded-xl border border-blue-600/30">
                      <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-3 sm:mb-4" />
                      <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">Reliable Results</h4>
                      <p className="text-blue-200 text-xs sm:text-sm">
                        The prediction accuracy remains unaffected. Consult with healthcare professionals for next steps.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-yellow-900/30 rounded-lg border border-yellow-600/30 max-w-2xl mx-auto">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-200 text-xs sm:text-sm">
                      <strong>Note:</strong> Visualization features may be temporarily unavailable due to system optimization for faster processing. 
                      This does not affect the accuracy or reliability of your results.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        

        {/* Clinical Interpretation */}
        <Card className="mb-6 sm:mb-8 shadow-lg border border-gray-700/30 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-600/30 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Clinical Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {result.prediction === 'benign' ? (
              <Alert className="border-green-600/30 bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  <strong>Benign Classification:</strong> The AI analysis indicates characteristics consistent with non-cancerous tissue.
                  However, this should not replace professional medical evaluation. Continue with regular screening as recommended by your healthcare provider.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-600/30 bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  <strong>Malignant Classification:</strong> The AI analysis has detected patterns that may indicate cancerous tissue.
                  Immediate follow-up with a qualified oncologist is strongly recommended for comprehensive evaluation and treatment planning.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">⚠️ Important Medical Disclaimer</h4>
              <p className="text-xs sm:text-sm text-blue-200">
                This AI analysis is intended as a screening tool to assist healthcare professionals.
                It should not be used as the sole basis for diagnosis or treatment decisions.
                Always consult with qualified medical professionals for proper diagnosis and care.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Consultation Section */}
        <Card className="mb-6 sm:mb-8 shadow-lg border-2 border-green-600/30 bg-black/40 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b border-gray-600/30 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Book Appointment with Verified Doctors</span>
              <span className="sm:hidden">Book Doctor Appointment</span>
            </CardTitle>
            <CardDescription className="text-green-100 text-sm sm:text-base">
              Connect with certified oncologists and breast cancer specialists
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">Your AI Screening Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div className="text-center p-2 sm:p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300 text-xs sm:text-sm">Risk Level</p>
                  <p className={`font-bold text-sm sm:text-base ${result.prediction === 'benign' ? 'text-green-400' : 'text-red-400'}`}>
                    {result.prediction === 'benign' ? 'Low' : 'High'}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300 text-xs sm:text-sm">AI Confidence</p>
                  <p className="font-bold text-blue-400 text-sm sm:text-base">{result.confidence.toFixed(1)}%</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300 text-xs sm:text-sm">Recommendation</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-200">
                    {result.prediction === 'benign' ? 'Regular checkup' : 'Immediate consultation'}
                  </p>
                </div>
              </div>
            </div>

            <AllDoctorsSection 
              userLocation={user?.publicMetadata?.location as string} 
              aiResult={{
                riskLevel: result.prediction === 'benign' ? 'Low' : 'High',
                confidence: result.confidence,
                summary: `AI analysis shows ${result.prediction} classification with ${result.confidence.toFixed(1)}% confidence`,
                predictionId: result.id
              }}
            />
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-gray-600/30">
          <CardContent className="p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">What Would You Like to Do Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Link href="/predict/tabular" className="block">
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4" />
                  <h4 className="font-bold text-center mb-2 text-sm sm:text-base">New Data Analysis</h4>
                  <p className="text-xs sm:text-sm text-center opacity-90">Upload patient data for AI analysis</p>
                </div>
              </Link>
              <Link href="/predict/image" className="block">
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4" />
                  <h4 className="font-bold text-center mb-2 text-sm sm:text-base">New Image Analysis</h4>
                  <p className="text-xs sm:text-sm text-center opacity-90">Upload medical images for detection</p>
                </div>
              </Link>
              <Link href="/history" className="block">
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4" />
                  <h4 className="font-bold text-center mb-2 text-sm sm:text-base">View History</h4>
                  <p className="text-xs sm:text-sm text-center opacity-90">Access all your previous reports</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Final Message */}
        <Card className={`border border-gray-700/30 shadow-lg backdrop-blur-xl ${
          result.prediction === 'benign' 
            ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40' 
            : 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40'
        }`}>
          <CardContent className="p-4 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-black/40 rounded-full flex items-center justify-center shadow-lg border border-gray-600/30">
              {result.prediction === 'benign' ? (
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              ) : (
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              )}
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3 px-2">
              {result.prediction === 'benign'
                ? '🎉 Stay Healthy & Keep Smiling!'
                : '💪 You Are Not Alone in This Journey'}
            </h3>
            <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
              {result.prediction === 'benign'
                ? 'Your results look great! Continue with regular checkups and maintain a healthy lifestyle.'
                : 'Early detection saves lives. With proper treatment and support, many people successfully overcome breast cancer.'}
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <Badge className="px-2 sm:px-4 py-1 sm:py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30 text-xs sm:text-sm">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Trusted by 10,000+ users</span>
                <span className="xs:hidden">10k+ Users</span>
              </Badge>
              <Badge className="px-2 sm:px-4 py-1 sm:py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30 text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">HIPAA Compliant</span>
                <span className="xs:hidden">HIPAA</span>
              </Badge>
              <Badge className="px-2 sm:px-4 py-1 sm:py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30 text-xs sm:text-sm">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {result.modelMetrics.accuracy}% Accuracy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}