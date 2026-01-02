import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUserSync() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the specific user from the logs
    const testUserId = 'user_378kfG8IrPrlLJEpeFNMjvdBQfq';
    
    console.log(`🔍 Checking user: ${testUserId}`);

    // Check if user exists in MongoDB
    const mongoUser = await User.findOne({ clerkId: testUserId });
    
    if (mongoUser) {
      console.log('✅ User exists in MongoDB:');
      console.log(`   Name: ${mongoUser.firstName} ${mongoUser.lastName}`);
      console.log(`   Email: ${mongoUser.email}`);
      console.log(`   Role: ${mongoUser.role}`);
      console.log(`   Created: ${mongoUser.createdAt.toLocaleString()}`);
    } else {
      console.log('❌ User NOT found in MongoDB');
      console.log('🔧 This confirms the webhook issue - user exists in Clerk but not in MongoDB');
    }

    // Get total counts
    const totalMongoUsers = await User.countDocuments();
    const allUsers = await User.find({}, 'clerkId firstName lastName email role createdAt').limit(10);
    
    console.log('\n📊 Summary:');
    console.log(`   Total MongoDB users: ${totalMongoUsers}`);
    
    if (allUsers.length > 0) {
      console.log('\n👥 Recent users in MongoDB:');
      allUsers.forEach(user => {
        console.log(`   ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.createdAt.toLocaleDateString()}`);
      });
    } else {
      console.log('\n❌ No users found in MongoDB - webhook is definitely not working');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUserSync();