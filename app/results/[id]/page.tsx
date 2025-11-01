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
  Building
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

  // const [gradcam, setGradcam] = useState<string | null>(null);
  // const [loadingGradcam, setLoadingGradcam] = useState(false);

  // useEffect(() => {
  //   if (result?.type === "image") fetchGradCAM();
  // }, [result]);

  // const fetchGradCAM = async () => {
  //   try {
  //     setLoadingGradcam(true);
  //     const res = await fetch(`/api/results/${predictionId}/gradcam`);
  //     const data = await res.json();
  //     if (data.success) setGradcam(data.gradcam);
  //   } catch (err) {
  //     console.error("Grad-CAM fetch error", err);
  //   } finally {
  //     setLoadingGradcam(false);
  //   }
  // };


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
                {user ? `Dr. ${user.username}` : ''}
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


        {/* Main Result */}
        {/* Main Result */}
        <Card
          className={`border-0 shadow-2xl rounded-xl mb-8 transition transform hover:scale-[1.01] ${result.prediction === 'benign'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50'
            : 'bg-gradient-to-r from-red-50 to-pink-50'
            }`}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${result.prediction === 'benign' ? 'bg-green-100' : 'bg-red-100'
                  }`}
              >
                {result.prediction === 'benign' ? (
                  <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-red-600 animate-pulse" />
                )}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-extrabold mb-2">
                <span className={result.prediction === 'benign' ? 'text-green-800' : 'text-red-800'}>
                  {result.prediction.toUpperCase()}
                </span>
              </h2>
              <p className="text-xl text-gray-700 mb-4">
                Confidence: <span className="font-semibold">{result.confidence.toFixed(1)}%</span>
              </p>
              <Badge
                className={`text-sm px-5 py-2 rounded-full font-medium ${result.prediction === 'benign' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                  }`}
              >
                {result.type === 'tabular' ? 'Data Analysis' : 'Image Analysis'}
              </Badge>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-gray-600">Prediction Confidence</span>
                <span className="font-semibold">{result.confidence.toFixed(1)}%</span>
              </div>
              <Progress
                value={result.confidence}
                className={`h-4 rounded-full ${result.prediction === 'benign' ? '[&>div]:bg-green-600' : '[&>div]:bg-red-600'
                  }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grad-CAM heatmap for image-based predictions */}
        {/* {result.type === 'image' && (
          <Card className="border-0 shadow-xl rounded-lg hover:shadow-2xl transition mt-8">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-pink-600 text-white p-4 rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Model Explainability (Grad-CAM)</span>
              </CardTitle>
              <CardDescription className="text-gray-200">
                Heatmap showing which regions influenced the AI decision most
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex justify-center items-center">
              {loadingGradcam ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
                  <p className="text-gray-600">Generating Grad-CAM visualization...</p>
                </div>
              ) : gradcam ? (
                <img
                  src={gradcam}
                  alt="Grad-CAM Heatmap"
                  className="rounded-lg shadow-lg border border-gray-200 w-full max-w-md"
                />
              ) : (
                <p className="text-gray-600 text-center">No Grad-CAM visualization available</p>
              )}
            </CardContent>
          </Card>
        )} */}

        {/* Analysis Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
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


        {/* Recommended Hospitals & Doctors */}
        {/* Recommended Hospitals & Doctors */}
        <Card className="border-0 shadow-xl mb-10 bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-4">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Building className="h-5 w-5" />
              <span>Recommended Hospitals & Oncologists in Karnataka</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-700 mb-6">
              Based on your location <strong>{user?.location}</strong>, below are nearby and other recommended hospitals, doctors, and diagnostic centres.
            </p>

            {/* Nearby */}
            <div className="mb-8">
              <h4 className="font-semibold text-blue-800 mb-3">📍 Nearby Locations</h4>

              {/* Hospitals */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-blue-500">
                <h5 className="font-semibold text-blue-700 mb-2">🏥 Hospitals</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {hospitals
                    .filter(h => h.city === user?.location)
                    .map((h, idx) => (
                      <li key={idx}>
                        {h.name} – <strong>{h.city}</strong>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Doctors */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-green-500">
                <h5 className="font-semibold text-green-700 mb-2">👨‍⚕️ Doctors</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {doctors
                    .filter(d => d.city === user?.location)
                    .map((d, idx) => (
                      <li key={idx}>
                        {d.name} – <strong>{d.city}</strong>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Diagnostics */}
              <div className="p-4 rounded-lg shadow-md bg-white border-l-4 border-purple-500">
                <h5 className="font-semibold text-purple-700 mb-2">🧪 Diagnostic Centres</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {diagnostics
                    .filter(c => c.city === user?.location)
                    .map((c, idx) => (
                      <li key={idx}>
                        {c.name} – <strong>{c.city}</strong>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Other Locations */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🌐 Other Locations</h4>

              {/* Hospitals */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-blue-300">
                <h5 className="font-semibold text-blue-700 mb-2">🏥 Hospitals</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {hospitals
                    .filter(h => h.city !== user?.location)
                    .map((h, idx) => (
                      <li key={idx}>
                        {h.name} – {h.city}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Doctors */}
              <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-green-300">
                <h5 className="font-semibold text-green-700 mb-2">👨‍⚕️ Doctors</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {doctors
                    .filter(d => d.city !== user?.location)
                    .map((d, idx) => (
                      <li key={idx}>
                        {d.name} – {d.city}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Diagnostics */}
              <div className="p-4 rounded-lg shadow-md bg-white border-l-4 border-purple-300">
                <h5 className="font-semibold text-purple-700 mb-2">🧪 Diagnostic Centres</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {diagnostics
                    .filter(c => c.city !== user?.location)
                    .map((c, idx) => (
                      <li key={idx}>
                        {c.name} – {c.city}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

          </CardContent>
        </Card>



        {/* Next Steps */}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommended Actions */}
          <Card className={`border-0 shadow-xl rounded-lg transition hover:shadow-2xl ${result.prediction === 'benign' ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-red-50 to-red-100'
            }`}>
            <CardHeader className="bg-gradient-to-r rounded-t-lg p-4 flex items-center justify-between
      ${result.prediction === 'benign' ? 'from-green-600 to-green-700 text-white' : 'from-red-600 to-red-700 text-white'}">
              <CardTitle>{result.prediction === 'benign' ? '✅ Recommended Actions' : '⚠️ Recommended Actions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {result.prediction === 'benign' ? (
                <>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-green-800">Continue Regular Screening</p>
                      <p className="text-sm text-gray-700">Maintain your regular mammography schedule</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-green-800">Monitor for Changes</p>
                      <p className="text-sm text-gray-700">Report any new symptoms to your doctor</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <p className="font-semibold text-red-800">Immediate Medical Consultation</p>
                      <p className="text-sm text-gray-700">Schedule appointment with oncologist</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <p className="font-semibold text-red-800">Additional Testing</p>
                      <p className="text-sm text-gray-700">May require biopsy for confirmation</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Analysis Details */}

          <Card className="border-0 shadow-xl rounded-lg transition hover:shadow-2xl bg-gradient-to-r from-blue-50 to-indigo-100">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-4 text-white">
              <CardTitle>📊 Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">

              {/* Analysis Type */}
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Analysis Type:</span>
                <Badge variant="secondary">{result.type === 'tabular' ? 'Data Analysis' : 'Image Analysis'}</Badge>
              </div>

              {/* Model Used */}
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Model Used:</span>
                <span className="font-semibold">{result.type === 'tabular' ? 'Random Forest' : 'CNN ResNet-50'}</span>
              </div>

              {/* Processing Time */}
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Processing Time:</span>
                <span className="font-semibold">{result.processingTime || '2.3 seconds'}</span>
              </div>



              {/* Predicted Outcome */}
              {result.prediction && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Predicted Outcome:</span>
                  <span className="font-semibold text-green-700">{result.prediction}</span>
                </div>
              )}

              {/* Confidence / Accuracy */}
              {result.confidence && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Confidence:</span>
                  <span className="font-semibold">{(result.confidence).toFixed(2)}%</span>
                </div>
              )}



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