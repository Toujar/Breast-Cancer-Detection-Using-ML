import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic']
    },
    notes: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalPredictions: {
      type: Number,
      default: 0
    },
    lastPredictionDate: Date,
    totalConsultations: {
      type: Number,
      default: 0
    },
    lastConsultationDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.role === 'doctor' ? `Dr. ${this.firstName} ${this.lastName}` : `${this.firstName} ${this.lastName}`;
});

// Method to update login stats
userSchema.methods.updateLoginStats = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// Method to increment prediction count
userSchema.methods.incrementPredictions = function() {
  this.stats.totalPredictions += 1;
  this.stats.lastPredictionDate = new Date();
  return this.save();
};

// Method to increment consultation count
userSchema.methods.incrementConsultations = function() {
  this.stats.totalConsultations += 1;
  this.stats.lastConsultationDate = new Date();
  return this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const totalUsers = await this.countDocuments({ isActive: true });
  const totalDoctors = await this.countDocuments({ role: 'doctor', isActive: true });
  const totalPatients = await this.countDocuments({ role: 'user', isActive: true });
  const verifiedUsers = await this.countDocuments({ isVerified: true, isActive: true });
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = await this.countDocuments({ 
    createdAt: { $gte: firstDayOfMonth },
    isActive: true 
  });

  return {
    totalUsers,
    totalDoctors,
    totalPatients,
    verifiedUsers,
    newUsersThisMonth
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;