
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Folder, Loader2, X } from 'lucide-react';

type FileUploadProgressProps = {
  fileName: string;
  fileSize: string;
  progress: number;
  onCancel: () => void;
};

export default function FileUploadProgress({
  fileName,
  fileSize,
  progress,
  onCancel,
}: FileUploadProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-border/30">
        <CardContent className="p-4 relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onCancel}>
                <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4 mt-6">
            <div className="relative">
                <Folder className="w-16 h-16 text-primary" strokeWidth={1.5} />
                <div className="absolute -bottom-1 -right-2 bg-slate-700/50 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs">
                    FILES
                </div>
            </div>
            <div className="flex-1">
                <p className="font-semibold">{fileName}</p>
                <p className="text-sm text-muted-foreground">{fileSize}</p>
            </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                    <span className="ml-auto font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
