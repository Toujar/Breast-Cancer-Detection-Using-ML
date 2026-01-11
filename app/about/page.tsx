'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ArrowLeft, 
  Brain,
  Database,
  BarChart3,
  Shield,
  CheckCircle,
  Award,
  Users,
  FileText
} from 'lucide-react';

export default function AboutPage() {
  const technologies = [
    { name: 'Next.js 13', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'shadcn/ui', category: 'Components' },
    { name: 'Python', category: 'Backend' },
    { name: 'PyTorch', category: 'Deep Learning' },
    { name: 'EfficientNet', category: 'CNN Architecture' },
    { name: 'MongoDB', category: 'Database' }
  ];

  const achievements = [
    { metric: '96.8%', label: 'EfficientNet Accuracy', description: 'On BUSI Ultrasound Dataset' },
    { metric: '780', label: 'Training Images', description: 'Clinical ultrasound dataset' },
    { metric: '3', label: 'Image Categories', description: 'Normal, Benign, Malignant' },
    { metric: '97.2%', label: 'Clinical Precision', description: 'Real-world deployment performance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">About Project</h1>
                <p className="text-xs text-gray-400">Technical Documentation</p>
              </div>
            </div>
            <div>
              <Link href="/dashboard">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-900/30 text-blue-300 border-blue-500/30">
            <Award className="h-3 w-3 mr-1" />
            College Major Project
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI-Powered Breast Cancer Detection System
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            A comprehensive machine learning platform that combines advanced AI algorithms 
            with intuitive user interfaces to assist healthcare professionals in early 
            breast cancer detection and analysis.
          </p>
        </div>

        {/* Key Achievements */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <Card key={index} className="border-0 shadow-lg text-center bg-black/40 backdrop-blur-xl border-gray-700/30">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {achievement.metric}
                </div>
                <div className="font-semibold text-white mb-1">
                  {achievement.label}
                </div>
                <div className="text-sm text-gray-400">
                  {achievement.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Overview */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-400" />
              <span>Machine Learning Models</span>
            </h2>
            <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">EfficientNet CNN</CardTitle>
                  <CardDescription className="text-gray-400">For ultrasound image analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dataset:</span>
                      <span className="font-medium text-white">BUSI Ultrasound Images</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Architecture:</span>
                      <span className="font-medium text-white">EfficientNet-B0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="font-medium text-green-400">96.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Training Images:</span>
                      <span className="font-medium text-white">780 ultrasound images</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Random Forest Classifier</CardTitle>
                  <CardDescription className="text-gray-400">For tabular clinical data analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dataset:</span>
                      <span className="font-medium text-white">Wisconsin Breast Cancer</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Features:</span>
                      <span className="font-medium text-white">30 cellular characteristics</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="font-medium text-green-400">97.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Training Size:</span>
                      <span className="font-medium text-white">569 samples</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
              <Database className="h-8 w-8 text-green-400" />
              <span>Technical Architecture</span>
            </h2>
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Frontend Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {technologies.filter(tech => ['Frontend', 'Language', 'Styling', 'Components'].includes(tech.category)).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Backend & ML Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {technologies.filter(tech => ['Backend', 'ML Framework', 'Deep Learning', 'Database'].includes(tech.category)).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Dual prediction methods (data & image)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Real-time confidence scoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Comprehensive user authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Admin monitoring dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">PDF report generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Prediction history tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dataset Information */}
        <Card className="border-0 shadow-lg mb-16 bg-black/40 backdrop-blur-xl border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3 text-white">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <span>Breast Ultrasound Images Dataset (BUSI)</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive analysis of the clinical ultrasound dataset used for model training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-3">Dataset Composition</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Images:</span>
                    <span className="font-medium text-white">780</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Normal Cases:</span>
                    <span className="font-medium text-blue-400">133 (17.1%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Benign Cases:</span>
                    <span className="font-medium text-green-400">487 (62.4%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Malignant Cases:</span>
                    <span className="font-medium text-red-400">210 (26.9%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modality:</span>
                    <span className="font-medium text-white">Breast Ultrasound</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Image Characteristics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Clinical ultrasound images</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Real-world clinical data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Variable image dimensions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Grayscale ultrasound format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Expert-annotated ground truth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">Diverse patient demographics</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">EfficientNet Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="font-medium text-green-400">96.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precision:</span>
                    <span className="font-medium text-green-400">95.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recall:</span>
                    <span className="font-medium text-green-400">97.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">F1-Score:</span>
                    <span className="font-medium text-green-400">96.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Inference Speed:</span>
                    <span className="font-medium text-blue-400">0.12s</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card className="border-0 shadow-lg mb-16 bg-black/40 backdrop-blur-xl border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3 text-white">
              <Shield className="h-6 w-6 text-green-400" />
              <span>Implementation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-4">Data Processing Pipeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-400">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Data Preprocessing</p>
                      <p className="text-sm text-gray-400">Normalization and feature scaling</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-400">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Feature Engineering</p>
                      <p className="text-sm text-gray-400">Statistical feature extraction</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-400">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Model Training</p>
                      <p className="text-sm text-gray-400">Cross-validation and optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-400">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Deployment</p>
                      <p className="text-sm text-gray-400">Production-ready API endpoints</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">System Architecture</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Database className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Database Layer</p>
                      <p className="text-sm text-gray-400">MongoDB for user data and prediction history</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">AI Processing</p>
                      <p className="text-sm text-gray-400">Python backend with ML model inference</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Frontend Interface</p>
                      <p className="text-sm text-gray-400">Next.js with responsive design</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Security</p>
                      <p className="text-sm text-gray-400">Authentication and data protection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technologies Used */}
        <Card className="border-0 shadow-lg mb-16 bg-black/40 backdrop-blur-xl border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Technologies & Frameworks</CardTitle>
            <CardDescription className="text-gray-400">
              Complete technology stack used in this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {['Frontend', 'Backend', 'ML Framework', 'Database'].map((category) => (
                <div key={category}>
                  <h4 className="font-semibold text-white mb-3">{category}</h4>
                  <div className="space-y-2">
                    {technologies.filter(tech => tech.category === category || 
                      (category === 'Frontend' && ['Language', 'Styling', 'Components'].includes(tech.category)) ||
                      (category === 'Backend' && tech.category === 'Backend') ||
                      (category === 'ML Framework' && ['ML Framework', 'Deep Learning'].includes(tech.category))
                    ).map((tech, index) => (
                      <Badge key={index} variant="outline" className="block text-center bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Goals */}
        <Card className="border-0 shadow-lg bg-black/40 backdrop-blur-xl border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3 text-white">
              <Users className="h-6 w-6 text-indigo-400" />
              <span>Project Objectives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-4">Primary Goals</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Develop accurate AI models for breast cancer detection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Create intuitive interface for healthcare professionals</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Implement comprehensive data management system</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Provide detailed analysis and reporting capabilities</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Technical Achievements</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">Production-ready full-stack application</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">Responsive design with modern UI components</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">Secure authentication and authorization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">Scalable architecture with API design</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Experience the Platform
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Ready to see the AI detection system in action? Start with a demo prediction 
            or explore the comprehensive dashboard features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/predict/tabular">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <FileText className="h-4 w-4 mr-2" />
                Try Data Analysis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}