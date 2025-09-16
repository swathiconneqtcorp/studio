
'use client';
import 'regenerator-runtime/runtime'
import React, { useState, useTransition, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Mic, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runValidation, runComplianceCheck } from '@/app/actions';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

import type { ValidationResult, ComplianceResult } from '@/lib/types';

type RequirementsViewProps = {
  requirementsText: string;
  setRequirementsText: (text: string) => void;
  onAnalysisComplete: (validation: ValidationResult, compliance: ComplianceResult, requirements: string) => void;
};

type UploadedFile = {
    file: File;
    progress: number;
    source: 'upload' | 'speech';
    content: string;
};


function FileUpload({ onFilesUpload, transcript, isRecording, startRecording, stopRecording }: any) {
    const {
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFilesUpload(acceptedFiles, 'upload');
        }
    }, [onFilesUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'text/plain': ['.txt', '.md'], 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx']} });
    
    useEffect(() => {
        if(transcript && !isRecording) {
            const speechFile = new File([transcript], `speech-recognition-${new Date().toISOString()}.txt`, { type: "text/plain" });
            onFilesUpload([speechFile], 'speech');
        }
    }, [transcript, isRecording, onFilesUpload])


    return (
        <div className="flex flex-col items-center gap-6">
             <div
                {...getRootProps()}
                className={cn(
                    'relative flex w-full flex-col items-center justify-center p-10 rounded-xl cursor-pointer transition-colors',
                    'bg-card/50 border-2 border-dashed border-border/30',
                     isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50 hover:bg-primary/5'
                )}
            >
                <div className='h-full w-full rounded-xl'>
                    <input {...getInputProps()} />
                    <div className='flex flex-col items-center justify-center'>
                        <UploadCloud className="w-12 h-12 text-primary" />
                        <p className="mt-4 text-center text-foreground">
                            {isDragActive
                                ? 'Drop the files here ...'
                                : "Drag 'n' drop requirement files here, or click to select"}
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
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                            "relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none",
                            "bg-primary shadow-[0_0_40px_-10px_hsl(var(--primary))]"
                        )}
                        >
                        {isRecording && <div className="absolute inset-0 rounded-full bg-transparent border-2 border-primary-foreground/50 pulse-ring"></div>}
                        <Mic className="h-6 w-6 text-primary-foreground" />
                    </button>
                    <p className="text-sm text-muted-foreground mt-2">{isRecording ? 'Recording... click to stop' : 'Use your voice'}</p>
                </div>
            )}
        </div>
      );
}

const FileProgress: React.FC<{ file: UploadedFile, onCancel: () => void }> = ({ file, onCancel }) => {
  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-border/30">
      <CardContent className="p-4 relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <FileIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{file.file.name}</p>
            <p className="text-sm text-muted-foreground">{`${(file.file.size / 1024).toFixed(2)}KB`}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {file.progress < 100 ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                </>
            ) : (
                <span>Ready</span>
            )}
            <span className="ml-auto font-semibold">{Math.round(file.progress)}%</span>
          </div>
          <Progress value={file.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};


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

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
    useEffect(() => {
        setIsClient(true);
      }, []);
    
      const handleFilesUpload = (files: File[], source: 'upload' | 'speech') => {
        const newFiles: UploadedFile[] = files.map(file => ({
            file,
            progress: 0,
            source,
            content: ''
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
      };
    
      const handleCancelUpload = (fileName: string) => {
        setUploadedFiles(prev => prev.filter(f => f.file.name !== fileName));
      };

      useEffect(() => {
        uploadedFiles.forEach((uploadedFile, index) => {
          if (uploadedFile.progress < 100 && !uploadedFile.content) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setUploadedFiles(prev => {
                    const newFiles = [...prev];
                    if (newFiles[index]) {
                      newFiles[index].content = text;
                    }
                    return newFiles;
                });
            };
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    setUploadedFiles(prev => {
                        const newFiles = [...prev];
                        if (newFiles[index]) {
                            newFiles[index].progress = progress;
                        }
                        return newFiles;
                    });
                }
            };
            reader.onloadend = () => {
                setUploadedFiles(prev => {
                    const newFiles = [...prev];
                    if (newFiles[index]) {
                        newFiles[index].progress = 100;
                    }
                    return newFiles;
                });
            };
            if(uploadedFile.source === 'upload') {
                reader.readAsText(uploadedFile.file);
            } else {
                // For speech, content is already there
                uploadedFile.file.text().then(text => {
                    setUploadedFiles(prev => {
                        const newFiles = [...prev];
                        if (newFiles[index]) {
                            newFiles[index].content = text;
                            newFiles[index].progress = 100;
                        }
                        return newFiles;
                    });
                });
            }
          }
        });

        const allContent = uploadedFiles
            .filter(f => f.content)
            .map(f => f.content)
            .join('\n\n');
        setRequirementsText(allContent);
    }, [uploadedFiles, setRequirementsText]);


  const handleAnalyze = () => {
    startTransition(async () => {
      try {
        const reqText = requirementsText || "Login screen";
        const standards = 'FDA, GDPR, ISO 13485, HIPAA';

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

  const allFilesUploaded = uploadedFiles.every(f => f.progress === 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">Import Requirement</h1>
          <p className="text-sm text-muted-foreground">
            Upload your software requirements document or use your voice. Our AI
            will analyze it for completeness and compliance.
          </p>
      </div>
      <div className="space-y-6">
      {isClient ? <FileUpload
          onFilesUpload={handleFilesUpload}
          transcript={transcript}
          isRecording={listening}
          startRecording={() => SpeechRecognition.startListening({ continuous: true })}
          stopRecording={SpeechRecognition.stopListening}
          browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        /> : <div className="h-64 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center"><Loader2 className='h-8 w-8 animate-spin' /></div>}
        
        {uploadedFiles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {uploadedFiles.map((uploadedFile, index) => (
              <FileProgress key={index} file={uploadedFile} onCancel={() => handleCancelUpload(uploadedFile.file.name)} />
            ))}
          </div>
        )}
        
        <Button onClick={handleAnalyze} disabled={isPending || !requirementsText || !allFilesUploaded} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze & Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

    

    