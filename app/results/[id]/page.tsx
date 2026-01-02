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
  gradcam?: string;
  shap?: string;
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
          setResult(data);
          setIsLoading(false);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setError('You are not authorized to view this result.');
          setIsLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

      setError('Result is still being prepared. Please try again in a moment.');
    } catch (error) {
      setError('Failed to load results');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="max-w-md border border-gray-700/30 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Results</h2>
            <p className="text-gray-300 mb-6">{error}</p>
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
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Waiting for analysis result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Analysis Results</h1>
            <p className="text-gray-300">
              Analysis completed on {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button onClick={handleDownloadReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <Card className={`mb-8 border border-gray-700/30 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl ${
          result.prediction === 'benign'
            ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-l-4 border-green-500'
            : 'bg-gradient-to-br from-red-900/40 to-pink-900/40 border-l-4 border-red-500'
        }`}>
          <CardContent className="p-8">
            <div className="text-center">
              {/* Result Icon */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${
                result.prediction === 'benign'
                  ? 'bg-green-500/20 border-4 border-green-400'
                  : 'bg-red-500/20 border-4 border-red-400'
              }`}>
                {result.prediction === 'benign' ? (
                  <CheckCircle className="h-10 w-10 text-green-400" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-red-400" />
                )}
              </div>

              {/* Result Text */}
              <h2 className={`text-3xl font-bold mb-4 ${
                result.prediction === 'benign' ? 'text-green-300' : 'text-red-300'
              }`}>
                {result.prediction === 'benign' ? '✅ No Cancer Detected' : '⚠️ Cancer Signs Found'}
              </h2>

              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                {result.prediction === 'benign'
                  ? 'Great news! Your test shows no signs of breast cancer. Continue with regular checkups and maintain a healthy lifestyle.'
                  : 'Cancer symptoms detected. Please consult with a healthcare professional immediately for further evaluation and treatment options.'}
              </p>

              {/* Confidence */}
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl shadow-inner max-w-md mx-auto border border-gray-600/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-white">AI Confidence</span>
                  <Badge className={`${
                    result.prediction === 'benign' ? 'bg-green-900/50 text-green-300 border-green-600/30' : 'bg-red-900/50 text-red-300 border-red-600/30'
                  }`}>
                    {result.confidence.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={result.confidence}
                  className={`h-3 bg-gray-700 ${
                    result.prediction === 'benign'
                      ? '[&>div]:bg-green-500'
                      : '[&>div]:bg-red-500'
                  }`}
                />
                <p className="text-sm text-gray-400 mt-2">
                  This shows how confident the AI model is about the prediction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grad-CAM Visualization (for image predictions) */}
        {result.type === 'image' && result.gradcam && (
          <Card className="mb-8 shadow-lg border border-gray-700/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-gray-600/30">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Visualization (Grad-CAM)
              </CardTitle>
              <CardDescription className="text-blue-100">
                This heatmap shows which areas the AI focused on when making its prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Side - Explanation */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-6 rounded-xl border border-blue-600/30">
                    <h3 className="font-bold text-xl mb-4 text-blue-300 flex items-center gap-2">
                      <Info className="h-6 w-6" />
                      Understanding the Heatmap
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-6 h-6 bg-red-500 rounded-full shadow-md"></span>
                        <span className="text-gray-300"><strong>Red areas:</strong> High AI attention - Primary focus regions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-6 h-6 bg-yellow-500 rounded-full shadow-md"></span>
                        <span className="text-gray-300"><strong>Yellow areas:</strong> Moderate attention - Secondary regions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-6 h-6 bg-blue-500 rounded-full shadow-md"></span>
                        <span className="text-gray-300"><strong>Blue areas:</strong> Low attention - Background regions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/60 p-6 rounded-xl border border-gray-600/30 shadow-sm">
                    <h4 className="font-semibold text-white mb-3 text-lg">Why This Matters:</h4>
                    <p className="text-gray-300 leading-relaxed">
                      This visualization helps doctors verify that the AI is focusing on the right anatomical structures 
                      and not making decisions based on irrelevant image artifacts or background noise. The heatmap 
                      provides transparency into the AI's decision-making process.
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 p-6 rounded-xl border border-green-600/30">
                    <h4 className="font-semibold text-green-300 mb-3 text-lg">Clinical Value:</h4>
                    <ul className="space-y-2 text-green-200">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-1">•</span>
                        <span>Validates AI reasoning for medical professionals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-1">•</span>
                        <span>Identifies regions of interest for further examination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-1">•</span>
                        <span>Builds trust through explainable AI technology</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Side - Large Grad-CAM Image */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-lg">
                    <img 
                      src={`data:image/png;base64,${result.gradcam}`}
                      alt="AI Attention Heatmap"
                      className="w-full h-auto rounded-2xl shadow-2xl border-4 border-gray-600"
                      style={{ minHeight: '400px', maxHeight: '600px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-300 font-medium mb-2">
                      AI Attention Heatmap Overlay
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm">
                      Red regions indicate where the AI model focused most when making its prediction
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* Clinical Interpretation */}
        <Card className="mb-8 shadow-lg border border-gray-700/30 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-600/30">
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Clinical Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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

            <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold text-blue-300 mb-2">⚠️ Important Medical Disclaimer</h4>
              <p className="text-sm text-blue-200">
                This AI analysis is intended as a screening tool to assist healthcare professionals.
                It should not be used as the sole basis for diagnosis or treatment decisions.
                Always consult with qualified medical professionals for proper diagnosis and care.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Consultation Section */}
        <Card className="mb-8 shadow-lg border-2 border-green-600/30 bg-black/40 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b border-gray-600/30">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Book Appointment with Verified Doctors
            </CardTitle>
            <CardDescription className="text-green-100">
              Connect with certified oncologists and breast cancer specialists
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold text-blue-300 mb-2">Your AI Screening Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300">Risk Level</p>
                  <p className={`font-bold ${result.prediction === 'benign' ? 'text-green-400' : 'text-red-400'}`}>
                    {result.prediction === 'benign' ? 'Low' : 'High'}
                  </p>
                </div>
                <div className="text-center p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300">AI Confidence</p>
                  <p className="font-bold text-blue-400">{result.confidence.toFixed(1)}%</p>
                </div>
                <div className="text-center p-3 bg-black/60 rounded border border-gray-600/30">
                  <p className="font-medium text-gray-300">Recommendation</p>
                  <p className="text-sm font-medium text-gray-200">
                    {result.prediction === 'benign' ? 'Regular checkup' : 'Immediate consultation'}
                  </p>
                </div>
              </div>
            </div>

            <AllDoctorsSection 
              userLocation={user?.location} 
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
        <Card className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-gray-600/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-6">What Would You Like to Do Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/predict/tabular" className="block">
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <FileText className="h-8 w-8 mx-auto mb-4" />
                  <h4 className="font-bold text-center mb-2">New Data Analysis</h4>
                  <p className="text-sm text-center opacity-90">Upload patient data for AI analysis</p>
                </div>
              </Link>
              <Link href="/predict/image" className="block">
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <Activity className="h-8 w-8 mx-auto mb-4" />
                  <h4 className="font-bold text-center mb-2">New Image Analysis</h4>
                  <p className="text-sm text-center opacity-90">Upload medical images for detection</p>
                </div>
              </Link>
              <Link href="/history" className="block">
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                  <Clock className="h-8 w-8 mx-auto mb-4" />
                  <h4 className="font-bold text-center mb-2">View History</h4>
                  <p className="text-sm text-center opacity-90">Access all your previous reports</p>
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
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-black/40 rounded-full flex items-center justify-center shadow-lg border border-gray-600/30">
              {result.prediction === 'benign' ? (
                <Heart className="h-8 w-8 text-green-400" />
              ) : (
                <Shield className="h-8 w-8 text-blue-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {result.prediction === 'benign'
                ? '🎉 Stay Healthy & Keep Smiling!'
                : '💪 You Are Not Alone in This Journey'}
            </h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
              {result.prediction === 'benign'
                ? 'Your results look great! Continue with regular checkups and maintain a healthy lifestyle.'
                : 'Early detection saves lives. With proper treatment and support, many people successfully overcome breast cancer.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge className="px-4 py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30">
                <Heart className="h-4 w-4 mr-2" />
                Trusted by 10,000+ users
              </Badge>
              <Badge className="px-4 py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30">
                <Shield className="h-4 w-4 mr-2" />
                HIPAA Compliant
              </Badge>
              <Badge className="px-4 py-2 bg-black/40 text-gray-300 shadow-md border border-gray-600/30">
                <Award className="h-4 w-4 mr-2" />
                {result.modelMetrics.accuracy}% Accuracy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}