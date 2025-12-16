'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DoctorAppointment } from './doctor-appointment';
import { Calendar } from 'lucide-react';

interface DoctorAppointmentDialogProps {
  aiResult?: {
    riskLevel: string;
    confidence: number;
    summary: string;
  };
  triggerText?: string;
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function DoctorAppointmentDialog({ 
  aiResult, 
  triggerText = "Appoint Doctor",
  triggerVariant = "default",
  className 
}: DoctorAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DoctorAppointment 
          aiResult={aiResult}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}