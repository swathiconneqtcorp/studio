
'use client';
import 'regenerator-runtime/runtime'
import React, { useState, useTransition, useCallback } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, ListChecks, Mic, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runValidation, runComplianceCheck } from '@/app/actions';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


import type { ValidationResult, ComplianceResult } from '@/lib/types';

type RequirementsViewProps = {
  requirementsText: string;
  setRequirementsText: (text: string) => void;
  validationResult: ValidationResult;
  setValidationResult: (result: ValidationResult) => void;
  complianceResult: ComplianceResult;
  setComplianceResult: (result: ComplianceResult) => void;
};

const complianceOptions = [
  { id: 'FDA', label: 'FDA' },
  { id: 'GDPR', label: 'GDPR' },
  { id: 'ISO', label: 'ISO 13485' },
  { id: 'HIPAA', label: 'HIPAA' },
];

function FileUpload({ onFileUpload, transcript, isRecording, startRecording, stopRecording, browserSupportsSpeechRecognition }: any) {
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

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

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
        <div className="flex items-center justify-center">
            <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? 'destructive' : 'outline'} size="icon" className="rounded-full w-16 h-16">
                <Mic className="h-6 w-6" />
            </Button>
        </div>
        </div>
      );
}

export default function RequirementsView({
  requirementsText,
  setRequirementsText,
  validationResult,
  setValidationResult,
  complianceResult,
  setComplianceResult,
}: RequirementsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['FDA']);
  const { toast } = useToast();
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

  const handleAnalyze = () => {
    if (!requirementsText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please provide some requirements to analyze.',
        variant: 'destructive',
      });
      return;
    }
    if (selectedStandards.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one compliance standard.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const [validation, compliance] = await Promise.all([
          runValidation(requirementsText),
          runComplianceCheck(
            requirementsText,
            selectedStandards.join(', ')
          ),
        ]);
        setValidationResult(validation);
        setComplianceResult(compliance);
        toast({
          title: 'Analysis Complete',
          description: 'Requirements have been successfully analyzed.',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Analysis Failed',
          description: 'An error occurred during the analysis.',
          variant: 'destructive',
        });
        setValidationResult(null);
        setComplianceResult(null);
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload & Analyze Requirements</CardTitle>
            <CardDescription>
              Upload your software requirements document, or use your voice. Our AI
              will analyze it for completeness and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <FileUpload
              onFileUpload={setRequirementsText}
              transcript={transcript}
              isRecording={listening}
              startRecording={SpeechRecognition.startListening}
              stopRecording={SpeechRecognition.stopListening}
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
            />
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
            <Button onClick={handleAnalyze} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Requirements'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      {isPending && (
        <div className="lg:col-span-2 flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!isPending && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-primary" />
              Completeness Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.completenessValidation.isValid ? (
              <Alert variant="default" className="border-green-500">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Requirements Complete</AlertTitle>
                <AlertDescription>
                  The provided requirements appear to be complete.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Incomplete Requirements Detected</AlertTitle>
                <AlertDescription>
                  The following elements are suggested for inclusion:
                </AlertDescription>
              </Alert>
            )}

            {!validationResult.completenessValidation.isValid &&
              validationResult.completenessValidation.missingElements.length >
                0 && (
                <div className="space-y-2">
                  {validationResult.completenessValidation.missingElements.map(
                    (item, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">
                            {item.element}
                          </CardTitle>
                          <CardDescription>{item.reason}</CardDescription>
                        </CardHeader>
                      </Card>
                    )
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      )}
      {!isPending && complianceResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-primary" />
              Compliance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold">Compliance Status</h3>
              <p className="text-sm text-muted-foreground">
                {complianceResult.complianceReport}
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Suggestions for Improvement</h3>
              <p className="text-sm text-muted-foreground">
                {complianceResult.suggestions}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
