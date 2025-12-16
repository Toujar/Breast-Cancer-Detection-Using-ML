'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  User,
  Filter,
  Search
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
  registrationNumber?: string;
}

interface AIResult {
  riskLevel: string;
  confidence: number;
  summary: string;
  predictionId: string;
}

interface AllDoctorsSectionProps {
  userLocation?: string;
  aiResult: AIResult;
}

export function AllDoctorsSection({ userLocation, aiResult }: AllDoctorsSectionProps) {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');

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
    fetchAllDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [allDoctors, searchTerm, selectedLocation, selectedSpecialization, userLocation]);

  const fetchAllDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-doctors');
      if (response.ok) {
        const data = await response.json();
        const doctorsWithDetails = (data.doctors || []).map((doctor: any, index: number) => ({
          id: doctor._id,
          name: doctor.username,
          specialization: doctor.specialization || "General Practitioner",
          hospital: doctor.hospital || "Private Practice",
          location: doctor.location,
          experience: doctor.experience || 0,
          registrationNumber: doctor.registrationNumber,
          distance: userLocation && doctor.location?.toLowerCase().includes(userLocation.toLowerCase()) 
            ? Math.random() * 5 + 1 // 1-6 km for same location
            : Math.random() * 20 + 10, // 10-30 km for different locations
          rating: (4.2 + Math.random() * 0.8).toFixed(1), // 4.2-5.0 rating
          availability: index < 3 ? "Available today" : "Available this week",
          consultationModes: ["online", "in-person"],
        }));
        setAllDoctors(doctorsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...allDoctors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(doctor => doctor.location === selectedLocation);
    }

    // Specialization filter
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    // Sort by user location first, then by rating
    filtered.sort((a, b) => {
      if (userLocation) {
        const aMatch = a.location?.toLowerCase().includes(userLocation.toLowerCase());
        const bMatch = b.location?.toLowerCase().includes(userLocation.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      return parseFloat(b.rating) - parseFloat(a.rating);
    });

    setFilteredDoctors(filtered);
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

  // Get unique locations and specializations for filters
  const uniqueLocations = [...new Set(allDoctors.map(d => d.location))].filter(Boolean);
  const uniqueSpecializations = [...new Set(allDoctors.map(d => d.specialization))].filter(Boolean);

  return (
    <Card className="shadow-xl rounded-3xl overflow-hidden glass-card border-2 border-blue-300 bg-gradient-to-br from-blue-50/95 via-white/95 to-indigo-50/95">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <Stethoscope className="h-7 w-7" />
          <span>All Verified Doctors in Karnataka</span>
        </CardTitle>
        <p className="text-blue-100 mt-2">
          Browse and book appointments with certified oncologists and specialists across Karnataka
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search doctors, specializations, or hospitals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('all');
                setSelectedSpecialization('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Filter by Location</Label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Filter by Specialization</Label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Specializations</option>
                {uniqueSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{filteredDoctors.length}</strong> doctors found
            {userLocation && ` • Showing doctors near ${userLocation} first`}
          </p>
        </div>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
            <p className="text-gray-600 mb-4">
              {allDoctors.length === 0 
                ? "Please run the seeding script to add doctors to the database."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {allDoctors.length === 0 && (
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                npm run seed:doctors
              </code>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{doctor.name}</h4>
                        <div className="flex items-center ml-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium ml-1">{doctor.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-blue-600 font-medium text-xs mb-1 truncate">{doctor.specialization}</p>
                      <p className="text-gray-600 text-xs mb-2 truncate">{doctor.hospital}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{doctor.location}</span>
                        </div>
                        <Badge variant="outline" className="text-xs px-1 py-0 ml-2">
                          {doctor.experience}y
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{doctor.availability}</span>
                      </div>
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
                      className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 h-7"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Book Now
                    </Button>
                  </div>
                  
                  {userLocation && doctor.location?.toLowerCase().includes(userLocation.toLowerCase()) && (
                    <div className="mt-2 text-center">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Near You
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
                    <li>• Check the doctor dashboard to see all requests</li>
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
                    <p className="text-sm text-gray-600">{selectedDoctor.location}</p>
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
      </CardContent>
    </Card>
  );
}