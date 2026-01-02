import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function updateAdminRole() {
  try {
    console.log('🔍 Updating admin user role...');

    // Use the user ID from the middleware logs
    const userId = 'user_377ALafUdVAV6eWR3jwVL7YhfO9';

    // Get the current user
    const currentUser = await clerkClient.users.getUser(userId);
    console.log(`📧 Found user: ${currentUser.emailAddresses[0]?.emailAddress}`);
    console.log(`🆔 User ID: ${currentUser.id}`);
    console.log(`👤 Current role: ${currentUser.publicMetadata?.role || 'none'}`);
    console.log(`📋 Current publicMetadata:`, currentUser.publicMetadata);

    // Update the user's role
    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin',
      },
    });

    console.log('✅ Admin role updated successfully!');
    console.log(`👤 New role: ${updatedUser.publicMetadata?.role}`);
    console.log(`📋 New publicMetadata:`, updatedUser.publicMetadata);
    console.log('\n🔄 Please sign out and sign back in for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
    if (error.errors) {
      console.error('Error details:', error.errors);
    }
  }
}

updateAdminRole();