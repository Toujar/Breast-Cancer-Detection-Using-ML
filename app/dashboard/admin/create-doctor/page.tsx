'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  UserPlus,
  ArrowLeft,
  Mail,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Building,
  Stethoscope,
  Award,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateDoctorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialization: '',
    hospital: '',
    location: '',
    experience: '',
    qualification: '',
    licenseNumber: '',
    phoneNumber: '',
    rating: '4.5'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.hospital.trim()) {
      newErrors.hospital = 'Hospital/Clinic name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = 'Please enter a valid number of years';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (formData.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Doctor account created successfully for ${formData.firstName} ${formData.lastName}`);
        router.push('/dashboard/admin/doctors');
      } else {
        toast.error(data.error || 'Failed to create doctor account');
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast.error('Error creating doctor account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <EnhancedNavbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/admin/doctors" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manage Doctors
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
            Create Doctor Account
          </h1>
          <p className="text-gray-400 text-lg">
            Add a new medical professional to the breast cancer detection system
          </p>
        </div>

        {/* Create Doctor Form */}
        <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <UserPlus className="h-5 w-5 text-blue-400" />
              <span>Doctor Information</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter the details for the new doctor account. They will receive login credentials via email.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.firstName ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.lastName ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-300 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.phoneNumber ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="password" className="text-gray-300 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Temporary Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter temporary password (min 8 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">
                    The doctor will be prompted to change this password on first login.
                  </p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-t border-gray-700/30 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-gray-300 flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="e.g., Oncologist, Breast Cancer Specialist"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.specialization ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.specialization && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.specialization}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification" className="text-gray-300 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Qualification
                    </Label>
                    <Input
                      id="qualification"
                      type="text"
                      placeholder="e.g., MBBS, MD (Oncology)"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.qualification ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.qualification && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.qualification}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Experience (Years)
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g., 15"
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.experience ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.experience && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-gray-300 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="e.g., KMC-45789"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.licenseNumber ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.licenseNumber && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.licenseNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t border-gray-700/30 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Location Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospital" className="text-gray-300 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Hospital/Clinic Name
                    </Label>
                    <Input
                      id="hospital"
                      type="text"
                      placeholder="e.g., Kidwai Memorial Institute of Oncology"
                      value={formData.hospital}
                      onChange={(e) => handleInputChange('hospital', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.hospital ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.hospital && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.hospital}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Bangalore, Karnataka"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                        errors.location ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Alert className="border-blue-500/30 bg-blue-500/10">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  The new doctor will automatically be assigned the "doctor" role and will have access to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Doctor dashboard with patient management tools</li>
                    <li>Prediction analysis and review capabilities</li>
                    <li>Patient history and medical records access</li>
                    <li>System analytics and reporting features</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700/30">
                <Link href="/dashboard/admin/doctors">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Doctor Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}