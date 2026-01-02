import { SignUp } from '@clerk/nextjs';
import { getCurrentUser, getDashboardUrl } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  // Check if user is already signed in
  const user = await getCurrentUser();
  
  if (user) {
    // Redirect to appropriate dashboard
    redirect(getDashboardUrl(user.role));
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400">
            Join our breast cancer detection platform
          </p>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Patient Registration Only:</strong> This signup is for patients only. 
              Medical professionals receive credentials from administrators.
            </p>
          </div>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-800 border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-700 border-gray-600 text-white",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              identityPreviewText: "text-gray-300",
              identityPreviewEditButton: "text-blue-400",
            }
          }}
          forceRedirectUrl="/api/auth/callback"
        />
      </div>
    </div>
  );
}