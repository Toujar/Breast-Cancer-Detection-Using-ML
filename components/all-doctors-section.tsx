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
  consultationFee?: number;
  totalPatients?: number;
  qualification?: string;
  bio?: string;
  languages?: string[];
  profileImage?: string;
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
      const response = await fetch('/api/doctors?limit=50');
      if (response.ok) {
        const data = await response.json();
        const doctorsWithDetails = (data.doctors || []).map((doctor: any) => ({
          id: doctor.id,
          name: doctor.fullName,
          specialization: doctor.specialization || "General Practitioner",
          hospital: doctor.hospital || "Private Practice",
          location: doctor.location,
          experience: doctor.experience || 0,
          registrationNumber: doctor.licenseNumber,
          distance: userLocation && doctor.location?.toLowerCase().includes(userLocation.toLowerCase()) 
            ? Math.random() * 5 + 1 // 1-6 km for same location
            : Math.random() * 20 + 10, // 10-30 km for different locations
          rating: doctor.rating ? doctor.rating.toFixed(1) : (4.2 + Math.random() * 0.8).toFixed(1), // Use actual rating or generate
          availability: doctor.availableSlots && doctor.availableSlots.length > 0 ? "Available today" : "Available this week",
          consultationModes: ["online", "in-person"],
          consultationFee: doctor.consultationFee,
          totalPatients: doctor.totalPatients,
          qualification: doctor.qualification,
          bio: doctor.bio,
          languages: doctor.languages,
          profileImage: doctor.profileImage
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
      case 'High': return 'text-red-300 bg-red-900/30 border-red-600/30';
      case 'Medium': return 'text-yellow-300 bg-yellow-900/30 border-yellow-600/30';
      case 'Low': return 'text-green-300 bg-green-900/30 border-green-600/30';
      default: return 'text-gray-300 bg-gray-800/30 border-gray-600/30';
    }
  };

  // Get unique locations and specializations for filters
  const uniqueLocations = Array.from(new Set(allDoctors.map(d => d.location))).filter(Boolean);
  const uniqueSpecializations = Array.from(new Set(allDoctors.map(d => d.specialization))).filter(Boolean);

  return (
    <Card className="shadow-xl rounded-3xl overflow-hidden border border-gray-700/30 bg-black/40 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 border-b border-gray-600/30">
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
                  className="pl-10 bg-black/60 border-gray-600/30 text-white placeholder-gray-400"
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-300">Filter by Location</Label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full mt-1 p-2 bg-black/60 border border-gray-600/30 rounded-md text-sm text-white"
              >
                <option value="all" className="bg-gray-800 text-white">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location} className="bg-gray-800 text-white">{location}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-300">Filter by Specialization</Label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full mt-1 p-2 bg-black/60 border border-gray-600/30 rounded-md text-sm text-white"
              >
                <option value="all" className="bg-gray-800 text-white">All Specializations</option>
                {uniqueSpecializations.map(spec => (
                  <option key={spec} value={spec} className="bg-gray-800 text-white">{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>{filteredDoctors.length}</strong> doctors found
            {userLocation && ` • Showing doctors near ${userLocation} first`}
          </p>
        </div>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-gray-300">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-semibold mb-2 text-white">No Doctors Found</h3>
            <p className="text-gray-300 mb-4">
              {allDoctors.length === 0 
                ? "No doctors are currently available in the database. Please contact admin to add doctors."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {allDoctors.length === 0 && (
              <p className="text-sm text-gray-400">
                Doctors can be added through the admin dashboard at{' '}
                <code className="bg-gray-800 px-2 py-1 rounded text-sm text-gray-300">
                  /dashboard/admin/create-doctor
                </code>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow border border-gray-700/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="h-12 w-12">
                      {doctor.profileImage ? (
                        <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white text-sm truncate">{doctor.name}</h4>
                        <div className="flex items-center ml-2">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium ml-1 text-gray-300">{doctor.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-blue-400 font-medium text-xs mb-1 truncate">{doctor.specialization}</p>
                      {doctor.qualification && (
                        <p className="text-gray-400 text-xs mb-1 truncate">{doctor.qualification}</p>
                      )}
                      <p className="text-gray-300 text-xs mb-2 truncate">{doctor.hospital}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{doctor.location}</span>
                        </div>
                        <Badge variant="outline" className="text-xs px-1 py-0 ml-2 border-gray-600 text-gray-300">
                          {doctor.experience}y
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{doctor.availability}</span>
                        </div>
                        {doctor.consultationFee && (
                          <span className="text-green-400 font-medium">₹{doctor.consultationFee}</span>
                        )}
                      </div>
                      
                      {doctor.totalPatients && (
                        <div className="flex items-center text-xs text-gray-400 mb-3">
                          <User className="h-3 w-3 mr-1" />
                          <span>{doctor.totalPatients}+ patients treated</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {doctor.consultationModes.map((mode) => (
                        <Badge key={mode} variant="secondary" className="text-xs px-1 py-0 bg-gray-700/50 text-gray-300 border-gray-600">
                          {mode === 'online' ? '💻' : '🏥'}
                        </Badge>
                      ))}
                      {doctor.languages && doctor.languages.length > 0 && (
                        <Badge variant="outline" className="text-xs px-1 py-0 border-gray-600 text-gray-400">
                          {doctor.languages.slice(0, 2).join(', ')}
                        </Badge>
                      )}
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
                      <Badge className="bg-green-900/50 text-green-300 text-xs border-green-600/30">
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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-black/90 border-gray-700/30 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
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
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30">
                  <h4 className="font-medium mb-2 text-white">What happens next?</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
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
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30">
                    <h4 className="font-medium mb-2 text-white">Booking with:</h4>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        {selectedDoctor.profileImage ? (
                          <img src={selectedDoctor.profileImage} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                            {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 font-semibold">{selectedDoctor.name}</p>
                        <p className="text-sm text-blue-400">{selectedDoctor.specialization}</p>
                        {selectedDoctor.qualification && (
                          <p className="text-xs text-gray-400">{selectedDoctor.qualification}</p>
                        )}
                        <p className="text-sm text-gray-400">{selectedDoctor.hospital}</p>
                        <p className="text-sm text-gray-400">{selectedDoctor.location}</p>
                        {selectedDoctor.consultationFee && (
                          <p className="text-sm text-green-400 font-medium">Consultation Fee: ₹{selectedDoctor.consultationFee}</p>
                        )}
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs text-gray-300">{selectedDoctor.rating} rating</span>
                          {selectedDoctor.totalPatients && (
                            <span className="text-xs text-gray-400 ml-2">• {selectedDoctor.totalPatients}+ patients</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-gray-300">Full Name *</Label>
                    <Input
                      id="patientName"
                      placeholder="Enter your full name"
                      value={appointmentData.patientName}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, patientName: e.target.value }))}
                      className="bg-black/60 border-gray-600/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientAge" className="text-gray-300">Age *</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        placeholder="Age"
                        value={appointmentData.patientAge}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, patientAge: e.target.value }))}
                        className="bg-black/60 border-gray-600/30 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientContact" className="text-gray-300">Phone *</Label>
                      <Input
                        id="patientContact"
                        placeholder="Phone number"
                        value={appointmentData.patientContact}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, patientContact: e.target.value }))}
                        className="bg-black/60 border-gray-600/30 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300">Consultation Mode *</Label>
                    <RadioGroup
                      value={appointmentData.consultationMode}
                      onValueChange={(value: 'online' | 'in-person') => 
                        setAppointmentData(prev => ({ ...prev, consultationMode: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="text-gray-300">💻 Online Consultation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label htmlFor="in-person" className="text-gray-300">🏥 In-Person Visit</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDate" className="text-gray-300">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={appointmentData.preferredDate}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-black/60 border-gray-600/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms" className="text-gray-300">Additional Symptoms (Optional)</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe any symptoms or concerns..."
                      value={appointmentData.symptoms}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, symptoms: e.target.value }))}
                      rows={3}
                      className="bg-black/60 border-gray-600/30 text-white placeholder-gray-400"
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

                  <div className="bg-yellow-900/30 border border-yellow-600/30 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-200">
                        <strong>Disclaimer:</strong> This AI screening result will be shared with the doctor 
                        for medical evaluation. AI results are for screening purposes only.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsBookingOpen(false)} 
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
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