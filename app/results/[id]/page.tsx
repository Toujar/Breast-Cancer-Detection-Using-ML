'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Sun
} from 'lucide-react';
// import { useAuth } from '@/lib/auth-context';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PredictionResult {
  id: string;
  type: 'tabular' | 'image';
  prediction: 'benign' | 'malignant';
  confidence: number;
  inputData?: any;
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
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
        const response = await fetch(`/api/results/${predictionId}`, { cache: 'no-store' });

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
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {user ? `${user.username}` : ''}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
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

        {/* 🌸 Main Result Section */}
        <Card
          className={`border-0 shadow-2xl rounded-2xl mb-10 transition-all transform hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)]
  ${result.prediction === 'benign'
              ? 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 border border-green-200'
              : 'bg-gradient-to-br from-rose-50 via-pink-100 to-red-50 border border-red-200'
            }`}
        >
          <CardContent className="p-10 relative overflow-hidden rounded-2xl">
            {/* Decorative Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent blur-2xl pointer-events-none"></div>

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

        {/* 🌟 AI Health Report Section NEWWWWWWWWWWWW */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-pink-50 via-white to-blue-50 p-8 transition-all hover:shadow-3xl hover:scale-[1.01]">
          <CardContent className="relative">
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20 blur-2xl rounded-3xl pointer-events-none"></div>

            {/* 🧠 Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-indigo-800 mb-3 drop-shadow-sm">
                🤖 AI Health Report / एआई स्वास्थ्य रिपोर्ट / ಎಐ ಆರೋಗ್ಯ ವರದಿ
              </h1>
              <p className="text-gray-700 text-lg">
                A simple, clear, and colorful explanation of your test results
              </p>
            </div>

            {/* ✅ Main Prediction */}
            <div
              className={`text-center p-8 rounded-2xl shadow-inner border transition-all ${result.prediction === "benign"
                ? "bg-gradient-to-r from-green-100 via-emerald-50 to-lime-50 border-green-300"
                : "bg-gradient-to-r from-rose-100 via-pink-50 to-red-50 border-red-300"
                }`}
            >
              <h2
                className={`text-3xl font-bold mb-4 ${result.prediction === "benign" ? "text-green-800" : "text-red-800"
                  }`}
              >
                {result.prediction === "benign" ? (
                  <>
                    ✅ No Signs of Cancer Found
                    <br />
                    <span className="block text-gray-800 text-lg mt-2">
                      आपके टेस्ट में कैंसर के लक्षण नहीं मिले हैं। <br />
                      ನಿಮ್ಮ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                    </span>
                  </>
                ) : (
                  <>
                    ⚠️ Possible Signs of Cancer Detected
                    <br />
                    <span className="block text-gray-800 text-lg mt-2">
                      आपके टेस्ट में कैंसर के लक्षण पाए गए हैं। <br />
                      ನಿಮ್ಮ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಪತ್ತೆಯಾಗಿವೆ.
                    </span>
                  </>
                )}
              </h2>

              <div className="mt-5 text-xl text-gray-900 font-medium">
                🧠 AI Model Confidence:{" "}
                <span
                  className={`font-bold ${result.prediction === "benign" ? "text-green-700" : "text-red-700"
                    }`}
                >
                  {result.confidence.toFixed(1)}%
                </span>
                <p className="text-gray-700 text-base mt-2">
                  एआई मॉडल का भरोसा: {result.confidence.toFixed(1)}% <br />
                  ಎಐ ಮಾದರಿಯ ವಿಶ್ವಾಸ: {result.confidence.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 📊 Model Metrics */}
            <div className="mt-10">
              <h3 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
                📈 Model Test Results / मॉडल परीक्षण परिणाम / ಮಾದರಿಯ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು
              </h3>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full bg-white text-gray-800 rounded-2xl overflow-hidden">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
                    <tr>
                      <th className="p-3 text-left">Metric</th>
                      <th className="p-3 text-left">Meaning</th>
                      <th className="p-3 text-left">Result</th>
                      <th className="p-3 text-left">हिन्दी</th>
                      <th className="p-3 text-left">ಕನ್ನಡ</th>
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


        {/* Analysis Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8 mt-10">
          {/* Confidence Breakdown */}
          <Card className="border-0 shadow-xl rounded-lg hover:shadow-2xl transition">
            <CardHeader
              className="p-4 rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Confidence Analysis</span>
              </CardTitle>
              <CardDescription className="text-gray-200">
                AI model confidence distribution for this prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  High confidence indicates strong model certainty in the prediction
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card className="border-0 shadow-xl rounded-lg hover:shadow-2xl transition">
            <CardHeader
              className="p-4 rounded-t-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Model Performance</span>
              </CardTitle>
              <CardDescription className="text-gray-200">
                Key metrics from model validation on test dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Interpretation */}
        <Card
          className={`border-0 shadow-xl rounded-lg mb-8 transition hover:shadow-2xl 
    ${result.prediction === 'benign' ? 'bg-green-50 border-l-4 border-green-600' : 'bg-red-50 border-l-4 border-red-600'}`}
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

        {/* 🌾 Recommended Hospitals & Doctors (Rural-Friendly, Location-Based) */}
        <Card className="border-0 shadow-xl mb-10 bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-4">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Building className="h-5 w-5" />
              <span>Nearby Hospitals & Cancer Care in {user?.location}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Intro */}
            <p className="text-sm text-gray-800 leading-relaxed">
              🌾 Hello! Based on your location <strong>{user?.location || "your area"}</strong>, here are
              <strong> trusted hospitals, cancer doctors, and testing centres </strong> near you.
              These places help with <strong>breast pain, lumps, or early cancer checks</strong>.
            </p>

            {/* Nearby */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">📍 Hospitals, Doctors & Labs Near You</h4>

              {/* Hospitals */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-blue-500">
                <h5 className="font-semibold text-blue-700 mb-1">🏥 Hospitals</h5>
                <p className="text-sm text-gray-700 mb-3">Visit these hospitals for check-up and treatment.</p>

                {hospitals.filter(h => h.city.toLowerCase() === user?.location?.toLowerCase()).length > 0 ? (
                  hospitals
                    .filter(h => h.city.toLowerCase() === user?.location?.toLowerCase())
                    .map((h, idx) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-800 font-medium">
                          {h.name} — <span className="font-semibold">{h.city}</span>
                        </p>

                       
                      </div>
                    ))
                ) : (
                  <p className="text-sm">No nearby hospitals found. Please visit your nearest PHC.</p>
                )}
              </div>

              {/* Doctors */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-green-500">
                <h5 className="font-semibold text-green-700 mb-1">👩‍⚕️ Doctors (Cancer Specialists)</h5>
                <p className="text-sm text-gray-700 mb-3">Meet these doctors for breast examination.</p>

                {doctors.filter(d => d.city.toLowerCase() === user?.location?.toLowerCase()).length > 0 ? (
                  doctors
                    .filter(d => d.city.toLowerCase() === user?.location?.toLowerCase())
                    .map((d, idx) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-800 font-medium">
                          {d.name} — <span className="font-semibold">{d.city}</span>
                        </p>

                       
                      </div>
                    ))
                ) : (
                  <p className="text-sm">No specialists found. Visit your PHC for referral.</p>
                )}
              </div>

              {/* Diagnostics */}
              <div className="p-4 rounded-lg shadow-md bg-white border-l-4 border-purple-500">
                <h5 className="font-semibold text-purple-700 mb-1">🧪 Diagnostic & Testing Centres</h5>
                <p className="text-sm text-gray-700 mb-3">These centres offer mammograms & lab tests.</p>

                {diagnostics.filter(c => c.city.toLowerCase() === user?.location?.toLowerCase()).length > 0 ? (
                  diagnostics
                    .filter(c => c.city.toLowerCase() === user?.location?.toLowerCase())
                    .map((c, idx) => (
                      <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-800 font-medium">
                          {c.name} — <span className="font-semibold">{c.city}</span>
                        </p>

                       
                      </div>
                    ))
                ) : (
                  <p className="text-sm">No labs found. Visit your district hospital for screening.</p>
                )}
              </div>
            </div>

            {/* Major Hospitals */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🌐 Other Major Hospitals in Karnataka</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>KIDWAI Memorial Institute of Oncology – Bengaluru</li>
                <li>St. John’s Medical College Hospital – Bengaluru</li>
                <li>KMC Hospital – Mangaluru</li>
                <li>JSS Hospital – Mysuru</li>
                <li>SDM Hospital – Dharwad</li>
              </ul>
            </div>

            {/* Guidance */}
            <div className="p-4 rounded-lg shadow-md bg-white border-l-4 border-yellow-500">
              <h5 className="font-semibold text-yellow-700 mb-2">💡 Easy Guidance</h5>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>🏥 Go to your nearest <strong>Primary Health Centre (PHC)</strong>.</li>
                <li>🩺 Ask for a referral letter to district hospital.</li>
                <li>🚌 Use <strong>Ayushman Bharat</strong> scheme for treatment cost.</li>
                <li>👩‍⚕️ Early check-up = better treatment & faster recovery.</li>
              </ul>
            </div>
          </CardContent>

        </Card>

        {/* Next Steps */}
        <div className="flex flex-col space-y-6 mt-10">

          {/* 🌿 Treatment & Daily Care Guidance */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-rose-50 to-pink-100 hover:shadow-2xl">
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

          {/* 🩺 Medical Reminders & Doctor Follow-ups */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-amber-50 to-yellow-100 hover:shadow-2xl">
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

          {/* 🍎 Cancer-Specific Nutrition & Immunity */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 hover:shadow-2xl">
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

          {/* 🧘‍♀️ Emotional & Family Support */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-purple-50 to-indigo-100 hover:shadow-2xl">
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

          {/* 📅 Personalized Summary */}
          <Card className="border-0 shadow-xl rounded-xl bg-gradient-to-r from-cyan-50 to-sky-100 hover:shadow-2xl">
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

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/predict/tabular">
            <Button variant="outline" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              New Data Analysis
            </Button>
          </Link>
          <Link href="/predict/image">
            <Button variant="outline" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              New Image Analysis
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" size="lg">
              <Clock className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}