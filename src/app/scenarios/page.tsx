
'use client';

import React, { useState, useEffect } from 'react';
import type { Scenario, TestCase, ValidationResult, ComplianceResult } from '@/lib/types';
import Header from '@/components/header';
import ScenariosView from '@/components/scenarios-view';
import AnalysisResultsView from '@/components/analysis-results-view';
import { Button } from '@/components/ui/button';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [analysis, setAnalysis] = useState<{
    validation: ValidationResult;
    compliance: ComplianceResult;
    requirements: string;
  } | null>(null);
  const [view, setView] = useState<'scenarios' | 'analysis'>('scenarios');
  
  useEffect(() => {
    const storedAnalysis = localStorage.getItem('requirementsAnalysis');
    if (storedAnalysis) {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysis(parsedAnalysis);
      setView('analysis');
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
    // For now, let's create one scenario from the requirements as an example
    const newScenario: Scenario = {
      id: `SCN-${Date.now()}`,
      title: 'Initial Scenario from Requirements',
      description: requirements,
      priority: 'Medium',
      testCases: [],
      areTestsGenerating: false,
    };
    setScenarios([newScenario]);
    setView('scenarios');
    localStorage.removeItem('requirementsAnalysis');
    
  };

  return (
    <>
      <Header title="Scenarios & Test Cases" />
      <main className="flex-1 p-4 lg:p-6">
        {view === 'analysis' && analysis ? (
          <AnalysisResultsView 
            validationResult={analysis.validation}
            complianceResult={analysis.compliance}
            onCreateScenarios={() => handleCreateScenarios(analysis.requirements)}
          />
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
