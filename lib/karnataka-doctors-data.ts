export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  location: string;
  experience: number;
  qualification: string;
  registrationNumber: string;
  contactNumber: string;
  email: string;
  consultationFee: {
    online: number;
    inPerson: number;
  };
  availability: string[];
  rating: number;
  totalPatients: number;
  languages: string[];
}

export const karnatakaDoctor: Doctor[] = [
  {
    id: 'doc_001',
    name: 'Dr. Rajesh Kumar Sharma',
    specialization: 'Oncologist & Breast Cancer Specialist',
    hospital: 'Kidwai Memorial Institute of Oncology',
    location: 'Bangalore, Karnataka',
    experience: 15,
    qualification: 'MBBS, MD (Oncology), Fellowship in Breast Oncology (TATA Memorial)',
    registrationNumber: 'KMC-45789',
    contactNumber: '+91 80-2659-4000',
    email: 'dr.rajesh@kidwai.ac.in',
    consultationFee: {
      online: 800,
      inPerson: 1200
    },
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    rating: 4.8,
    totalPatients: 2500,
    languages: ['English', 'Hindi', 'Kannada']
  },
  {
    id: 'doc_002',
    name: 'Dr. Priya Menon',
    specialization: 'Radiologist & Breast Imaging Specialist',
    hospital: 'Manipal Hospital, Bangalore',
    location: 'HAL Airport Road, Bangalore',
    experience: 12,
    qualification: 'MBBS, MD (Radiology), Fellowship in Breast Imaging (AIIMS)',
    registrationNumber: 'KMC-38456',
    contactNumber: '+91 80-2502-4444',
    email: 'dr.priya@manipalhospitals.com',
    consultationFee: {
      online: 600,
      inPerson: 900
    },
    availability: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
    rating: 4.7,
    totalPatients: 1800,
    languages: ['English', 'Malayalam', 'Kannada', 'Tamil']
  },
  {
    id: 'doc_003',
    name: 'Dr. Suresh Babu K',
    specialization: 'Surgical Oncologist',
    hospital: 'Narayana Health City',
    location: 'Bommasandra, Bangalore',
    experience: 18,
    qualification: 'MBBS, MS (Surgery), MCh (Surgical Oncology)',
    registrationNumber: 'KMC-29847',
    contactNumber: '+91 80-7122-2200',
    email: 'dr.suresh@narayanahealth.org',
    consultationFee: {
      online: 1000,
      inPerson: 1500
    },
    availability: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    rating: 4.9,
    totalPatients: 3200,
    languages: ['English', 'Kannada', 'Telugu', 'Tamil']
  },
  {
    id: 'doc_004',
    name: 'Dr. Lakshmi Devi R',
    specialization: 'Medical Oncologist',
    hospital: 'Apollo Hospital, Bangalore',
    location: 'Bannerghatta Road, Bangalore',
    experience: 14,
    qualification: 'MBBS, MD (Internal Medicine), DM (Medical Oncology)',
    registrationNumber: 'KMC-41256',
    contactNumber: '+91 80-2692-2222',
    email: 'dr.lakshmi@apollohospitals.com',
    consultationFee: {
      online: 750,
      inPerson: 1100
    },
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    rating: 4.6,
    totalPatients: 2100,
    languages: ['English', 'Kannada', 'Telugu', 'Hindi']
  },
  {
    id: 'doc_005',
    name: 'Dr. Arun Kumar Joshi',
    specialization: 'Breast Surgeon',
    hospital: 'Fortis Hospital, Bangalore',
    location: 'Cunningham Road, Bangalore',
    experience: 16,
    qualification: 'MBBS, MS (Surgery), Fellowship in Breast Surgery (UK)',
    registrationNumber: 'KMC-35678',
    contactNumber: '+91 80-6621-4444',
    email: 'dr.arun@fortishealthcare.com',
    consultationFee: {
      online: 900,
      inPerson: 1300
    },
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    rating: 4.8,
    totalPatients: 2800,
    languages: ['English', 'Hindi', 'Kannada']
  },
  {
    id: 'doc_006',
    name: 'Dr. Kavitha Subramanian',
    specialization: 'Gynecologic Oncologist',
    hospital: 'St. John\'s Medical College Hospital',
    location: 'Koramangala, Bangalore',
    experience: 13,
    qualification: 'MBBS, MS (Obstetrics & Gynecology), Fellowship in Gynecologic Oncology',
    registrationNumber: 'KMC-42789',
    contactNumber: '+91 80-2206-5000',
    email: 'dr.kavitha@stjohns.in',
    consultationFee: {
      online: 700,
      inPerson: 1000
    },
    availability: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    rating: 4.7,
    totalPatients: 1900,
    languages: ['English', 'Tamil', 'Kannada', 'Malayalam']
  },
  {
    id: 'doc_007',
    name: 'Dr. Manjunath Reddy',
    specialization: 'Radiation Oncologist',
    hospital: 'HCG Cancer Centre',
    location: 'K R Road, Bangalore',
    experience: 11,
    qualification: 'MBBS, MD (Radiation Oncology), Fellowship in Stereotactic Radiosurgery',
    registrationNumber: 'KMC-39654',
    contactNumber: '+91 80-4142-2222',
    email: 'dr.manjunath@hcgoncology.com',
    consultationFee: {
      online: 650,
      inPerson: 950
    },
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    rating: 4.5,
    totalPatients: 1600,
    languages: ['English', 'Kannada', 'Telugu', 'Hindi']
  },
  {
    id: 'doc_008',
    name: 'Dr. Deepa Nair',
    specialization: 'Pathologist & Cytopathologist',
    hospital: 'Bangalore Medical College and Research Institute',
    location: 'Fort, Bangalore',
    experience: 20,
    qualification: 'MBBS, MD (Pathology), Fellowship in Cytopathology (AIIMS)',
    registrationNumber: 'KMC-28934',
    contactNumber: '+91 80-2670-1150',
    email: 'dr.deepa@bmcri.edu.in',
    consultationFee: {
      online: 500,
      inPerson: 750
    },
    availability: ['Monday', 'Wednesday', 'Friday'],
    rating: 4.9,
    totalPatients: 3500,
    languages: ['English', 'Malayalam', 'Kannada', 'Hindi']
  }
];

export const getRandomDoctor = (): Doctor => {
  const randomIndex = Math.floor(Math.random() * karnatakaDoctor.length);
  return karnatakaDoctor[randomIndex];
};

export const getDoctorsByLocation = (location: string): Doctor[] => {
  // In a real app, this would filter by actual location proximity
  return karnatakaDoctor.filter(doctor => 
    doctor.location.toLowerCase().includes(location.toLowerCase()) ||
    doctor.hospital.toLowerCase().includes(location.toLowerCase())
  );
};

export const getDoctorsBySpecialization = (specialization: string): Doctor[] => {
  return karnatakaDoctor.filter(doctor => 
    doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
  );
};