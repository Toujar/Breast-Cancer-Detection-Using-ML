'use client';

import { AIChatbot } from './ai-chatbot';

interface PageSpecificChatbotProps {
  context: string;
  className?: string;
}

/**
 * Use this component when you want to override the automatic context detection
 * and provide a specific context for a particular page or section.
 * 
 * Example usage:
 * <PageSpecificChatbot 
 *   context="Prediction Results - Help users understand their specific diagnosis and next steps" 
 * />
 */
export function PageSpecificChatbot({ context, className }: PageSpecificChatbotProps) {
  return <AIChatbot context={context} className={className} />;
}