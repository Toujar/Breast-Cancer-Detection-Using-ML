# 🚀 Frontend-Backend Integration Guide

## Overview

This guide explains how to configure your Next.js frontend to work with both local development and production ML backend APIs.

## 🔧 Environment Configuration

### Development (.env.local)

Create `.env.local` for local development:

```env
# Backend API URLs
NEW_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Production (Vercel Environment Variables)

Set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEW_BACKEND_URL` | `https://breast-cancer-detection-using-ml-okdd.onrender.com` | Production |
| `NEXT_PUBLIC_API_URL` | `https://breast-cancer-detection-using-ml-okdd.onrender.com` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://early-breast-cancer-detection.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |

## 🔄 How It Works

### Architecture

```
Frontend (Vercel) → Next.js API Routes → ML Backend (Render)
```

### API Flow

1. **Client-side requests** go to Next.js API routes (`/api/predict/*`)
2. **Next.js API routes** proxy requests to the ML backend
3. **ML backend** processes the request and returns results
4. **Next.js API routes** store results in MongoDB and return to client

### Environment-based URL Resolution

```typescript
// lib/api.ts automatically selects the correct URL:

// Development: http://localhost:8000
// Production:  https://breast-cancer-detection-using-ml-okdd.onrender.com
```

## 🛠️ API Usage Examples

### Image Prediction

```typescript
import { predictionApi } from '@/lib/api';

// Upload image for prediction
const result = await predictionApi.predictImage(file, true);
```

### Tabular Prediction

```typescript
import { predictionApi } from '@/lib/api';

// Submit tabular data
const result = await predictionApi.predictTabular({
  radius_mean: 14.5,
  texture_mean: 18.2,
  // ... other features
});
```

### Health Check

```typescript
import { checkApiHealth, getApiStatus } from '@/lib/api';

// Simple health check
const isOnline = await checkApiHealth();

// Detailed status
const status = await getApiStatus();
```

## 🔍 API Status Component

Add the API status component to monitor backend connectivity:

```tsx
import { ApiStatus } from '@/components/api-status';

export default function Dashboard() {
  return (
    <div>
      <ApiStatus showDetails={true} />
      {/* Your dashboard content */}
    </div>
  );
}
```

## 🌐 CORS Configuration

The ML backend is configured to accept requests from:

- `https://early-breast-cancer-detection.vercel.app` (Production)
- `http://localhost:3000` (Development)
- `http://localhost:8000` (Local backend)

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Vercel domain is added to backend CORS origins
   - Check that environment variables are set correctly

2. **API Timeout**
   - ML predictions can take 30-60 seconds
   - Increase timeout in `lib/api.ts` if needed

3. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check variable names match exactly

### Debug Information

```typescript
import { debugApi } from '@/lib/api';

console.log('API Debug Info:', debugApi);
// Shows: baseUrl, environment, endpoints
```

## 📝 File Structure

```
├── lib/
│   └── api.ts                 # Main API configuration
├── components/
│   └── api-status.tsx         # API status component
├── app/api/predict/
│   ├── image/route.ts         # Image prediction proxy
│   └── tabular/route.ts       # Tabular prediction proxy
├── .env.local.example         # Development environment template
├── .env.example               # Production environment template
└── DEPLOYMENT_GUIDE.md        # This guide
```

## ✅ Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] `.env.local` configured for development
- [ ] API status component shows "Online"
- [ ] Image predictions work in both environments
- [ ] Tabular predictions work in both environments
- [ ] CORS allows Vercel → Render communication
- [ ] No hardcoded localhost URLs in production

## 🔗 URLs Summary

| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Development** | `http://localhost:3000` | `http://localhost:8000` |
| **Production** | `https://early-breast-cancer-detection.vercel.app` | `https://breast-cancer-detection-using-ml-okdd.onrender.com` |

## 🎯 Next Steps

1. Set environment variables in Vercel
2. Deploy frontend to Vercel
3. Test predictions in production
4. Monitor API status with the status component
5. Check logs for any CORS or connectivity issues