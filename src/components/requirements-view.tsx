
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


import type { ValidationResult, ComplianceResult } from '@/lib/types';

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

function FileUpload({ onFileUpload, transcript, isRecording, startRecording, stopRecording }: any) {
    const {
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            onFileUpload(text);
        };
        reader.readAsText(file);
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'text/plain': ['.txt', '.md'], 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx']} });
    
    React.useEffect(() => {
        if(transcript) {
            onFileUpload(transcript)
        }
    }, [transcript, onFileUpload])

    return (
        <div className="flex flex-col gap-4">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
            isDragActive ? 'border-primary bg-muted/50' : 'border-input'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            {isDragActive
              ? 'Drop the files here ...'
              : "Drag 'n' drop a requirements file here, or click to select a file"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">TXT, PDF, DOC, DOCX</p>
        </div>
        {browserSupportsSpeechRecognition && (
            <div className="flex items-center justify-center">
                <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? 'destructive' : 'outline'} size="icon" className="rounded-full w-16 h-16">
                    <Mic className="h-6 w-6" />
                </Button>
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            <CardTitle>Upload & Analyze Requirements</CardTitle>
            <CardDescription>
              Upload your software requirements document, or use your voice. Our AI
              will analyze it for completeness and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          {isClient ? <FileUpload
              onFileUpload={setRequirementsText}
              transcript={transcript}
              isRecording={listening}
              startRecording={SpeechRecognition.startListening}
              stopRecording={SpeechRecognition.stopListening}
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
            /> : <span></span>}
            {requirementsText && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Loaded Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{requirementsText.substring(0, 500)}{requirementsText.length > 500 && '...'}</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
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
            <Button onClick={handleAnalyze} disabled={isPending} className="w-full">
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
