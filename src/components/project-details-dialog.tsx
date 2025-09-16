'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { ProjectDetails } from '@/lib/types';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

type ProjectDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: ProjectDetails) => void;
  initialData: ProjectDetails | null;
  isLoading: boolean;
};

const emptyDetails: ProjectDetails = {
    appName: '',
    objective: '',
    features: [],
    techStack: [],
};

export default function ProjectDetailsDialog({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
}: ProjectDetailsDialogProps) {
  const [details, setDetails] = useState<ProjectDetails>(initialData || emptyDetails);

  useEffect(() => {
    if (initialData) {
      setDetails(initialData);
    } else {
      setDetails(emptyDetails);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onConfirm(details);
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !details.techStack.includes(value)) {
        setDetails(prev => ({...prev, techStack: [...prev.techStack, value]}));
      }
      (e.target as HTMLInputElement).value = '';
    }
  };

  const removeTechStack = (tech: string) => {
    setDetails(prev => ({...prev, techStack: prev.techStack.filter(t => t !== tech)}));
  };
  
  const handleFeaturesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !details.features.includes(value)) {
        setDetails(prev => ({...prev, features: [...prev.features, value]}));
      }
      (e.target as HTMLInputElement).value = '';
    }
  };

  const removeFeature = (feature: string) => {
    setDetails(prev => ({...prev, features: prev.features.filter(f => f !== feature)}));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Project Details</DialogTitle>
          <DialogDescription>
            Our AI has parsed the following details from your requirements. Please review and confirm or edit them.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appName" className="text-right">
                App Name
              </Label>
              <Input
                id="appName"
                value={details.appName}
                onChange={(e) => setDetails({...details, appName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="objective" className="text-right">
                Objective
              </Label>
              <Textarea
                id="objective"
                value={details.objective}
                onChange={(e) => setDetails({...details, objective: e.target.value})}
                className="col-span-3"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="features" className="text-right pt-2">
                Features
              </Label>
               <div className="col-span-3">
                <Input
                  id="features"
                  placeholder="Type a feature and press Enter"
                  onKeyDown={handleFeaturesKeyDown}
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                    {details.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {feature}
                            <button onClick={() => removeFeature(feature)} className="rounded-full hover:bg-background/50">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="techStack" className="text-right pt-2">
                Tech Stack
              </Label>
              <div className="col-span-3">
                <Input
                  id="techStack"
                  placeholder="Type a technology and press Enter"
                  onKeyDown={handleTechStackKeyDown}
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                    {details.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <button onClick={() => removeTechStack(tech)} className="rounded-full hover:bg-background/50">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>Confirm & Analyze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
