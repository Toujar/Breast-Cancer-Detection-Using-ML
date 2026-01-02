'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Database, RefreshCw, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';

interface SyncStats {
  total: number;
  synced: number;
  skipped: number;
  errors: number;
}

export default function SyncUsersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [testUserId, setTestUserId] = useState('');

  const handleSyncUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sync-users', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStats(data.stats);
        toast.success(`Sync completed! ${data.stats.synced} users synced.`);
      } else {
        toast.error(data.error || 'Failed to sync users');
      }
    } catch (error) {
      console.error('Error syncing users:', error);
      toast.error('Failed to sync users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!testUserId.trim()) {
      toast.error('Please enter a user ID to test');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testUserId: testUserId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to test webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <EnhancedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Synchronization</h1>
          <p className="text-gray-400">
            Sync users from Clerk to MongoDB and test webhook functionality
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sync Users Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync All Users
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sync all existing users from Clerk to MongoDB database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSyncUsers}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing Users...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Start Sync
                  </>
                )}
              </Button>

              {syncStats && (
                <div className="space-y-2 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-white">Sync Results:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <Badge variant="outline" className="text-white border-gray-600">
                        {syncStats.total}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Synced:</span>
                      <Badge className="bg-green-600 hover:bg-green-700">
                        {syncStats.synced}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Skipped:</span>
                      <Badge className="bg-yellow-600 hover:bg-yellow-700">
                        {syncStats.skipped}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Errors:</span>
                      <Badge className="bg-red-600 hover:bg-red-700">
                        {syncStats.errors}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Webhook Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Webhook
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test webhook functionality with a specific user ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID (from Clerk)
                </label>
                <input
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="user_2abc123def456..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleTestWebhook}
                disabled={isTesting || !testUserId.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Webhook
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-2">Sync All Users:</h4>
              <p className="text-sm">
                This will fetch all users from Clerk and create corresponding records in MongoDB. 
                Users that already exist will be skipped.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Test Webhook:</h4>
              <p className="text-sm">
                Enter a specific Clerk user ID to test the webhook logic manually. 
                This helps verify that the user creation process works correctly.
              </p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> Make sure your Clerk webhook is properly configured to point to 
                <code className="bg-gray-700 px-1 rounded">/api/webhooks/clerk</code> for automatic user creation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}