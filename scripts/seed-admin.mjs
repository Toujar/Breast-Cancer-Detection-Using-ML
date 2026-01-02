import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function seedAdmin() {
  try {
    console.log('Creating admin account...');

    const admin = await clerkClient.users.createUser({
      emailAddress: ['kundenayaktoujar@gmail.com'],
      firstName: 'System',
      lastName: 'Administrator',
      password: 'toujar1234',
      publicMetadata: {
        role: 'admin',
      },
      skipPasswordChecks: false,
      skipPasswordRequirement: false,
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: kundenayaktoujar@gmail.com');
    console.log('🔑 Password: toujar1234!');
    console.log('👤 Role: admin');
    console.log(`🆔 User ID: ${admin.id}`);
    
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    
  } catch (error) {
    if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
      console.log('ℹ️  Admin account already exists');
    } else {
      console.error('❌ Error creating admin account:', error);
    }
  }
}

seedAdmin();