'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeedDoctorsButton } from '@/components/seed-doctors-button';
import { RealDoctorsSection } from '@/components/real-doctors-section';
import { 
  Stethoscope, 
  MapPin, 
  Hospital, 
  User, 
  Phone,
  Star,
  Calendar
} from 'lucide-react';

interface Doctor {
  _id: string;
  username: string;
  email: string;
  specialization: string;
  hospital: string;
  location: string;
  experience: number;
  registrationNumber: string;
}

export default function TestDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsByLocation, setDoctorsByLocation] = useState<Record<string, Doctor[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('Bangalore Urban');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-doctors');
      const data = await response.json();
      setDoctors(data.doctors || []);
      setDoctorsByLocation(data.byLocation || {});
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const locations = Object.keys(doctorsByLocation);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Database Test Page
          </h1>
          <p className="text-gray-600">
            Test the seeded Karnataka doctors and appointment booking system
          </p>
        </div>

        {/* Seeding Controls */}
        <SeedDoctorsButton />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Stethoscope className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{doctors.length}</p>
              <p className="text-sm text-gray-600">Total Doctors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{locations.length}</p>
              <p className="text-sm text-gray-600">Locations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Hospital className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">
                {new Set(doctors.map(d => d.hospital)).size}
              </p>
              <p className="text-sm text-gray-600">Hospitals</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">
                {new Set(doctors.map(d => d.specialization)).size}
              </p>
              <p className="text-sm text-gray-600">Specializations</p>
            </CardContent>
          </Card>
        </div>

        {/* Location Selector */}
        {locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Location to View Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                  >
                    {location} ({doctorsByLocation[location].length})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctors List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading doctors...</p>
            </CardContent>
          </Card>
        ) : doctors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
              <p className="text-gray-600 mb-4">
                Please run the seeding script to add Karnataka doctors to the database.
              </p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                npm run seed:doctors
              </code>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctors by Location */}
            <Card>
              <CardHeader>
                <CardTitle>Doctors in {selectedLocation}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(doctorsByLocation[selectedLocation] || []).map((doctor) => (
                    <div key={doctor._id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{doctor.username}</h4>
                        <Badge variant="outline">{doctor.experience}y exp</Badge>
                      </div>
                      <p className="text-blue-600 font-medium text-sm mb-1">
                        {doctor.specialization}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">{doctor.hospital}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {doctor.location}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {doctor.registrationNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Booking Test */}
            <Card>
              <CardHeader>
                <CardTitle>Test Appointment Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Mock AI Result</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Risk Level:</strong> Medium</p>
                    <p><strong>Confidence:</strong> 85%</p>
                    <p><strong>Summary:</strong> Test AI screening result for appointment booking</p>
                  </div>
                </div>

                <RealDoctorsSection 
                  userLocation={selectedLocation}
                  aiResult={{
                    riskLevel: 'Medium',
                    confidence: 85,
                    summary: 'Test AI screening result for appointment booking',
                    predictionId: 'test-prediction-123'
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Seed the Database</h4>
              <p className="text-sm text-gray-600 mb-2">
                Run this command in your terminal to add 16 real Karnataka doctors:
              </p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                npm run seed:doctors
              </code>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Test Doctor Login</h4>
              <p className="text-sm text-gray-600 mb-2">
                Use these credentials to login as a doctor:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p><strong>Email:</strong> dr.rajesh@kidwai.ac.in</p>
                <p><strong>Password:</strong> doctor123</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Test Patient Flow</h4>
              <p className="text-sm text-gray-600">
                Register as a patient with location "Bangalore Urban" to see nearby doctors in the results page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}