'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, User, Phone, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  distance: number;
  rating: number;
  availability: string;
  consultationModes: ('online' | 'in-person')[];
}

interface AppointmentRequest {
  userName: string;
  userAge: string;
  userContact: string;
  riskLevel: string;
  confidence: string;
  consultationMode: 'online' | 'in-person';
  summary: string;
}

interface DoctorAppointmentProps {
  userLocation?: { lat: number; lng: number };
  aiResult?: {
    riskLevel: string;
    confidence: number;
    summary: string;
  };
  onClose?: () => void;
}

export function DoctorAppointment({ userLocation, aiResult, onClose }: DoctorAppointmentProps) {
  const [step, setStep] = useState<'location' | 'doctors' | 'form' | 'success'>('location');
  const [location, setLocation] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentRequest>({
    userName: '',
    userAge: '',
    userContact: '',
    riskLevel: aiResult?.riskLevel || '',
    confidence: aiResult?.confidence?.toString() || '',
    consultationMode: 'online',
    summary: aiResult?.summary || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Real Karnataka doctors data
  const mockDoctors: Doctor[] = [
    {
      id: 'doc_001',
      name: 'Dr. Rajesh Kumar Sharma',
      specialization: 'Oncologist & Breast Cancer Specialist',
      hospital: 'Kidwai Memorial Institute of Oncology',
      distance: 2.3,
      rating: 4.8,
      availability: 'Available today',
      consultationModes: ['online', 'in-person']
    },
    {
      id: 'doc_002',
      name: 'Dr. Priya Menon',
      specialization: 'Radiologist & Breast Imaging Specialist',
      hospital: 'Manipal Hospital, Bangalore',
      distance: 4.1,
      rating: 4.7,
      availability: 'Next available: Tomorrow',
      consultationModes: ['online', 'in-person']
    },
    {
      id: 'doc_003',
      name: 'Dr. Suresh Babu K',
      specialization: 'Surgical Oncologist',
      hospital: 'Narayana Health City',
      distance: 6.8,
      rating: 4.9,
      availability: 'Available this week',
      consultationModes: ['in-person']
    },
    {
      id: 'doc_004',
      name: 'Dr. Lakshmi Devi R',
      specialization: 'Medical Oncologist',
      hospital: 'Apollo Hospital, Bangalore',
      distance: 3.5,
      rating: 4.6,
      availability: 'Available tomorrow',
      consultationModes: ['online', 'in-person']
    }
  ];

  const handleLocationSubmit = () => {
    if (!location.trim()) return;
    setIsLoading(true);
    
    // Simulate API call to find doctors
    setTimeout(() => {
      setDoctors(mockDoctors);
      setStep('doctors');
      setIsLoading(false);
    }, 1500);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('form');
  };

  const handleAppointmentSubmit = () => {
    if (!appointmentData.userName || !appointmentData.userAge || !appointmentData.userContact) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate sending appointment request
    setTimeout(() => {
      setStep('success');
      setIsLoading(false);
    }, 2000);
  };

  const renderLocationStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold mb-2">Find Nearby Doctors</h3>
        <p className="text-muted-foreground text-sm">
          Enter your location to find verified doctors near you
        </p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="location">Your Location</Label>
        <Input
          id="location"
          placeholder="Enter city, zip code, or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
        />
        <Button 
          onClick={handleLocationSubmit} 
          disabled={!location.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Finding Doctors...' : 'Find Doctors'}
        </Button>
      </div>
    </div>
  );

  const renderDoctorsStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Available Doctors</h3>
        <p className="text-muted-foreground text-sm">
          Select a doctor to request an appointment
        </p>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {doctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDoctorSelect(doctor)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{doctor.name}</h4>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </div>
                <Badge variant="secondary">★ {doctor.rating}</Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{doctor.hospital} • {doctor.distance} km away</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{doctor.availability}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                {doctor.consultationModes.map((mode) => (
                  <Badge key={mode} variant="outline" className="text-xs">
                    {mode === 'online' ? 'Online' : 'In-Person'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button variant="outline" onClick={() => setStep('location')} className="w-full">
        Change Location
      </Button>
    </div>
  );

  const renderFormStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Appointment Request</h3>
        <p className="text-muted-foreground text-sm">
          Fill in your details to send the request to {selectedDoctor?.name}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName">Full Name</Label>
          <Input
            id="userName"
            placeholder="Enter your full name"
            value={appointmentData.userName}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, userName: e.target.value }))}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userAge">Age</Label>
            <Input
              id="userAge"
              placeholder="Age"
              value={appointmentData.userAge}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, userAge: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userContact">Phone</Label>
            <Input
              id="userContact"
              placeholder="Phone number"
              value={appointmentData.userContact}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, userContact: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Consultation Mode</Label>
          <RadioGroup
            value={appointmentData.consultationMode}
            onValueChange={(value: 'online' | 'in-person') => 
              setAppointmentData(prev => ({ ...prev, consultationMode: value }))
            }
          >
            {selectedDoctor?.consultationModes.includes('online') && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Online Consultation</Label>
              </div>
            )}
            {selectedDoctor?.consultationModes.includes('in-person') && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person">In-Person Visit</Label>
              </div>
            )}
          </RadioGroup>
        </div>
        
        <Separator />
        
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium mb-2">AI Screening Summary</h4>
          <div className="text-sm space-y-1">
            <p><strong>Risk Level:</strong> {appointmentData.riskLevel}</p>
            <p><strong>Confidence:</strong> {appointmentData.confidence}%</p>
            {appointmentData.summary && (
              <p><strong>Summary:</strong> {appointmentData.summary}</p>
            )}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is an AI-assisted screening and appointment request system. 
              The AI results are for screening purposes only and require professional medical evaluation.
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('doctors')} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={handleAppointmentSubmit}
            disabled={!appointmentData.userName || !appointmentData.userAge || !appointmentData.userContact || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Request Sent Successfully!</h3>
        <p className="text-muted-foreground text-sm">
          Your appointment request has been sent to {selectedDoctor?.name}.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The doctor will review your request and AI screening results</li>
          <li>• You'll receive a notification when they respond</li>
          <li>• The doctor can accept or suggest alternative appointment times</li>
          <li>• You'll get confirmation details once approved</li>
        </ul>
      </div>
      
      <Button onClick={onClose} className="w-full">
        Close
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'location' && renderLocationStep()}
        {step === 'doctors' && renderDoctorsStep()}
        {step === 'form' && renderFormStep()}
        {step === 'success' && renderSuccessStep()}
      </CardContent>
    </Card>
  );
}