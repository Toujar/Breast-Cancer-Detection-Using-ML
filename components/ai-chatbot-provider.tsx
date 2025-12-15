'use client';

import { AIChatbot } from './ai-chatbot';
import { useChatbotContext } from '@/hooks/use-chatbot-context';

interface AIChatbotProviderProps {
  context?: string;
  children: React.ReactNode;
}

export function AIChatbotProvider({ context, children }: AIChatbotProviderProps) {
  const autoContext = useChatbotContext();
  const finalContext = context || autoContext;

  return (
    <>
      {children}
      <AIChatbot context={finalContext} />
    </>
  );
}