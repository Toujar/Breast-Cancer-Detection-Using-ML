'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export function SeedDoctorsButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [doctorCount, setDoctorCount] = useState<number | null>(null);

  const checkDoctors = async () => {
    try {
      const response = await fetch('/api/test-doctors');
      const data = await response.json();
      setDoctorCount(data.total);
      return data;
    } catch (error) {
      console.error('Error checking doctors:', error);
      return null;
    }
  };

  const seedDoctors = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      // This would typically be done server-side, but for demo purposes
      setSeedResult('Please run: npm run seed:doctors in your terminal');
      
      // Check if doctors exist after a delay
      setTimeout(async () => {
        const data = await checkDoctors();
        if (data && data.total > 0) {
          setSeedResult(`✅ Found ${data.total} doctors in database!`);
        }
      }, 2000);
      
    } catch (error) {
      setSeedResult('❌ Error seeding doctors');
    } finally {
      setIsSeeding(false);
    }
  };

  const testDoctorAPI = async () => {
    const data = await checkDoctors();
    if (data) {
      setSeedResult(`📊 Database Status: ${data.total} doctors found`);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Doctor Database Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Current doctors in database: <strong>{doctorCount ?? 'Unknown'}</strong></p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testDoctorAPI}
            variant="outline"
            size="sm"
          >
            Check Database
          </Button>
          
          <Button 
            onClick={seedDoctors}
            disabled={isSeeding}
            size="sm"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              'Seed Doctors'
            )}
          </Button>
        </div>

        {seedResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{seedResult}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>To seed doctors:</strong></p>
          <code className="bg-gray-100 px-2 py-1 rounded">npm run seed:doctors</code>
        </div>
      </CardContent>
    </Card>
  );
}