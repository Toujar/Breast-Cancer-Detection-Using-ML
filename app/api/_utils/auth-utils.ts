import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function getCurrentUser(): Promise<any | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = (user.publicMetadata?.role as string) || 'user';
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function requireUser(): Promise<any> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('UNAUTHORIZED');
    throw err;
  }
  return user;
}

export async function requireAdmin(): Promise<any> {
  const user = await requireUser();
  if (user.role !== 'admin') {
    const err = new Error('FORBIDDEN');
    throw err;
  }
  return user;
}


