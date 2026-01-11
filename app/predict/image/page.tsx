'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import { 
  Heart, 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  FileImage,
  Info,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';

export default function ImagePredictionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Middleware handles authentication, no need for manual redirect
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/predict/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Image analysis completed!');
        router.push(`/results/${result.predictionId}`);
      } else {
        setError('Invalid image detected. Please upload a breast ultrasound image.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center space-x-3">
            <ImageIcon className="h-8 w-8 text-blue-400" />
            <span>Breast Ultrasound Image Analysis</span>
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Upload a breast ultrasound image for AI-powered analysis. Our EfficientNet model 
            will examine the image and provide predictions with confidence scores.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-blue-500/30 bg-blue-900/20 backdrop-blur-sm">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Supported Formats:</strong> JPEG, PNG, TIFF. Maximum file size: 10MB. 
            For best results, use high-resolution breast ultrasound images with clear tissue definition.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Upload className="h-5 w-5" />
                    <span>Upload Ultrasound Image</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Select or drag and drop a breast ultrasound image for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/30">
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  {!selectedFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                        dragOver 
                          ? 'border-blue-400 bg-blue-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                    >
                      <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        Upload Ultrasound Image
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Drag and drop your image here, or click to browse
                      </p>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-400 mt-4">
                        Supported: JPEG, PNG, TIFF, DICOM (Max: 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Image Preview */}
                      <div className="relative">
                        <img
                          src={previewUrl || ''}
                          alt="Ultrasound preview"
                          className="w-full max-h-96 object-contain rounded-lg border border-gray-600"
                        />
                        <div className="absolute top-4 right-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              setError('');
                            }}
                            className="bg-gray-800 text-white hover:bg-gray-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                        <h4 className="font-medium text-white mb-2">File Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Filename:</span>
                            <p className="font-medium truncate text-white">{selectedFile.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <p className="font-medium text-white">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <p className="font-medium text-white">{selectedFile.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <p className="font-medium text-green-400">Ready for Analysis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">CNN Model Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <Brain className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-200">Deep Learning Model</p>
                    <p className="text-xs text-green-300">Convolutional Neural Network</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Architecture:</span>
                      <span className="font-medium text-white">EfficientNet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Input Size:</span>
                      <span className="font-medium text-white">224x224</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="font-medium text-green-400">96.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Training Set:</span>
                      <span className="font-medium text-white">780 Ultrasound Images</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg text-white"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Analyze Image
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400 text-center leading-relaxed">
                Image processing may take 5-10 seconds depending on file size. 
                The AI will analyze tissue patterns and density variations.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}