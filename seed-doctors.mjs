import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phase2';

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  phoneNumber: { type: String },
  role: { type: String, enum: ["user", "admin", "doctor"], default: "user" },
  isActive: { type: Boolean, default: true },
  location: { type: String, required: true },
  specialization: { type: String },
  hospital: { type: String },
  registrationNumber: { type: String },
  experience: { type: Number }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Real Karnataka doctors data
const karnatakaDoctor = [
  {
    username: 'Dr. Rajesh Kumar Sharma',
    email: 'dr.rajesh@kidwai.ac.in',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Oncologist & Breast Cancer Specialist',
    hospital: 'Kidwai Memorial Institute of Oncology',
    registrationNumber: 'KMC-45789',
    experience: 15,
    phoneNumber: '+91 80-2659-4000',
    age: 45
  },
  {
    username: 'Dr. Priya Menon',
    email: 'dr.priya@manipalhospitals.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Radiologist & Breast Imaging Specialist',
    hospital: 'Manipal Hospital, Bangalore',
    registrationNumber: 'KMC-38456',
    experience: 12,
    phoneNumber: '+91 80-2502-4444',
    age: 38
  },
  {
    username: 'Dr. Suresh Babu K',
    email: 'dr.suresh@narayanahealth.org',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Surgical Oncologist',
    hospital: 'Narayana Health City',
    registrationNumber: 'KMC-29847',
    experience: 18,
    phoneNumber: '+91 80-7122-2200',
    age: 50
  },
  {
    username: 'Dr. Lakshmi Devi R',
    email: 'dr.lakshmi@apollohospitals.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Medical Oncologist',
    hospital: 'Apollo Hospital, Bangalore',
    registrationNumber: 'KMC-41256',
    experience: 14,
    phoneNumber: '+91 80-2692-2222',
    age: 42
  },
  {
    username: 'Dr. Arun Kumar Joshi',
    email: 'dr.arun@fortishealthcare.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Breast Surgeon',
    hospital: 'Fortis Hospital, Bangalore',
    registrationNumber: 'KMC-35678',
    experience: 16,
    phoneNumber: '+91 80-6621-4444',
    age: 48
  },
  {
    username: 'Dr. Kavitha Subramanian',
    email: 'dr.kavitha@stjohns.in',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Gynecologic Oncologist',
    hospital: 'St. John\'s Medical College Hospital',
    registrationNumber: 'KMC-42789',
    experience: 13,
    phoneNumber: '+91 80-2206-5000',
    age: 40
  },
  {
    username: 'Dr. Manjunath Reddy',
    email: 'dr.manjunath@hcgoncology.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Radiation Oncologist',
    hospital: 'HCG Cancer Centre',
    registrationNumber: 'KMC-39654',
    experience: 11,
    phoneNumber: '+91 80-4142-2222',
    age: 36
  },
  {
    username: 'Dr. Deepa Nair',
    email: 'dr.deepa@bmcri.edu.in',
    password: 'doctor123',
    role: 'doctor',
    location: 'Bangalore Urban',
    specialization: 'Pathologist & Cytopathologist',
    hospital: 'Bangalore Medical College and Research Institute',
    registrationNumber: 'KMC-28934',
    experience: 20,
    phoneNumber: '+91 80-2670-1150',
    age: 52
  },
  // Mysuru doctors
  {
    username: 'Dr. Ramesh Chandra',
    email: 'dr.ramesh@jsshospital.org',
    password: 'doctor123',
    role: 'doctor',
    location: 'Mysuru',
    specialization: 'Oncologist',
    hospital: 'JSS Hospital, Mysuru',
    registrationNumber: 'KMC-51234',
    experience: 19,
    phoneNumber: '+91 821-2548-000',
    age: 51
  },
  {
    username: 'Dr. Sunitha Rao',
    email: 'dr.sunitha@apollomysore.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Mysuru',
    specialization: 'Breast Surgeon',
    hospital: 'Apollo BGS Hospital, Mysuru',
    registrationNumber: 'KMC-46789',
    experience: 10,
    phoneNumber: '+91 821-2566-2222',
    age: 37
  },
  // Hubli doctors
  {
    username: 'Dr. Sanjeev Kulgod',
    email: 'dr.sanjeev@kctri.org',
    password: 'doctor123',
    role: 'doctor',
    location: 'Hubli',
    specialization: 'Surgical Oncologist',
    hospital: 'KCTRI – Karnataka Cancer Therapy & Research Institute',
    registrationNumber: 'KMC-33445',
    experience: 22,
    phoneNumber: '+91 836-2377-777',
    age: 55
  },
  {
    username: 'Dr. G. Mehar Kumar',
    email: 'dr.mehar@hcghubli.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Hubli',
    specialization: 'Medical & Radiation Oncologist',
    hospital: 'HCG NMR Cancer Centre, Hubli',
    registrationNumber: 'KMC-37890',
    experience: 17,
    phoneNumber: '+91 836-2235-555',
    age: 49
  },
  // Belagavi doctors
  {
    username: 'Dr. Vishwas Pai',
    email: 'dr.vishwas@klehospital.org',
    password: 'doctor123',
    role: 'doctor',
    location: 'Belagavi',
    specialization: 'Surgical Oncologist',
    hospital: 'KLE\'s Dr. Prabhakar Kore Hospital',
    registrationNumber: 'KMC-44567',
    experience: 14,
    phoneNumber: '+91 831-2444-444',
    age: 43
  },
  {
    username: 'Dr. Rekha Nayak',
    email: 'dr.rekha@klehospital.org',
    password: 'doctor123',
    role: 'doctor',
    location: 'Belagavi',
    specialization: 'Radiation Oncologist',
    hospital: 'KLE\'s Dr. Prabhakar Kore Hospital',
    registrationNumber: 'KMC-48901',
    experience: 9,
    phoneNumber: '+91 831-2444-445',
    age: 34
  },
  // Mangaluru doctors
  {
    username: 'Dr. Prasad Shetty',
    email: 'dr.prasad@manipalmangalore.com',
    password: 'doctor123',
    role: 'doctor',
    location: 'Dakshina Kannada',
    specialization: 'Oncologist',
    hospital: 'Manipal Hospital, Mangaluru',
    registrationNumber: 'KMC-52341',
    experience: 16,
    phoneNumber: '+91 824-2570-444',
    age: 47
  },
  {
    username: 'Dr. Shobha Kamath',
    email: 'dr.shobha@ajhospital.in',
    password: 'doctor123',
    role: 'doctor',
    location: 'Dakshina Kannada',
    specialization: 'Breast Surgeon',
    hospital: 'AJ Hospital & Research Centre, Mangaluru',
    registrationNumber: 'KMC-49876',
    experience: 12,
    phoneNumber: '+91 824-2225-533',
    age: 39
  }
];

async function seedDoctors() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if doctors already exist
    const existingDoctors = await User.find({ role: 'doctor' });
    if (existingDoctors.length > 0) {
      console.log(`📋 Found ${existingDoctors.length} existing doctors. Skipping seeding.`);
      console.log('💡 If you want to re-seed, please delete existing doctors first.');
      return;
    }

    console.log('🌱 Seeding Karnataka doctors...');
    
    for (const doctorData of karnatakaDoctor) {
      try {
        // Check if doctor already exists by email
        const existingDoctor = await User.findOne({ email: doctorData.email });
        if (existingDoctor) {
          console.log(`⚠️  Doctor ${doctorData.username} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);
        
        // Create doctor
        const doctor = await User.create({
          ...doctorData,
          password: hashedPassword,
          isActive: true
        });

        console.log(`✅ Created doctor: ${doctor.username} - ${doctor.specialization}`);
      } catch (error) {
        console.error(`❌ Error creating doctor ${doctorData.username}:`, error.message);
      }
    }

    console.log('\n🎉 Doctor seeding completed!');
    
    // Display summary
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    console.log(`\n📊 Summary:`);
    console.log(`Total doctors in database: ${totalDoctors}`);
    
    // Group by location
    const doctorsByLocation = await User.aggregate([
      { $match: { role: 'doctor' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📍 Doctors by location:');
    doctorsByLocation.forEach(loc => {
      console.log(`  ${loc._id}: ${loc.count} doctors`);
    });

  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDoctors();