
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, ListChecks, ArrowRight } from 'lucide-react';
import type { ValidationResult, ComplianceResult } from '@/lib/types';

type AnalysisResultsViewProps = {
  validationResult: ValidationResult;
  complianceResult: ComplianceResult;
  onCreateScenarios: () => void;
};

export default function AnalysisResultsView({
  validationResult,
  complianceResult,
  onCreateScenarios,
}: AnalysisResultsViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>Review the AI-powered analysis of your requirements. You can accept the suggestions and proceed to create scenarios.</CardDescription>
                </CardHeader>
            </Card>
        </div>

      {validationResult && (
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
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
      {complianceResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-primary" />
              Compliance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
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
       <div className="lg:col-span-2">
        <Card>
          <CardFooter className="p-6 flex justify-end">
            <Button onClick={onCreateScenarios}>
                Create Scenarios <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
