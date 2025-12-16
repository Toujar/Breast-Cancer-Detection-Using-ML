'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Star, 
  Clock, 
  Calendar, 
  Phone, 
  Stethoscope,
  Hospital,
  CheckCircle,
  Loader2,
  AlertTriangle,
  MapPin,
  User
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  location: string;
  experience: number;
  distance: number;
  rating: string;
  availability: string;
  consultationModes: string[];
}

interface AIResult {
  riskLevel: string;
  confidence: number;
  summary: string;
  predictionId: string;
}

interface RealDoctorsSectionProps {
  userLocation?: string;
  aiResult: AIResult;
}

export function RealDoctorsSection({ userLocation, aiResult }: RealDoctorsSectionProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Appointment form data
  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    patientAge: '',
    patientContact: '',
    consultationMode: 'online' as 'online' | 'in-person',
    preferredDate: '',
    symptoms: ''
  });

  useEffect(() => {
    if (userLocation) {
      fetchNearbyDoctors();
    }
  }, [userLocation]);

  const fetchNearbyDoctors = async () => {
    if (!userLocation) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctors/nearby?location=${encodeURIComponent(userLocation)}`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingOpen(true);
    setBookingSuccess(false);
  };

  const submitAppointmentRequest = async () => {
    if (!selectedDoctor || !appointmentData.patientName || !appointmentData.patientAge || !appointmentData.patientContact) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          patientName: appointmentData.patientName,
          patientAge: parseInt(appointmentData.patientAge),
          patientContact: appointmentData.patientContact,
          consultationMode: appointmentData.consultationMode,
          preferredDate: appointmentData.preferredDate,
          symptoms: appointmentData.symptoms,
          aiResult: {
            riskLevel: aiResult.riskLevel,
            confidence: aiResult.confidence,
            summary: aiResult.summary,
            predictionId: aiResult.predictionId,
            imageAnalysis: `AI screening result: ${aiResult.riskLevel} risk level with ${aiResult.confidence}% confidence`
          }
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
        // Reset form
        setAppointmentData({
          patientName: '',
          patientAge: '',
          patientContact: '',
          consultationMode: 'online',
          preferredDate: '',
          symptoms: ''
        });
      } else {
        throw new Error('Failed to send appointment request');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to send appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="mb-4 p-4 rounded-lg shadow-md bg-white border-l-4 border-green-500">
      <h5 className="font-semibold text-green-700 mb-1">👩‍⚕️ Verified Doctors (Cancer Specialists)</h5>
      <p className="text-sm text-gray-700 mb-3">Book appointments with verified doctors for breast examination.</p>

      {isLoading ? (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 mx-auto mb-2 text-green-600 animate-spin" />
          <p className="text-sm text-gray-600">Finding doctors near you...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">No verified doctors found in your area.</p>
          <p className="text-xs text-gray-500 mt-1">Visit your nearest PHC for referral.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-green-100 text-green-600">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h6 className="font-medium text-gray-900 text-sm">{doctor.name}</h6>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium ml-1">{doctor.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {doctor.experience}y exp
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-green-600 font-medium text-xs mb-1">{doctor.specialization}</p>
                    <p className="text-gray-600 text-xs mb-2">{doctor.hospital}</p>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{doctor.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{doctor.availability}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {doctor.consultationModes.map((mode) => (
                          <Badge key={mode} variant="secondary" className="text-xs px-1 py-0">
                            {mode === 'online' ? '💻' : '🏥'}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => handleBookAppointment(doctor)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {doctors.length > 0 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-600">
                Showing {doctors.length} verified doctors in your area
              </p>
            </div>
          )}
        </div>
      )}

      {/* Appointment Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Appointment
            </DialogTitle>
          </DialogHeader>
          
          {bookingSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Request Sent Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your appointment request has been sent to {selectedDoctor?.name}.
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left mb-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The doctor will review your request and AI results</li>
                  <li>• You'll receive a notification when they respond</li>
                  <li>• The doctor can accept or suggest alternative times</li>
                </ul>
              </div>
              <Button onClick={() => setIsBookingOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDoctor && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Booking with:</h4>
                  <p className="text-sm"><strong>{selectedDoctor.name}</strong></p>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.hospital}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Full Name *</Label>
                  <Input
                    id="patientName"
                    placeholder="Enter your full name"
                    value={appointmentData.patientName}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, patientName: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Age *</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      placeholder="Age"
                      value={appointmentData.patientAge}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, patientAge: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientContact">Phone *</Label>
                    <Input
                      id="patientContact"
                      placeholder="Phone number"
                      value={appointmentData.patientContact}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, patientContact: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Consultation Mode *</Label>
                  <RadioGroup
                    value={appointmentData.consultationMode}
                    onValueChange={(value: 'online' | 'in-person') => 
                      setAppointmentData(prev => ({ ...prev, consultationMode: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">💻 Online Consultation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label htmlFor="in-person">🏥 In-Person Visit</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={appointmentData.preferredDate}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Additional Symptoms (Optional)</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe any symptoms or concerns..."
                    value={appointmentData.symptoms}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, symptoms: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className={`p-3 rounded-lg border ${getRiskColor(aiResult.riskLevel)}`}>
                  <h4 className="font-medium mb-2">AI Screening Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Risk Level:</strong> {aiResult.riskLevel}</p>
                    <p><strong>Confidence:</strong> {aiResult.confidence}%</p>
                    <p><strong>Summary:</strong> {aiResult.summary}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Disclaimer:</strong> This AI screening result will be shared with the doctor 
                      for medical evaluation. AI results are for screening purposes only.
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBookingOpen(false)} 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitAppointmentRequest}
                    disabled={!appointmentData.patientName || !appointmentData.patientAge || !appointmentData.patientContact || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}