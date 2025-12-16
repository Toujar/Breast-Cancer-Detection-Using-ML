import { usePathname } from 'next/navigation';

export function useChatbotContext() {
  const pathname = usePathname();

  const getContextFromPath = (path: string): string => {
    if (path.includes('/predict')) {
      return 'Prediction Analysis - Help users understand how to upload images and interpret prediction results';
    }
    if (path.includes('/results')) {
      return 'Results Interpretation - Explain prediction confidence, risk levels, recommended actions, and help users understand how to book appointments with doctors';
    }
    if (path.includes('/dashboard')) {
      return 'Dashboard Overview - Help users navigate their medical history and understand trends';
    }
    if (path.includes('/doctor')) {
      return 'Doctor Portal - Assist healthcare professionals with patient management and clinical insights';
    }
    if (path.includes('/admin')) {
      return 'Admin Panel - Support system administration and user management tasks';
    }
    if (path.includes('/analytics')) {
      return 'Analytics & Reports - Help interpret system performance and usage statistics';
    }
    if (path.includes('/research')) {
      return 'Research Data - Assist with understanding research findings and clinical studies';
    }
    if (path.includes('/help')) {
      return 'Help & Support - Provide comprehensive assistance with system features';
    }
    if (path.includes('/settings')) {
      return 'Settings & Configuration - Help users customize their experience and preferences';
    }
    if (path.includes('/about')) {
      return 'About the System - Explain the technology, accuracy, and medical validation behind the AI';
    }
    
    return 'AI Breast Cancer Detection System - General assistance with the platform';
  };

  return getContextFromPath(pathname);
}