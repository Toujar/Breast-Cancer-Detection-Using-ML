import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    trim: true
  },
  consultationFee: {
    type: Number,
    default: 500
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  totalPatients: {
    type: Number,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String,
    default: ['English', 'Hindi']
  }],
  awards: [{
    title: String,
    year: Number,
    organization: String
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
doctorSchema.index({ location: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ experience: -1 });
doctorSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

// Virtual for display name
doctorSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get doctor's availability status
doctorSchema.methods.getAvailabilityStatus = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todaySlot = this.availableSlots.find(slot => slot.day === currentDay);
  
  if (!todaySlot) {
    return 'Not available today';
  }
  
  if (currentTime >= todaySlot.startTime && currentTime <= todaySlot.endTime) {
    return 'Available now';
  }
  
  return `Available ${todaySlot.startTime} - ${todaySlot.endTime}`;
};

// Static method to find doctors by location
doctorSchema.statics.findByLocation = function(location: string) {
  return this.find({ 
    location: new RegExp(location, 'i'), 
    isActive: true, 
    isVerified: true 
  }).sort({ rating: -1, experience: -1 });
};

// Static method to find doctors by specialization
doctorSchema.statics.findBySpecialization = function(specialization: string) {
  return this.find({ 
    specialization: new RegExp(specialization, 'i'), 
    isActive: true, 
    isVerified: true 
  }).sort({ rating: -1, experience: -1 });
};

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;