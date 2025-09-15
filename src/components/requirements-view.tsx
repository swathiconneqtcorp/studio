
'use client';
import 'regenerator-runtime/runtime'
import React, { useState, useTransition, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Mic, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runValidation, runComplianceCheck } from '@/app/actions';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { cn } from '@/lib/utils';


import type { ValidationResult, ComplianceResult } from '@/lib/types';
import FileUploadProgress from './file-upload-progress';

type RequirementsViewProps = {
  requirementsText: string;
  setRequirementsText: (text: string) => void;
  onAnalysisComplete: (validation: ValidationResult, compliance: ComplianceResult, requirements: string) => void;
};

const complianceOptions = [
  { id: 'FDA', label: 'FDA' },
  { id: 'GDPR', label: 'GDPR' },
  { id: 'ISO', label: 'ISO 13485' },
  { id: 'HIPAA', label: 'HIPAA' },
];

function FileUpload({ onFileUpload, transcript, isRecording, startRecording, stopRecording, onFileSelect, isUploading, uploadProgress, file, onCancelUpload }: any) {
    const {
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            onFileSelect(file);
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                onFileUpload(text);
            };
            reader.readAsText(file);
        }
    }, [onFileSelect, onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'text/plain': ['.txt', '.md'], 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx']} });
    
    React.useEffect(() => {
        if(transcript) {
            onFileUpload(transcript)
        }
    }, [transcript, onFileUpload])

    if (isUploading && file) {
      return (
        <FileUploadProgress
          fileName={file.name}
          fileSize={`${(file.size / 1024 / 1024).toFixed(2)}MB`}
          progress={uploadProgress}
          onCancel={onCancelUpload}
        />
      );
    }

    return (
        <div className="flex flex-col items-center gap-6">
             <div
                {...getRootProps()}
                className={cn(
                    'relative flex w-full flex-col items-center justify-center p-10 rounded-xl cursor-pointer transition-colors',
                    'bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm shadow-lg',
                     isDragActive ? 'border-primary' : 'border-border/50'
                )}
            >
                <div className='h-full w-full rounded-xl'>
                    <input {...getInputProps()} />
                    <div className='flex flex-col items-center justify-center'>
                        <UploadCloud className="w-12 h-12 text-primary" />
                        <p className="mt-4 text-center text-foreground">
                            {isDragActive
                                ? 'Drop the files here ...'
                                : "Drag 'n' drop a requirements file here, or click to select"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">TXT, PDF, DOC, DOCX</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center w-full">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-border"></div>
            </div>

            {browserSupportsSpeechRecognition && (
                <div className="flex flex-col items-center gap-2">
                    <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? 'destructive' : 'outline'} size="icon" className="rounded-full w-20 h-20">
                        <Mic className="h-8 w-8" />
                    </Button>
                    <p className="text-sm text-muted-foreground">{isRecording ? 'Recording... click to stop' : 'Use your voice'}</p>
                </div>
            )}
        </div>
      );
}

export default function RequirementsView({
  requirementsText,
  setRequirementsText,
  onAnalysisComplete,
}: RequirementsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['FDA']);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const {
      transcript,
      listening,
      resetTranscript,
      browserSupportsSpeechRecognition
    } = useSpeechRecognition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadCancelled, setUploadCancelled] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadCancelled(false);
  };
  
  const handleCancelUpload = () => {
    setUploadCancelled(true);
    setIsUploading(false);
    setUploadedFile(null);
    setRequirementsText('');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUploading && uploadProgress < 100 && !uploadCancelled) {
      timer = setInterval(() => {
        setUploadProgress(prev => {
            const next = prev + 10;
            if (next >= 100) {
                clearInterval(timer);
                setIsUploading(false);
                return 100;
            }
            return next;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isUploading, uploadProgress, uploadCancelled]);

  const handleAnalyze = () => {
    startTransition(async () => {
      try {
        const reqText = requirementsText || "Login screen";
        const standards = selectedStandards.length > 0 ? selectedStandards.join(', ') : 'FDA';

        const [validation, compliance] = await Promise.all([
          runValidation(reqText),
          runComplianceCheck(
            reqText,
            standards
          ),
        ]);
        toast({
          title: 'Analysis Complete',
          description: 'Requirements analysis is ready on the next screen.',
        });
        onAnalysisComplete(validation, compliance, reqText);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Analysis Failed',
          description: 'An error occurred during the analysis.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleStandardChange = (standardId: string) => {
    setSelectedStandards((prev) =>
      prev.includes(standardId)
        ? prev.filter((id) => id !== standardId)
        : [...prev, standardId]
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Import Requirement</CardTitle>
            <CardDescription>
              Upload your software requirements document or use your voice. Our AI
              will analyze it for completeness and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          {isClient ? <FileUpload
              onFileUpload={setRequirementsText}
              transcript={transcript}
              isRecording={listening}
              startRecording={SpeechRecognition.startListening}
              stopRecording={SpeechRecognition.stopListening}
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              file={uploadedFile}
              onCancelUpload={handleCancelUpload}
            /> : <div className="h-64 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center"><Loader2 className='h-8 w-8 animate-spin' /></div>}
            
            {requirementsText && !isUploading && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Loaded Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{requirementsText.substring(0, 500)}{requirementsText.length > 500 && '...'}</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-4">
              <Label>Select Compliance Standards</Label>
              <div className="flex flex-wrap gap-4">
                {complianceOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedStandards.includes(option.id)}
                      onCheckedChange={() => handleStandardChange(option.id)}
                    />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={isPending || !requirementsText || isUploading} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze & Continue'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
