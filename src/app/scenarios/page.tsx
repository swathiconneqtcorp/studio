
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { Scenario, TestCase, ValidationResult, ComplianceResult } from '@/lib/types';
import Header from '@/components/header';
import ScenariosView from '@/components/scenarios-view';
import AnalysisResultsView from '@/components/analysis-results-view';
import { Button } from '@/components/ui/button';
import { runParseScenarios } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const dummyScenarios: Scenario[] = [
    {
        id: 'REQ-001',
        reqId: 'REQ-001',
        title: 'User Login with Email and Password',
        description: 'As a user, I should be able to log in to the application using my registered email address and password to access my personalized dashboard.',
        priority: 'High',
        requirementType: 'Functional',
        requirementSource: 'SRS Document v1.2',
        testCases: [],
        areTestsGenerating: false,
    },
    {
        id: 'REQ-002',
        reqId: 'REQ-002',
        title: 'Password Reset Functionality',
        description: 'Users who have forgotten their password should be able to reset it through a secure link sent to their registered email address.',
        priority: 'High',
        requirementType: 'Functional',
        requirementSource: 'SRS Document v1.2',
        testCases: [],
        areTestsGenerating: false,
    },
    {
        id: 'REQ-003',
        reqId: 'REQ-003',
        title: 'Dashboard Data Loading Performance',
        description: 'The main dashboard must load all user-specific data within 3 seconds of the user logging in to ensure a good user experience.',
        priority: 'Medium',
        requirementType: 'Non-Functional',
        requirementSource: 'Performance Goals Q3',
        testCases: [],
        areTestsGenerating: false,
    }
];

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(dummyScenarios);
  const [analysis, setAnalysis] = useState<{
    validation: ValidationResult;
    compliance: ComplianceResult;
    requirements: string;
  } | null>(null);
  const [view, setView] = useState<'scenarios' | 'analysis'>('scenarios');
  const [isParsing, startParsingTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    const storedAnalysis = localStorage.getItem('requirementsAnalysis');
    if (storedAnalysis) {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysis(parsedAnalysis);
      handleCreateScenarios(parsedAnalysis.requirements);
      // localStorage.removeItem('requirementsAnalysis');
    }
  }, []);

  const handleUpdateScenario = (updatedScenario: Scenario) => {
    setScenarios(
      scenarios.map((s) => (s.id === updatedScenario.id ? updatedScenario : s))
    );
  };

  const handleUpdateTestCases = (
    scenarioId: string,
    testCases: TestCase[]
  ) => {
    setScenarios((scenarios) =>
      scenarios.map((s) =>
        s.id === scenarioId
          ? { ...s, testCases, areTestsGenerating: false }
          : s
      )
    );
  };

  const handleSetTestsGenerating = (
    scenarioId: string,
    isGenerating: boolean
  ) => {
    setScenarios((scenarios) =>
      scenarios.map((s) =>
        s.id === scenarioId ? { ...s, areTestsGenerating: isGenerating } : s
      )
    );
  };

  const handleCreateScenarios = (requirements: string) => {
    startParsingTransition(async () => {
        try {
            const parsedScenarios = await runParseScenarios(requirements);
            setScenarios(parsedScenarios);
            toast({
                title: 'Scenarios Generated',
                description: `We've created ${parsedScenarios.length} scenarios from your document.`
            });
            setView('scenarios');
            localStorage.removeItem('requirementsAnalysis');
        } catch (error) {
            console.error(error);
            toast({
                title: 'Scenario Generation Failed',
                description: 'Could not parse scenarios from the requirements.',
                variant: 'destructive',
            });
            // Fallback to old behavior
            const newScenario: Scenario = {
                id: `SCN-${Date.now()}`,
                reqId: `SCN-${Date.now()}`,
                title: 'Initial Scenario from Requirements',
                description: requirements,
                priority: 'Medium',
                requirementType: 'Functional',
                requirementSource: 'Uploaded Document',
                testCases: [],
                areTestsGenerating: false,
            };
            setScenarios([newScenario]);
            setView('scenarios');
            localStorage.removeItem('requirementsAnalysis');
        }
    });    
  };

  return (
    <>
      <Header title="Scenarios & Test Cases" />
      <main className="flex-1 p-4 lg:p-6">
        {isParsing ? (
           <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Generating scenarios...</p>
                </div>
            </div>
        ) : (
          <ScenariosView
            scenarios={scenarios}
            setScenarios={setScenarios}
            onUpdateScenario={handleUpdateScenario}
            onUpdateTestCases={handleUpdateTestCases}
            onSetTestsGenerating={handleSetTestsGenerating}
          />
        )}
      </main>
    </>
  );
}
