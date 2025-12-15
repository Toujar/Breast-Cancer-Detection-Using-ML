# AI Chatbot Integration Guide

## Overview
The AI chatbot is now integrated across all pages of your breast cancer detection application. It uses OpenRouter with GPT-4o-mini to provide contextual assistance to users.

## Features
- **Context-Aware**: Automatically detects the current page and provides relevant assistance
- **Floating Interface**: Minimalist floating button that expands to a chat interface
- **Real-time Responses**: Powered by OpenRouter API for fast, accurate responses
- **Medical Focus**: Specifically trained to help with breast cancer detection and analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables
Add your OpenRouter API key to `.env.local`:

```env
AI_PROVIDER=openrouter
AI_MODEL=openai/gpt-4o-mini
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
```

### 2. Automatic Integration
The chatbot is automatically available on all pages through the root layout. No additional setup required!

### 3. Custom Context (Optional)
For specific pages that need custom context, you can use the `PageSpecificChatbot` component:

```tsx
import { PageSpecificChatbot } from '@/components/page-specific-chatbot';

export default function PredictionPage() {
  return (
    <div>
      {/* Your page content */}
      <PageSpecificChatbot 
        context="Prediction Results - Help users understand their diagnosis and recommended next steps"
      />
    </div>
  );
}
```

## How It Works

### Automatic Context Detection
The chatbot automatically detects the current page and provides relevant context:

- **Prediction Pages**: Helps with image upload and result interpretation
- **Results Pages**: Explains confidence levels and recommendations
- **Dashboard**: Assists with navigation and trend analysis
- **Doctor Portal**: Provides clinical insights and patient management help
- **Admin Panel**: Supports system administration tasks
- **And more...**

### API Integration
- **Endpoint**: `/api/chat`
- **Method**: POST
- **Payload**: `{ message: string, context: string }`
- **Response**: `{ message: string }`

### Security Features
- API keys are server-side only
- No sensitive information is exposed to the client
- Rate limiting and error handling included

## Customization

### Styling
The chatbot uses your existing UI components and follows your design system:
- Uses Tailwind CSS classes
- Integrates with your existing color scheme
- Responsive design with proper z-index management

### Context Customization
Edit `hooks/use-chatbot-context.ts` to modify automatic context detection:

```typescript
const getContextFromPath = (path: string): string => {
  if (path.includes('/your-custom-page')) {
    return 'Your custom context here';
  }
  // ... other conditions
};
```

### AI Behavior
Modify the system prompt in `app/api/chat/route.ts` to adjust the AI's behavior:

```typescript
{
  role: 'system',
  content: `Your custom system prompt here...`
}
```

## Usage Examples

### Basic Usage
The chatbot appears as a floating blue button in the bottom-right corner. Users can:
1. Click the button to open the chat interface
2. Type questions about the current page or general system usage
3. Receive contextual, helpful responses
4. Close the chat or minimize it as needed

### Example Conversations

**On Prediction Page:**
- User: "How do I upload an image?"
- AI: "To upload an image for analysis, click the upload button and select a mammography image. The system accepts JPEG, PNG, and DICOM formats..."

**On Results Page:**
- User: "What does 85% confidence mean?"
- AI: "An 85% confidence level means the AI model is quite certain about its prediction. This indicates a high likelihood that the analysis is accurate..."

## Troubleshooting

### Common Issues
1. **Chatbot not appearing**: Check that your API key is correctly set in `.env.local`
2. **No responses**: Verify your OpenRouter API key is valid and has sufficient credits
3. **Context not updating**: Clear browser cache and refresh the page

### Error Handling
The chatbot includes built-in error handling:
- Network errors show user-friendly messages
- API failures gracefully degrade
- Loading states provide visual feedback

## Performance Considerations
- The chatbot loads only when needed (lazy loading)
- Messages are processed asynchronously
- Minimal impact on page load times
- Efficient state management with React hooks

## Future Enhancements
- Message history persistence
- Voice input/output capabilities
- Integration with user profiles
- Advanced analytics and insights
- Multi-language support

## Support
For technical issues or customization requests, refer to the main project documentation or contact the development team.