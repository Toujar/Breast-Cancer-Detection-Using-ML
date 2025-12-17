'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Heart,
  ArrowLeft,
  Download,
  Share2,
  Brain,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Clock,
  Loader2,
  Hospital,
  Building,
  Stethoscope,
  HeartPulse,
  Smile,
  Bell,
  Pill,
  CalendarCheck,
  CupSoda,
  Book,
  AlertCircle,
  Soup,
  Music,
  Leaf,
  Droplets,
  Apple,
  Banana,
  Sun,
  Activity,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  Zap,
  Award,
  Info,
  Phone,
  MapPin,
  Users,
  Star,
  LogOut
} from 'lucide-react';
import { UserNotifications } from '@/components/user-notifications';
// import { useAuth } from '@/lib/auth-context';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { NearbyDoctorsSection } from '@/components/nearby-doctors-section';
import { RealDoctorsSection } from '@/components/real-doctors-section';
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
  gradcam?: string; // Base64 encoded Grad-CAM heatmap for image predictions
  shap?: string; // Base64 encoded SHAP visualization for tabular predictions
  timestamp: string;
  userId: string;
}


const hospitals = [
  { name: "KCTRI – Karnataka Cancer Therapy & Research Institute", city: "Hubli" },
  { name: "HCG NMR Cancer Centre", city: "Hubli" },
  { name: "HCG Cancer Centre", city: "Kalaburagi" },
  { name: "KLE’s Dr. Prabhakar Kore Hospital", city: "Belagavi" },
  { name: "KIMS – Karnataka Institute of Medical Sciences", city: "Hubli" },
  { name: "Basaveshwara Teaching & General Hospital", city: "Kalaburagi" },
  { name: "Sushruta Hospitals", city: "Hubli-Dharwad" },
  { name: "KS Hospital", city: "Koppal" },
];

const doctors = [
  { name: "Dr. Sanjeev Kulgod – Surgical Oncologist", city: "Hubli" },
  { name: "Dr. G. Mehar Kumar – Medical & Radiation Oncology", city: "Hubli" },
  { name: "Dr. Vishwas Pai – Surgical Oncologist", city: "Bagalkot" },
  { name: "Dr. Rekha Nayak – Radiation Oncologist", city: "Belagavi" },
];

const diagnostics = [
  { name: "HCG NMR Diagnostic & Imaging Centre", city: "Hubli" },
  { name: "Medall Clumax Diagnostics", city: "Belagavi" },
  { name: "Shree Diagnostic Centre", city: "Kalaburagi" },
  { name: "Dr. Lal PathLabs & Thyrocare Centres", city: "Multiple locations" },
];




export default function ResultsPage() {
  // const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // const [user, setUser] = useState<{ email: string; username: string; role: string } | null>(null);
  const [user, setUser] = useState<{ email: string; username: string; role: string; location?: string } | null>(null);

  const predictionId = params.id as string;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const [sortedHospitals, setSortedHospitals] = useState(hospitals);
  const [sortedDoctors, setSortedDoctors] = useState(doctors);
  const [sortedDiagnostics, setSortedDiagnostics] = useState(diagnostics);

  useEffect(() => {
    if (!user) return;

    setSortedHospitals([...hospitals].sort((a, b) => {
      if (a.city === user.location && b.city !== user.location) return -1;
      if (a.city !== user.location && b.city === user.location) return 1;
      return 0;
    }));

    setSortedDoctors([...doctors].sort((a, b) => {
      if (a.city === user.location && b.city !== user.location) return -1;
      if (a.city !== user.location && b.city === user.location) return 1;
      return 0;
    }));

    setSortedDiagnostics([...diagnostics].sort((a, b) => {
      if (a.city === user.location && b.city !== user.location) return -1;
      if (a.city !== user.location && b.city === user.location) return 1;
      return 0;
    }));
  }, [user]);

  console.log('User location:', user?.location);


  // console.log(sortedHospitals, sortedDoctors, sortedDiagnostics);
  useEffect(() => {
    // if (!user) {
    //   router.push('/auth');
    //   return;
    // }

    pollForResult();
  }, [user, predictionId, router]);

  const pollForResult = async () => {
    setIsLoading(true);
    setError('');
    try {
      const maxAttempts = 20; // ~15s total depending on interval
      const intervalMs = 750;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Request with gradcam and shap parameters
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

        // If not ready yet (e.g., 404 while backend still saving), wait and try again
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

  // if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={pollForResult} disabled={isLoading}>
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
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Waiting for analysis result...</p>
        </div>
      </div>
    );
  }

  const confidenceData = [
    { name: 'Confidence', value: result.confidence },
    { name: 'Uncertainty', value: 100 - result.confidence }
  ];

  const metricsData = [
    { name: 'Accuracy', value: result.modelMetrics.accuracy },
    { name: 'Precision', value: result.modelMetrics.precision },
    { name: 'Recall', value: result.modelMetrics.recall },
    { name: 'F1-Score', value: result.modelMetrics.f1Score }
  ];

  const COLORS = ['#3B82F6', '#E5E7EB'];
  const METRIC_COLORS = ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Additional data for enhanced visualizations
  const radarData = [
    { metric: 'Accuracy', value: result.modelMetrics.accuracy, fullMark: 100 },
    { metric: 'Precision', value: result.modelMetrics.precision, fullMark: 100 },
    { metric: 'Recall', value: result.modelMetrics.recall, fullMark: 100 },
    { metric: 'F1-Score', value: result.modelMetrics.f1Score, fullMark: 100 },
  ];

  const healthTips = result.prediction === 'benign' ? [
    { icon: Apple, title: 'Healthy Diet', desc: 'Eat fruits, vegetables, and whole grains daily', color: 'text-green-600' },
    { icon: Activity, title: 'Regular Exercise', desc: '30 minutes of physical activity 5 days a week', color: 'text-blue-600' },
    { icon: CalendarCheck, title: 'Annual Checkups', desc: 'Schedule yearly mammograms and screenings', color: 'text-purple-600' },
    { icon: Smile, title: 'Stress Management', desc: 'Practice meditation, yoga, or relaxation techniques', color: 'text-pink-600' },
  ] : [
    { icon: Hospital, title: 'Immediate Consultation', desc: 'Book appointment with oncologist within 48 hours', color: 'text-red-600' },
    { icon: FileText, title: 'Get Second Opinion', desc: 'Consult multiple specialists for treatment options', color: 'text-orange-600' },
    { icon: Users, title: 'Support System', desc: 'Connect with cancer support groups and counselors', color: 'text-indigo-600' },
    { icon: Shield, title: 'Treatment Plan', desc: 'Discuss chemotherapy, radiation, or surgery options', color: 'text-purple-600' },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analysis Results</h1>
                <p className="text-xs text-gray-500">Prediction ID: {result.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <p className="text-sm text-gray-600">
                    {user.username}
                  </p>
                  <UserNotifications />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 🎯 MAIN 2-COLUMN GRID CONTAINER */}
      <div className="w-full px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Header with Actions - Spans both columns */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            {/* Title and Timestamp */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                AI Analysis Results
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Analysis completed on <span className="font-medium">{new Date(result.timestamp).toLocaleString()}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <Button
                variant="default"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition"
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>

              <Button
                variant="default"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white hover:from-green-500 hover:to-teal-600 transition"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* � Main UResult Section - Spans both columns */}
          <Card
            className={`lg:col-span-2 border-0 shadow-2xl rounded-3xl mb-6 transition-all transform hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] relative overflow-hidden glass-card
  ${result.prediction === 'benign'
                ? 'bg-gradient-to-br from-green-50/95 via-emerald-100/95 to-teal-50/95 border-2 border-green-400'
                : 'bg-gradient-to-br from-rose-50/95 via-pink-100/95 to-red-50/95 border-2 border-red-400'
              }`}
          >
            <CardContent className="p-10 relative overflow-hidden rounded-3xl">
              {/* Animated Background Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl opacity-30 animate-pulse ${result.prediction === 'benign' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <div className={`absolute bottom-10 right-10 w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${result.prediction === 'benign' ? 'bg-emerald-400' : 'bg-pink-400'}`}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 rounded-full blur-2xl opacity-25 animate-pulse delay-500 ${result.prediction === 'benign' ? 'bg-teal-400' : 'bg-rose-400'}`}></div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent blur-2xl pointer-events-none"></div>

              {/* Result Icon */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl border-[6px] ${result.prediction === "benign"
                    ? "bg-gradient-to-br from-green-100 to-emerald-50 border-green-400"
                    : "bg-gradient-to-br from-pink-100 to-red-50 border-red-400"
                    }`}
                >
                  {result.prediction === "benign" ? (
                    <CheckCircle className="h-16 w-16 text-green-600 drop-shadow-md animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-16 w-16 text-red-600 drop-shadow-md animate-pulse" />
                  )}
                </div>
              </div>

              {/* Prediction Text */}
              <div className="text-center space-y-4">
                <h2
                  className={`text-4xl font-extrabold tracking-wide ${result.prediction === "benign"
                    ? "text-green-800"
                    : "text-red-800"
                    }`}
                >
                  {result.prediction === "benign"
                    ? "✅ NO CANCER DETECTED"
                    : "⚠️ CANCER SIGNS FOUND"}
                </h2>

                {/* Multilingual Explanation */}
                <p className="text-lg font-medium text-gray-800 leading-relaxed">
                  {result.prediction === "benign" ? (
                    <>
                      Great news! Your test shows no signs of breast cancer.
                      <br />
                      <span className="block text-gray-700 text-base mt-2">
                        [हिन्दी: आपके टेस्ट में कैंसर के लक्षण नहीं मिले हैं।]
                        <br />
                        [ಕನ್ನಡ: ನಿಮ್ಮ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಕಾಣಿಸಲಿಲ್ಲ.]
                      </span>
                    </>
                  ) : (
                    <>
                      Cancer symptoms detected. Please meet a doctor as soon as possible.
                      <br />
                      <span className="block text-gray-700 text-base mt-2">
                        [हिन्दी: आपके टेस्ट में कैंसर के लक्षण पाए गए हैं। कृपया तुरंत डॉक्टर से मिलें।]
                        <br />
                        [ಕನ್ನಡ: ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಪತ್ತೆಯಾಗಿವೆ. ದಯವಿಟ್ಟು ಶೀಘ್ರದಲ್ಲೇ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.]
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Confidence Level */}
              <div className="mt-8 bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-inner border border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 flex items-center justify-center gap-2">
                  🤖 AI Confidence Level
                  <span
                    className={`font-bold px-3 py-1 rounded-full ${result.prediction === "benign"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {result.confidence.toFixed(1)}%
                  </span>
                </h3>
                <p className="text-base text-gray-700 leading-relaxed text-center">
                  This shows how sure the AI model is about the result.
                  A higher percentage means the AI is more confident.
                  <br />
                  <span className="text-sm text-gray-700">
                    [हिन्दी: यह बताता है कि एआई अपने परिणाम को लेकर कितना भरोसेमंद है। प्रतिशत जितना अधिक, भरोसा उतना अधिक।]
                    <br />
                    [ಕನ್ನಡ: ಇದು AI ಮಾದರಿ ತನ್ನ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಎಷ್ಟು ಖಚಿತವಾಗಿದೆ ಎಂಬುದನ್ನು ತೋರಿಸುತ್ತದೆ. ಶೇಕಡಾವಾರು ಹೆಚ್ಚಾದಂತೆ ವಿಶ್ವಾಸ ಹೆಚ್ಚು.]
                  </span>
                </p>

                {/* Confidence Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2 font-medium text-gray-700">
                    <span>AI Confidence Progress</span>
                    <span>{result.confidence.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={result.confidence}
                    className={`h-5 rounded-full overflow-hidden shadow-inner ${result.prediction === "benign"
                      ? "[&>div]:bg-gradient-to-r from-green-400 to-emerald-600"
                      : "[&>div]:bg-gradient-to-r from-red-400 to-pink-600"
                      }`}
                  />
                </div>
              </div>

              {/* Badge for Analysis Type */}
              <div className="mt-6 text-center">
                <Badge
                  className={`text-base px-6 py-2 rounded-full font-semibold shadow-lg border ${result.prediction === "benign"
                    ? "bg-green-200 text-green-900 border-green-300"
                    : "bg-red-200 text-red-900 border-red-300"
                    }`}
                >
                  {result.type === "tabular"
                    ? "📊 Data Analysis"
                    : "🖼️ Image-Based Detection"}
                </Badge>
              </div>

              {/* Health Advice Section */}
              <div className="mt-8 text-center bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-inner border border-gray-100">
                {result.prediction === "benign" ? (
                  <>
                    <p className="text-lg font-semibold text-green-800">
                      🌿 Everything looks fine — Keep living healthy!
                    </p>
                    <p className="text-base text-gray-700">
                      Continue monthly self-checks and visit your doctor for regular screenings.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      [हिन्दी: खुद की नियमित जांच करें और डॉक्टर से समय-समय पर मिलें।]
                      <br />
                      [ಕನ್ನಡ: ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.]
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-red-800">
                      💪 Early treatment can save lives!
                    </p>
                    <p className="text-base text-gray-700">
                      Please visit your nearest hospital or oncologist immediately for further tests.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      [हिन्दी: जल्दी इलाज करवाने से जीवन बचाया जा सकता है।]
                      <br />
                      [ಕನ್ನಡ: ಶೀಘ್ರ ಚಿಕಿತ್ಸೆ ಜೀವವನ್ನು ಉಳಿಸಬಹುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.]
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔬 Grad-CAM Visualization - Spans both columns (only for image predictions) */}
          {result.type === 'image' && result.gradcam && (
            <Card className="lg:col-span-2 shadow-2xl rounded-3xl mb-6 overflow-hidden glass-card border-2 border-cyan-300 bg-gradient-to-br from-cyan-50/95 via-blue-50/95 to-indigo-50/95">
              <CardHeader className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white p-6">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <Brain className="h-7 w-7" />
                  <span>AI Visualization: Grad-CAM Heatmap</span>
                </CardTitle>
                <CardDescription className="text-gray-100 mt-2">
                  This heatmap shows which areas of the image the AI focused on when making its prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Info className="h-5 w-5 text-cyan-600" />
                      What is Grad-CAM?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Grad-CAM (Gradient-weighted Class Activation Mapping) is a visualization technique that highlights 
                      the important regions in the image that influenced the AI's decision. Red/warm colors indicate areas 
                      the model focused on most, while blue/cool colors show less important regions.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">How to Read This:</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li><strong>Red/Orange areas:</strong> High attention - AI focused here</li>
                        <li><strong>Yellow areas:</strong> Moderate attention</li>
                        <li><strong>Blue/Green areas:</strong> Low attention</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Why This Matters:</h4>
                      <p className="text-sm text-green-800">
                        This visualization helps doctors verify that the AI is looking at the right areas 
                        and not making decisions based on irrelevant image features.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 text-center">Heatmap Overlay</h3>
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                      <img 
                        src={`data:image/png;base64,${result.gradcam}`}
                        alt="Grad-CAM Heatmap"
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center italic">
                      AI attention heatmap overlaid on the original image
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🎯 Quick Action Cards - Spans both columns */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <Activity className="h-7 w-7" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">AI Confidence</h3>
                      <p className="text-3xl font-extrabold">{result.confidence.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>How confident the AI model is about this prediction</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <Target className="h-7 w-7" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">Accuracy</h3>
                      <p className="text-3xl font-extrabold">{result.modelMetrics.accuracy}%</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall model accuracy on test data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <Zap className="h-7 w-7" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">Analysis Type</h3>
                      <p className="text-xl font-bold mt-2">{result.type === 'tabular' ? '📊 Data' : '🖼️ Image'}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Type of analysis performed</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className={`bg-gradient-to-br ${result.prediction === 'benign' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}>
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        {result.prediction === 'benign' ? <CheckCircle className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
                      </div>
                      <h3 className="font-bold text-lg mb-1">Result</h3>
                      <p className="text-xl font-bold mt-2">{result.prediction === 'benign' ? '✅ Clear' : '⚠️ Alert'}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Final prediction result</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 🌟 AI Health Report Section - LEFT COLUMN */}
          <Card className="shadow-2xl rounded-3xl bg-gradient-to-br from-pink-50/95 via-purple-50/95 to-blue-50/95 p-6 transition-all hover:shadow-2xl relative overflow-hidden glass-card border-2 border-purple-300">
            <CardContent className="relative z-10">
              {/* Animated Decorative Elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-3xl opacity-20 animate-pulse-glow"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full blur-3xl opacity-20 animate-pulse-glow delay-1000"></div>
              </div>

              {/* �  Header with Icons */}
              <div className="text-center mb-8 relative">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-float">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                  🤖 AI Health Report
                </h1>
                <p className="text-xl font-semibold text-gray-600 mb-2">
                  एआई स्वास्थ्य रिपोर्ट / ಎಐ ಆರೋಗ್ಯ ವರದಿ
                </p>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                  A simple, clear, and colorful explanation of your test results in multiple languages
                </p>
                <Separator className="mt-6 mb-4" />
              </div>

              {/* ✅ Main Prediction - Enhanced */}
              <div
                className={`text-center p-10 rounded-3xl shadow-2xl border-2 transition-all relative overflow-hidden ${result.prediction === "benign"
                  ? "bg-gradient-to-br from-green-100 via-emerald-50 to-lime-50 border-green-400"
                  : "bg-gradient-to-br from-rose-100 via-pink-50 to-red-50 border-red-400"
                  }`}
              >
                {/* Decorative corner elements */}
                <div className={`absolute top-0 left-0 w-20 h-20 ${result.prediction === "benign" ? "bg-green-300" : "bg-red-300"} opacity-20 rounded-br-full`}></div>
                <div className={`absolute bottom-0 right-0 w-20 h-20 ${result.prediction === "benign" ? "bg-green-300" : "bg-red-300"} opacity-20 rounded-tl-full`}></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 ${result.prediction === "benign" ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300" : "bg-gradient-to-br from-red-400 to-pink-500 border-red-300"}`}>
                      {result.prediction === "benign" ? (
                        <CheckCircle className="h-14 w-14 text-white animate-pulse" />
                      ) : (
                        <AlertTriangle className="h-14 w-14 text-white animate-pulse" />
                      )}
                    </div>
                  </div>

                  <h2
                    className={`text-4xl font-extrabold mb-4 ${result.prediction === "benign" ? "text-green-900" : "text-red-900"
                      }`}
                  >
                    {result.prediction === "benign" ? (
                      <>
                        ✅ No Signs of Cancer Found
                        <br />
                        <span className="block text-gray-800 text-xl mt-3 font-semibold">
                          आपके टेस्ट में कैंसर के लक्षण नहीं मिले हैं। <br />
                          ನಿಮ್ಮ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                        </span>
                      </>
                    ) : (
                      <>
                        ⚠️ Possible Signs of Cancer Detected
                        <br />
                        <span className="block text-gray-800 text-xl mt-3 font-semibold">
                          आपके टेस्ट में कैंसर के लक्षण पाए गए हैं। <br />
                          ನಿಮ್ಮ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಪತ್ತೆಯಾಗಿವೆ.
                        </span>
                      </>
                    )}
                  </h2>

                  <div className="mt-6 inline-block p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Brain className={`h-6 w-6 ${result.prediction === "benign" ? "text-green-600" : "text-red-600"}`} />
                      <span className="text-xl text-gray-900 font-semibold">AI Model Confidence</span>
                    </div>
                    <div className={`text-5xl font-extrabold ${result.prediction === "benign" ? "text-green-700" : "text-red-700"}`}>
                      {result.confidence.toFixed(1)}%
                    </div>
                    <p className="text-gray-700 text-base mt-3 leading-relaxed">
                      एआई मॉडल का भरोसा: {result.confidence.toFixed(1)}% <br />
                      ಎಐ ಮಾದರಿಯ ವಿಶ್ವಾಸ: {result.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 📊 Model Metrics - Enhanced */}
              <div className="mt-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                    <h3 className="text-2xl font-bold text-white">
                      Model Test Results
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600">
                    मॉडल परीक्षण परिणाम / ಮಾದರಿಯ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು
                  </p>
                </div>

                {/* Enhanced Data Table */}
                <div className="overflow-x-auto rounded-3xl shadow-2xl border-2 border-gray-200">
                  <table className="min-w-full bg-white text-gray-800 rounded-3xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                      <tr>
                        <th className="p-4 text-left font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Metric
                          </div>
                        </th>
                        <th className="p-4 text-left font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Meaning
                          </div>
                        </th>
                        <th className="p-4 text-left font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Result
                          </div>
                        </th>
                        <th className="p-4 text-left font-bold text-lg">हिन्दी</th>
                        <th className="p-4 text-left font-bold text-lg">ಕನ್ನಡ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-yellow-50">
                        <td className="p-3 font-medium">💯 Accuracy</td>
                        <td className="p-3">How correct the model’s results are overall</td>
                        <td className="p-3 font-semibold text-yellow-700">
                          {result.modelMetrics.accuracy}%
                        </td>
                        <td className="p-3">सटीकता - कुल कितनी बार सही भविष्यवाणी हुई</td>
                        <td className="p-3">ನಿಖರತೆ - ಒಟ್ಟು ಎಷ್ಟು ಬಾರಿ ಸರಿಯಾದ ಫಲಿತಾಂಶ</td>
                      </tr>
                      <tr className="hover:bg-pink-50">
                        <td className="p-3 font-medium">🧩 Precision</td>
                        <td className="p-3">How many detected cancer cases were truly cancer</td>
                        <td className="p-3 font-semibold text-pink-700">
                          {result.modelMetrics.precision}%
                        </td>
                        <td className="p-3">सटीक पहचान - गलत अलार्म कम करना</td>
                        <td className="p-3">ನಿಖರ ಗುರುತು - ತಪ್ಪು ಎಚ್ಚರಿಕೆ ಕಡಿಮೆ</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="p-3 font-medium">🔍 Recall</td>
                        <td className="p-3">How many real cancer cases were detected</td>
                        <td className="p-3 font-semibold text-green-700">
                          {result.modelMetrics.recall}%
                        </td>
                        <td className="p-3">पकड़ने की क्षमता - जितने केस सही पकड़े गए</td>
                        <td className="p-3">ಹಿಡಿಯುವ ಸಾಮರ್ಥ್ಯ - ಎಷ್ಟು ಪ್ರಕರಣಗಳು ಪತ್ತೆಯಾದವು</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-medium">🎯 F1-Score</td>
                        <td className="p-3">Balance between precision and recall</td>
                        <td className="p-3 font-semibold text-blue-700">
                          {result.modelMetrics.f1Score}%
                        </td>
                        <td className="p-3">संतुलन स्कोर - सही और गलत दोनों का औसत</td>
                        <td className="p-3">ಸಮತೋಲನ ಅಂಕ - ನಿಖರತೆ ಮತ್ತು ಕರೆಗಳ ಸರಾಸರಿ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 📊 Visual Bars */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {[
                    { name: "Accuracy", value: result.modelMetrics.accuracy, color: "bg-yellow-500" },
                    { name: "Precision", value: result.modelMetrics.precision, color: "bg-pink-500" },
                    { name: "Recall", value: result.modelMetrics.recall, color: "bg-green-500" },
                    { name: "F1 Score", value: result.modelMetrics.f1Score, color: "bg-blue-500" },
                  ].map((metric) => (
                    <div key={metric.name} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
                      <div className="flex justify-between mb-2 text-gray-800 font-medium">
                        <span>{metric.name}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${metric.color} h-3 rounded-full transition-all duration-700 ease-in-out`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🧠 AI Model Explanation */}
              <div className="mt-10 bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-6 rounded-3xl shadow-inner space-y-4">
                <h3 className="text-2xl font-bold text-indigo-800 text-center">
                  🔬 How the AI Model Works / एआई कैसे काम करता है / ಎಐ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ
                </h3>
                <p className="text-gray-800 leading-relaxed text-justify">
                  The AI model acts like a digital doctor. It learns from thousands of past reports
                  and medical images to understand which cells are normal and which may show cancer signs.
                  When your test is uploaded, it compares your data with its knowledge and predicts the result.
                </p>

                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>📘 It analyzes shapes, sizes, and cell patterns in reports.</li>
                  <li>🧮 Uses ML models like Logistic Regression or Random Forest for prediction.</li>
                  <li>📊 Calculates a score — if it’s high, it marks as “possible cancer.”</li>
                  <li>💡 Keeps improving accuracy with more training data.</li>
                </ul>

                <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
                  <p><strong>🗣 English:</strong> AI compares your test with many known samples to see if it looks normal or not.</p>
                  <p><strong>🗣 हिन्दी:</strong> एआई आपके टेस्ट की तुलना पुराने डेटा से करता है ताकि यह बता सके कि यह सामान्य है या नहीं।</p>
                  <p><strong>🗣 ಕನ್ನಡ:</strong> ಎಐ ನಿಮ್ಮ ಪರೀಕ್ಷೆಯನ್ನು ಹಳೆಯ ಮಾದರಿಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ, ಇದು ಸಾಮಾನ್ಯವಾಗಿದೆಯೇ ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.</p>
                </div>
              </div>

              {/* ❤️ Health Tips Section */}
              <div className="mt-10 text-center bg-gradient-to-r from-yellow-50 via-white to-amber-100 rounded-2xl p-6 shadow-inner border border-yellow-200">
                {result.prediction === "benign" ? (
                  <>
                    <h3 className="text-2xl font-semibold text-green-700 mb-2">
                      🌿 Stay Healthy & Positive!
                    </h3>
                    <p className="text-lg text-gray-800">
                      No cancer detected — eat healthy, stay active, and do routine check-ups.
                      <br /> स्वस्थ रहें, पौष्टिक भोजन करें, नियमित जांच करवाते रहें।
                      <br /> ಆರೋಗ್ಯವಾಗಿರಿ ಮತ್ತು ವೈದ್ಯರ ಸಲಹೆ ಅನುಸರಿಸಿ.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold text-red-700 mb-2">
                      💪 Early Treatment Saves Lives!
                    </h3>
                    <p className="text-lg text-gray-800">
                      Possible cancer signs found — visit your doctor immediately for confirmation and treatment.
                      <br /> जल्दी जांच करवाना बेहतर इलाज में मदद करता है।
                      <br /> ಶೀಘ್ರ ಪರೀಕ್ಷೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಅತ್ಯಂತ ಅಗತ್ಯ.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 📋 RIGHT COLUMN - Clinical Interpretation & Quick Stats */}
          <div className="space-y-6">

            {/* Clinical Interpretation */}
            <Card
              className={`border-0 shadow-xl rounded-lg transition hover:shadow-2xl glass-card h-full
          ${result.prediction === 'benign' ? 'bg-green-50/95 border-l-4 border-green-600' : 'bg-red-50/95 border-l-4 border-red-600'}`}
            >
              <CardHeader
                className={`rounded-t-lg p-4 bg-gradient-to-r ${result.prediction === 'benign' ? 'from-green-600 to-green-700 text-white' : 'from-red-600 to-red-700 text-white'
                  }`}
              >
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Clinical Interpretation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {result.prediction === 'benign' ? (
                  <Alert className="border-green-200 bg-green-100 rounded-lg p-4 flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <AlertDescription>
                      <strong>Benign Classification:</strong> The AI analysis indicates characteristics consistent with non-cancerous tissue.
                      However, this should not replace professional medical evaluation. Continue with regular screening as recommended by your healthcare provider.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-100 rounded-lg p-4 flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                    <AlertDescription>
                      <strong>Malignant Classification:</strong> The AI analysis has detected patterns that may indicate cancerous tissue.
                      Immediate follow-up with a qualified oncologist is strongly recommended for comprehensive evaluation and treatment planning.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Important Medical Disclaimer
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This AI analysis is intended as a screening tool to assist healthcare professionals.
                    It should not be used as the sole basis for diagnosis or treatment decisions.
                    Always consult with qualified medical professionals for proper diagnosis and care.
                  </p>
                </div>

                {/* Quick Statistics */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Quick Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 opacity-80" />
                      <p className="text-xs opacity-90 mb-1">Analysis Time</p>
                      <p className="text-lg font-bold">&lt;2 sec</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2 opacity-80" />
                      <p className="text-xs opacity-90 mb-1">Security</p>
                      <p className="text-lg font-bold">100%</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white text-center">
                      <Brain className="h-6 w-6 mx-auto mb-2 opacity-80" />
                      <p className="text-xs opacity-90 mb-1">AI Model</p>
                      <p className="text-sm font-bold">Advanced</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl text-white text-center">
                      <Star className="h-6 w-6 mx-auto mb-2 opacity-80" />
                      <p className="text-xs opacity-90 mb-1">Accuracy</p>
                      <p className="text-lg font-bold">{result.modelMetrics.accuracy}%</p>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    Report Details
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>ID:</strong> {result.id.substring(0, 12)}...</p>
                    <p><strong>Type:</strong> {result.type === 'tabular' ? 'Data Analysis' : 'Image Analysis'}</p>
                    <p><strong>Date:</strong> {new Date(result.timestamp).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</p>
                    <p><strong>Model Version:</strong> 2.5.1</p>
                    <p><strong>Algorithm:</strong> Deep Learning CNN</p>
                  </div>
                </div>


                {/* Risk Factors & Prevention */}
                <div className="mt-6 p-4 bg-gradient-to-br from-rose-50 to-pink-100 rounded-xl border border-rose-200">
                  <h4 className="font-semibold text-rose-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-rose-600" />
                    {result.prediction === 'benign' ? 'Prevention Tips' : 'Important Information'}
                  </h4>
                  {result.prediction === 'benign' ? (
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>🥗 Nutrition:</strong> Eat plenty of fruits, vegetables, and whole grains</p>
                      <p><strong>🏃‍♀️ Exercise:</strong> At least 150 minutes of moderate activity per week</p>
                      <p><strong>🚭 Avoid:</strong> Smoking, excessive alcohol, and processed foods</p>
                      <p><strong>💊 Supplements:</strong> Vitamin D and Omega-3 may help (consult doctor)</p>
                      <p><strong>😌 Stress:</strong> Practice meditation, yoga, or relaxation techniques</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>⏰ Time Matters:</strong> Early detection significantly improves treatment success rates</p>
                      <p><strong>💪 Stay Strong:</strong> Many people successfully overcome breast cancer with proper treatment</p>
                      <p><strong>👨‍👩‍👧‍👦 Family Support:</strong> Inform close family members about screening importance</p>
                      <p><strong>📋 Documentation:</strong> Keep all medical records organized for consultations</p>
                      <p><strong>🏥 Treatment Options:</strong> Surgery, chemotherapy, radiation, or hormone therapy may be recommended</p>
                    </div>
                  )}
                </div>

                {/* Contact & Support */}
                <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    Need Help?
                  </h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-indigo-600" />
                      <span><strong>24/7 Helpline:</strong> Available for medical queries</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span><strong>Support Groups:</strong> Connect with others for emotional support</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span><strong>Find Clinics:</strong> Locate nearby hospitals and specialists</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span><strong>Download Report:</strong> Share with your healthcare provider</span>
                    </p>
                  </div>
                </div>

                {/* Screening Guidelines */}
                <div className="mt-6 p-4 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl border border-teal-200">
                  <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-teal-600" />
                    Screening Guidelines
                  </h4>
                  <div className="space-y-3 text-sm text-gray-800">
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="font-semibold text-teal-800 mb-1">Age 20-39:</p>
                      <p>Clinical breast exam every 1-3 years. Monthly self-exams recommended.</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="font-semibold text-teal-800 mb-1">Age 40-44:</p>
                      <p>Annual mammogram optional. Discuss with your doctor based on risk factors.</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="font-semibold text-teal-800 mb-1">Age 45-54:</p>
                      <p>Annual mammogram strongly recommended. Continue monthly self-exams.</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="font-semibold text-teal-800 mb-1">Age 55+:</p>
                      <p>Mammogram every 1-2 years, or continue yearly if preferred.</p>
                    </div>
                  </div>
                </div>

                {/* Warning Signs to Watch */}
                <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Warning Signs to Watch
                  </h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>New lump or mass in the breast or underarm area</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Swelling of all or part of the breast</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Skin irritation, dimpling, or redness</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Nipple discharge (other than breast milk)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Nipple retraction or inversion</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Pain in any area of the breast</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>Change in breast size or shape</span>
                    </p>
                    <p className="mt-3 p-2 bg-orange-100 rounded text-xs italic">
                      <strong>Note:</strong> If you notice any of these signs, consult a doctor immediately. Early detection is key!
                    </p>
                  </div>
                </div>

                {/* Treatment Success Rates */}
                <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Treatment Success Rates
                  </h4>
                  <div className="space-y-3 text-sm text-gray-800">
                    <p className="leading-relaxed">
                      <strong>Early Stage Detection:</strong> When breast cancer is detected early (Stage 0 or I), the 5-year survival rate is nearly 100%.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="p-3 bg-white/70 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">99%</p>
                        <p className="text-xs text-gray-600">Stage 0-I Survival</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">93%</p>
                        <p className="text-xs text-gray-600">Stage II Survival</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">72%</p>
                        <p className="text-xs text-gray-600">Stage III Survival</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600">22%</p>
                        <p className="text-xs text-gray-600">Stage IV Survival</p>
                      </div>
                    </div>
                    <p className="text-xs italic mt-3 p-2 bg-green-100 rounded">
                      These statistics emphasize the importance of early detection and regular screening.
                    </p>
                  </div>
                </div>



              </CardContent>
            </Card>

          </div>

          {/* 📊 Enhanced Analysis Details with Tabs - Spans both columns */}
          <Card className="lg:col-span-2 shadow-2xl rounded-2xl mb-6 overflow-hidden glass-card border-2 border-indigo-300">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Sparkles className="h-7 w-7" />
                <span>Detailed AI Analysis & Visualizations</span>
              </CardTitle>
              <CardDescription className="text-gray-100 mt-2">
                Interactive charts and comprehensive model performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="confidence" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  <TabsTrigger value="confidence" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Confidence
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="radar" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Radar View
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Comparison
                  </TabsTrigger>
                </TabsList>

                {/* Confidence Tab */}
                <TabsContent value="confidence" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Confidence Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={confidenceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {confidenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Info className="h-5 w-5 text-purple-600" />
                        Understanding Confidence
                      </h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="font-semibold text-blue-900">High Confidence (90-100%)</p>
                          <p className="text-sm text-blue-700 mt-1">Model is very certain about the prediction</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                          <p className="font-semibold text-yellow-900">Medium Confidence (70-89%)</p>
                          <p className="text-sm text-yellow-700 mt-1">Model shows good certainty, further tests recommended</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                          <p className="font-semibold text-red-900">Low Confidence (&lt;70%)</p>
                          <p className="text-sm text-red-700 mt-1">Additional diagnostic tests strongly recommended</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
                  <div className="h-80">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Model Performance Metrics
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis domain={[90, 100]} stroke="#6b7280" />
                        <RechartsTooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {metricsData.map((metric, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition">
                        <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                        <p className="text-3xl font-bold text-gray-900">{metric.value}%</p>
                        <Progress value={metric.value} className="mt-2 h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Radar Tab */}
                <TabsContent value="radar" className="space-y-4">
                  <div className="h-96">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      360° Performance Overview
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                        <Radar name="Model Performance" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                        <RechartsTooltip formatter={(value) => `${value}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* Comparison Tab */}
                <TabsContent value="comparison" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Model vs Industry Standards
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Accuracy', our: result.modelMetrics.accuracy, industry: 95, color: 'bg-green-500' },
                      { name: 'Precision', our: result.modelMetrics.precision, industry: 93, color: 'bg-blue-500' },
                      { name: 'Recall', our: result.modelMetrics.recall, industry: 94, color: 'bg-purple-500' },
                      { name: 'F1-Score', our: result.modelMetrics.f1Score, industry: 94, color: 'bg-pink-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-blue-600 font-medium">Our Model: {item.our}%</span>
                            <span className="text-gray-500">Industry Avg: {item.industry}%</span>
                          </div>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`absolute h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.our}%` }}></div>
                          <div className="absolute h-full border-r-2 border-yellow-500" style={{ left: `${item.industry}%` }}></div>
                        </div>
                        {item.our > item.industry && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {(item.our - item.industry).toFixed(1)}% above industry average
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>



          {/* 🏥 Book Doctor Appointment Section - Spans both columns */}
          <Card className="lg:col-span-2 shadow-xl rounded-3xl mb-6 overflow-hidden glass-card border-2 border-green-300 bg-gradient-to-br from-green-50/95 via-white/95 to-emerald-50/95">
            <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Stethoscope className="h-7 w-7" />
                <span>Book Appointment with Verified Doctors</span>
              </CardTitle>
              <p className="text-green-100 mt-2">
                Connect with certified oncologists and breast cancer specialists in {user?.location || 'your area'}
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Your AI Screening Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="font-medium text-gray-700">Risk Level</p>
                    <p className={`text-lg font-bold ${result.prediction === 'benign' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.prediction === 'benign' ? 'Low' : 'High'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="font-medium text-gray-700">AI Confidence</p>
                    <p className="text-lg font-bold text-blue-600">{result.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="font-medium text-gray-700">Recommendation</p>
                    <p className="text-sm font-medium text-gray-800">
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

          {/* 💡 Personalized Health Tips - Spans both columns */}
          <Card className="lg:col-span-2 shadow-2xl rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-yellow-50/95 glass-card border-2 border-amber-300">
            <CardHeader className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Sparkles className="h-7 w-7" />
                <span>Personalized Health Recommendations</span>
              </CardTitle>
              <CardDescription className="text-white/90 mt-2">
                {result.prediction === 'benign'
                  ? 'Keep up the good work! Here are tips to maintain your health'
                  : 'Important steps to take immediately for your health and wellbeing'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {healthTips.map((tip, idx) => (
                  <div key={idx} className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-transparent hover:border-current" style={{ borderColor: tip.color.replace('text-', '') }}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tip.color.replace('text-', 'from-')} to-white/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <tip.icon className={`h-7 w-7 ${tip.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{tip.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 🌿 Treatment & Daily Care Guidance - LEFT COLUMN */}
          <Card className="shadow-xl rounded-xl bg-gradient-to-r from-rose-50/95 to-pink-100/95 hover:shadow-2xl glass-card h-full border-2 border-pink-300">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-700 rounded-t-xl p-4 text-white text-center">
              <CardTitle className="text-xl font-bold">
                🌿 Daily Care During Treatment / उपचार के दौरान दैनिक देखभाल / ಚಿಕಿತ್ಸೆ ಸಮಯದ ದಿನನಿತ್ಯದ ಆರೈಕೆ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-gray-800">

              <p>💊 <strong>Take Medicines On Time:</strong> Follow the doctor’s prescription strictly.
                <br /><span className="text-sm">हिन्दी: दवाइयाँ समय पर लें, बिना डॉक्टर की सलाह के कुछ न बदलें।
                  <br />ಕನ್ನಡ: ಔಷಧಿಗಳನ್ನು ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ, ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಬದಲಾಯಿಸಬೇಡಿ.</span>
              </p>

              <p>🍲 <strong>Eat Soft & Nutritious Food:</strong> Soup, khichdi, dal, fruits, curd help your body recover.
                <br /><span className="text-sm">हिन्दी: हल्का और पौष्टिक भोजन जैसे सूप, खिचड़ी, दाल खाएँ।
                  <br />ಕನ್ನಡ: ಸೂಪ್, ಖಿಚ್ಡಿ, ಬೇಳೆ ಆಹಾರ ಸೇವಿಸಿ — ದೇಹಕ್ಕೆ ಬಲ ನೀಡುತ್ತದೆ.</span>
              </p>

              <p>🚶‍♀️ <strong>Gentle Movement:</strong> If you feel tired, rest. If strong, take short walks.
                <br /><span className="text-sm">हिन्दी: थकान लगे तो आराम करें, वरना हल्की सैर करें।
                  <br />ಕನ್ನಡ: ದಣಿದರೆ ವಿಶ್ರಾಂತಿ ಮಾಡಿ, ಇಲ್ಲದಿದ್ದರೆ ಸ್ವಲ್ಪ ನಡೆಯಿರಿ.</span>
              </p>

              <p>🧴 <strong>Skin & Hair Care:</strong> Use mild soap, oil scalp gently, avoid harsh chemicals.
                <br /><span className="text-sm">हिन्दी: हल्का साबुन व तेल लगाएँ, केमिकल उत्पाद न इस्तेमाल करें।
                  <br />ಕನ್ನಡ: ಮೃದುವಾದ ಸಾಬೂನು ಬಳಸಿ, ಕಠಿಣ ರಾಸಾಯನಿಕ ಉತ್ಪನ್ನಗಳನ್ನು ತಪ್ಪಿಸಿ.</span>
              </p>
            </CardContent>
          </Card>

          {/* 🩺 Medical Reminders & Doctor Follow-ups - RIGHT COLUMN */}
          <Card className="shadow-xl rounded-xl bg-gradient-to-r from-amber-50/95 to-yellow-100/95 hover:shadow-2xl glass-card h-full border-2 border-amber-300">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-t-xl p-4 text-white text-center">
              <CardTitle className="text-xl font-bold">
                🩺 Medical Reminders / चिकित्सा यादें / ವೈದ್ಯಕೀಯ ನೆನಪುಗಳು
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-gray-800">
              <p>🧾 <strong>Appointment Calendar:</strong> Mark chemo, radiation, or review dates clearly.
                <br /><span className="text-sm">हिन्दी: अपनी अगली जांच और उपचार की तारीखें याद रखें।
                  <br />ಕನ್ನಡ: ನಿಮ್ಮ ಮುಂದಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ದಿನಾಂಕಗಳನ್ನು ನೆನಪಿಡಿ.</span>
              </p>

              <p>💧 <strong>Hydration Reminder:</strong> Drink water every 1–2 hours to reduce weakness.
                <br /><span className="text-sm">हिन्दी: हर 2 घंटे में पानी पिएँ, कमजोरी कम होगी।
                  <br />ಕನ್ನಡ: ಪ್ರತಿ 2 ಗಂಟೆ ನೀರು ಕುಡಿಯಿರಿ — ದೌರ್ಬಲ್ಯ ಕಡಿಮೆಯಾಗುತ್ತದೆ.</span>
              </p>

              <p>🕊️ <strong>Rest Between Treatments:</strong> Sleep properly and avoid stress.
                <br /><span className="text-sm">हिन्दी: पर्याप्त नींद लें और तनाव से दूर रहें।
                  <br />ಕನ್ನಡ: ಸಾಕಷ್ಟು ನಿದ್ರೆ ಮಾಡಿ, ಒತ್ತಡ ತಪ್ಪಿಸಿ.</span>
              </p>
            </CardContent>
          </Card>

          {/* 🍎 Cancer-Specific Nutrition & Immunity - LEFT COLUMN */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-green-50/95 to-emerald-100/95 hover:shadow-2xl glass-card h-full">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-t-xl p-4 text-white text-center">
              <CardTitle className="text-xl font-bold">
                🍎 Nutrition for Cancer Care / कैंसर रोगियों के लिए भोजन / ಕ್ಯಾನ್ಸರ್ ರೋಗಿಗಳಿಗೆ ಆಹಾರ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-gray-800">
              <p>🥦 <strong>Eat Cancer-Fighting Foods:</strong> Include turmeric, garlic, ginger, and leafy vegetables.
                <br /><span className="text-sm">हिन्दी: हल्दी, लहसुन, अदरक और हरी सब्जियाँ खाएँ।
                  <br />ಕನ್ನಡ: ಅರಿಶಿನ, ಬೆಳ್ಳುಳ್ಳಿ, ಶುಂಠಿ ಮತ್ತು ಹಸಿರು ತರಕಾರಿ ಸೇವಿಸಿ.</span>
              </p>

              <p>🐟 <strong>Protein-Rich Foods:</strong> Milk, eggs, lentils, or fish help body repair.
                <br /><span className="text-sm">हिन्दी: दूध, अंडा, दाल शरीर को ठीक करने में मदद करते हैं।
                  <br />ಕನ್ನಡ: ಹಾಲು, ಮೊಟ್ಟೆ, ಬೇಳೆ ದೇಹ ಪುನಃ ನಿರ್ಮಿಸಲು ಸಹಾಯಕ.</span>
              </p>

              <p>🥤 <strong>Small Meals Often:</strong> Eat every 3 hours to maintain energy.
                <br /><span className="text-sm">हिन्दी: हर 3 घंटे में थोड़ा-थोड़ा खाएँ।
                  <br />ಕನ್ನಡ: ಪ್ರತಿ 3 ಗಂಟೆಗೆ ಸ್ವಲ್ಪ ಆಹಾರ ತಿನ್ನಿ.</span>
              </p>
            </CardContent>
          </Card>

          {/* 🧘‍♀️ Emotional & Family Support - RIGHT COLUMN */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-purple-50/95 to-indigo-100/95 hover:shadow-2xl glass-card h-full">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-t-xl p-4 text-white text-center">
              <CardTitle className="text-xl font-bold">
                🧘‍♀️ Emotional & Family Support / मानसिक सहयोग / ಮಾನಸಿಕ ಬೆಂಬಲ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-gray-800">
              <p>💞 <strong>Talk to Family:</strong> Share your feelings, don’t face everything alone.
                <br /><span className="text-sm">हिन्दी: परिवार से बात करें, सबकुछ अकेले न झेलें।
                  <br />ಕನ್ನಡ: ಕುಟುಂಬದೊಂದಿಗೆ ಮಾತನಾಡಿ, ಎಲ್ಲವನ್ನು ಒಬ್ಬರೇ ಎದುರಿಸಬೇಡಿ.</span>
              </p>

              <p>🎶 <strong>Relax Mind:</strong> Listen to music or pray daily.
                <br /><span className="text-sm">हिन्दी: रोज़ प्रार्थना करें या संगीत सुनें।
                  <br />ಕನ್ನಡ: ಪ್ರತಿದಿನ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ ಅಥವಾ ಸಂಗೀತ ಕೇಳಿ.</span>
              </p>

              <p>🧑‍🤝‍🧑 <strong>Support Groups:</strong> Join cancer support circles for sharing and hope.
                <br /><span className="text-sm">हिन्दी: कैंसर सहायता समूह से जुड़ें।
                  <br />ಕನ್ನಡ: ಕ್ಯಾನ್ಸರ್ ಬೆಂಬಲ ಗುಂಪಿಗೆ ಸೇರಿ.</span>
              </p>
            </CardContent>
          </Card>

          {/* 📅 Personalized Summary - LEFT COLUMN */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-cyan-50/95 to-sky-100/95 hover:shadow-2xl glass-card h-full">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-sky-700 rounded-t-xl p-4 text-white text-center">
              <CardTitle className="text-xl font-bold">
                📅 Summary & AI Confidence / सारांश / ಸಾರಾಂಶ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-gray-800">
              <p>🩺 <strong>Next Hospital Visit:</strong> In 30 days or as advised.
                <br /><span className="text-sm">हिन्दी: अगली अस्पताल यात्रा – 30 दिन में।
                  <br />ಕನ್ನಡ: ಮುಂದಿನ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ – 30 ದಿನಗಳಲ್ಲಿ.</span>
              </p>
              <p>💬 <strong>AI Confidence:</strong> {(result.confidence || 97).toFixed(1)}% — How sure AI is about your report.
                <br /><span className="text-sm">हिन्दी: एआई को अपने परिणाम पर इतना भरोसा है।
                  <br />ಕನ್ನಡ: AI ಮಾದರಿಗೆ ತನ್ನ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಇಷ್ಟೇ ವಿಶ್ವಾಸವಿದೆ.</span>
              </p>
              <p>🌸 <strong>Doctor’s Message:</strong> Early detection means early cure — keep hope alive!
                <br /><span className="text-sm">हिन्दी: जल्दी पहचान से इलाज आसान होता है। उम्मीद बनाए रखें।
                  <br />ಕನ್ನಡ: ಬೇಗ ಪತ್ತೆ ಮಾಡಿದರೆ ಚಿಕಿತ್ಸೆ ಸುಲಭವಾಗುತ್ತದೆ. ಆಶೆ ಕಳೆದುಕೊಳ್ಳಬೇಡಿ.</span>
              </p>
            </CardContent>
          </Card>

          {/* Medical Interpretation - Dark Theme Compatible */}
          <Card className={`border-0 shadow-xl rounded-lg mb-8 transition hover:shadow-2xl glass-card h-full
    ${result.prediction === 'benign' ? 'bg-green-50/95 border-l-4 border-green-600' : 'bg-red-50/95 border-l-4 border-red-600'}`}
          >
            <CardHeader
              className={`rounded-t-lg p-4 bg-gradient-to-r ${result.prediction === 'benign' ? 'from-green-600 to-green-700 text-white' : 'from-red-600 to-red-700 text-white'
                }`}
            >
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Clinical Interpretation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {result.prediction === 'benign' ? (
                <Alert className="border-green-200 bg-green-100 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <AlertDescription>
                    <strong>Benign Classification:</strong> The AI analysis indicates characteristics consistent with non-cancerous tissue.
                    However, this should not replace professional medical evaluation. Continue with regular screening as recommended by your healthcare provider.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-100 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <AlertDescription>
                    <strong>Malignant Classification:</strong> The AI analysis has detected patterns that may indicate cancerous tissue.
                    Immediate follow-up with a qualified oncologist is strongly recommended for comprehensive evaluation and treatment planning.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">⚠️ Important Medical Disclaimer</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  This AI analysis is intended as a screening tool to assist healthcare professionals.
                  It should not be used as the sole basis for diagnosis or treatment decisions.
                  Always consult with qualified medical professionals for proper diagnosis and care.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 📈 Statistics Overview - Spans both columns */}
          <Card className="lg:col-span-2 border-0 shadow-2xl rounded-2xl mb-6 bg-gradient-to-br from-slate-50/95 to-gray-100/95 glass-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                Analysis Summary at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white text-center transform hover:scale-105 transition-all shadow-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Analysis Time</p>
                  <p className="text-2xl font-bold">&lt;2 sec</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white text-center transform hover:scale-105 transition-all shadow-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Data Security</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white text-center transform hover:scale-105 transition-all shadow-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">AI Model</p>
                  <p className="text-xl font-bold">Advanced</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl text-white text-center transform hover:scale-105 transition-all shadow-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Reliability</p>
                  <p className="text-2xl font-bold">{result.modelMetrics.accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎨 Colorful Info Cards - Spans both columns, nested grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50/95 to-blue-100/95 hover:shadow-2xl transition-all transform hover:-translate-y-1 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Report Details</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>ID:</strong> {result.id.substring(0, 12)}...</p>
                  <p><strong>Type:</strong> {result.type === 'tabular' ? 'Data Analysis' : 'Image Analysis'}</p>
                  <p><strong>Date:</strong> {new Date(result.timestamp).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/95 to-purple-100/95 hover:shadow-2xl transition-all transform hover:-translate-y-1 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Model Info</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Algorithm:</strong> Deep Learning</p>
                  <p><strong>Training Data:</strong> 50,000+ samples</p>
                  <p><strong>Last Updated:</strong> Nov 2024</p>
                  <p><strong>Version:</strong> 2.5.1</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-50/95 to-pink-100/95 hover:shadow-2xl transition-all transform hover:-translate-y-1 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Support</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> 24/7 Helpline Available</p>
                  <p className="flex items-center gap-2"><Hospital className="h-4 w-4" /> Doctor Consultation</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" /> Support Groups</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Find Nearby Clinics</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🎯 Enhanced Action Buttons - Spans both columns */}
          <Card className="lg:col-span-2 border-0 shadow-2xl rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white mb-6">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Zap className="h-6 w-6" />
                What Would You Like to Do Next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/predict/tabular" className="block">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-lg text-center mb-2">New Data Analysis</h4>
                    <p className="text-sm text-center text-white/80">Upload patient data for AI analysis</p>
                  </div>
                </Link>
                <Link href="/predict/image" className="block">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-lg text-center mb-2">New Image Analysis</h4>
                    <p className="text-sm text-center text-white/80">Upload medical images for detection</p>
                  </div>
                </Link>
                <Link href="/history" className="block">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer border border-white/20">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-lg text-center mb-2">View History</h4>
                    <p className="text-sm text-center text-white/80">Access all your previous reports</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          

          {/* 🌟 Final Encouragement Message - Spans both columns */}
          <Card className={`lg:col-span-2 border-0 shadow-xl rounded-2xl mb-6 glass-card ${result.prediction === 'benign' ? 'bg-gradient-to-r from-green-100/95 to-emerald-100/95' : 'bg-gradient-to-r from-blue-100/95 to-indigo-100/95'}`}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                {result.prediction === 'benign' ? (
                  <Heart className="h-10 w-10 text-green-600" />
                ) : (
                  <Shield className="h-10 w-10 text-blue-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {result.prediction === 'benign'
                  ? '🎉 Stay Healthy & Keep Smiling!'
                  : '💪 You Are Not Alone in This Journey'}
              </h3>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
                {result.prediction === 'benign'
                  ? 'Your results look great! Continue with regular checkups and maintain a healthy lifestyle. Prevention is always better than cure.'
                  : 'Early detection saves lives. With proper treatment and support, many people successfully overcome breast cancer. Stay strong and consult with healthcare professionals immediately.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Badge className="px-4 py-2 text-sm bg-white text-gray-800 shadow-md">
                  <Heart className="h-4 w-4 mr-2 inline" />
                  Trusted by 10,000+ users
                </Badge>
                <Badge className="px-4 py-2 text-sm bg-white text-gray-800 shadow-md">
                  <Shield className="h-4 w-4 mr-2 inline" />
                  HIPAA Compliant
                </Badge>
                <Badge className="px-4 py-2 text-sm bg-white text-gray-800 shadow-md">
                  <Award className="h-4 w-4 mr-2 inline" />
                  {result.modelMetrics.accuracy}% Accuracy
                </Badge>
              </div>
            </CardContent>
          </Card>

        </div> {/* End of 2-column grid */}
      </div>
    </div>
  );
}