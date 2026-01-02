'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  Heart,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'tabular' | 'image';
  prediction: 'benign' | 'malignant';
  confidence: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'error';
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
    if (isLoaded && user) {
      fetchHistory();
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, filterType, filterResult]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/predictions/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prediction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterResult !== 'all') {
      filtered = filtered.filter(item => item.prediction === filterResult);
    }

    setFilteredHistory(filtered);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading history...</p>
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
            Prediction History
          </h1>
          <p className="text-gray-400">
            View and manage your past AI analysis results
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="border border-gray-700/30 shadow-2xl mb-8 bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Filter className="h-5 w-5 text-blue-400" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">

              {/* Search */}
              <div className="space-y-2">
                <Label className="text-gray-300">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search predictions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Analysis Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">Analysis Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-gray-300 focus:bg-gray-700">All Types</SelectItem>
                    <SelectItem value="tabular" className="text-gray-300 focus:bg-gray-700">Data Analysis</SelectItem>
                    <SelectItem value="image" className="text-gray-300 focus:bg-gray-700">Image Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <Label className="text-gray-300">Result</Label>
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-gray-300 focus:bg-gray-700">All Results</SelectItem>
                    <SelectItem value="benign" className="text-gray-300 focus:bg-gray-700">Benign</SelectItem>
                    <SelectItem value="malignant" className="text-gray-300 focus:bg-gray-700">Malignant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <Label className="text-transparent">Clear</Label>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterResult('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>


        {/* History List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading prediction history...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <Card key={item.id} className="border border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.prediction === 'benign'
                        ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30'
                        : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30'
                        }`}>
                        {item.type === 'tabular' ? (
                          <FileText className={`h-6 w-6 ${item.prediction === 'benign' ? 'text-green-400' : 'text-red-400'}`} />
                        ) : (
                          <Upload className={`h-6 w-6 ${item.prediction === 'benign' ? 'text-green-400' : 'text-red-400'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white">
                            {item.prediction.charAt(0).toUpperCase() + item.prediction.slice(1)} Prediction
                          </h3>
                          <Badge
                            className={`px-2 py-1 text-xs rounded-full font-medium ${item.prediction === 'benign'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                          >
                            {item.confidence.toFixed(1)}% confidence
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-blue-400" />
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {item.type === 'tabular' ? 'Data' : 'Image'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/results/${item.id}`}>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/results/${item.id}`}>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm || filterType !== 'all' || filterResult !== 'all'
                    ? 'No Results Match Your Filters'
                    : 'Be the First to Predict'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || filterType !== 'all' || filterResult !== 'all'
                    ? 'Try clearing or adjusting your filters to see more results.'
                    : 'Run your first analysis to build your prediction history.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/predict/tabular">
                    <Button className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-lg transition-all">
                      <FileText className="h-4 w-4 mr-2" />
                      Start Data Analysis
                    </Button>
                  </Link>
                  <Link href="/predict/image">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all">
                      <Upload className="h-4 w-4 mr-2" />
                      Start Image Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}