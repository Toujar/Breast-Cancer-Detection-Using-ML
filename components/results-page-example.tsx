'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorAppointmentDialog } from './doctor-appointment-dialog';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ResultsPageExampleProps {
  result: {
    riskLevel: 'Low' | 'Medium' | 'High';
    confidence: number;
    summary: string;
    recommendations: string[];
  };
}

export function ResultsPageExample({ result }: ResultsPageExampleProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="h-5 w-5" />;
      case 'Medium': return <Info className="h-5 w-5" />;
      case 'High': return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Screening Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getRiskColor(result.riskLevel)}`}>
            {getRiskIcon(result.riskLevel)}
            <div>
              <div className="font-semibold">Risk Level: {result.riskLevel}</div>
              <div className="text-sm opacity-80">Confidence: {result.confidence}%</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Analysis Summary</h4>
            <p className="text-muted-foreground text-sm">{result.summary}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex gap-3">
              <DoctorAppointmentDialog
                aiResult={{
                  riskLevel: result.riskLevel,
                  confidence: result.confidence,
                  summary: result.summary
                }}
                triggerText="Book Appointment"
                className="flex-1"
              />
              <DoctorAppointmentDialog
                aiResult={{
                  riskLevel: result.riskLevel,
                  confidence: result.confidence,
                  summary: result.summary
                }}
                triggerText="Second Opinion"
                triggerVariant="outline"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Important:</strong> This AI screening is for preliminary assessment only. 
                Please consult with a qualified healthcare professional for proper diagnosis and treatment.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}