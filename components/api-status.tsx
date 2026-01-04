'use client';

import { useState, useEffect } from 'react';
import { getApiStatus } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function ApiStatus({ showDetails = false, className = '' }: ApiStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getApiStatus();
      setStatus(result);
    } catch (error) {
      setStatus({
        online: false,
        error: 'Failed to check API status',
        environment: process.env.NODE_ENV,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Checking API status...</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (status?.online) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (status?.online) {
      return <Badge variant="default" className="bg-green-500">Online</Badge>;
    }
    return <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">ML API Status:</span>
        {getStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          onClick={checkStatus}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {showDetails && status && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Environment: {status.environment}</div>
          <div>Base URL: {status.baseUrl}</div>
          {status.version && <div>Version: {status.version}</div>}
          {status.error && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{status.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}