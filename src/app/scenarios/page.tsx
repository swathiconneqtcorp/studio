
'use client';

import React, { useState } from 'react';
import type { Scenario, TestCase } from '@/lib/types';
import Header from '@/components/header';
import ScenariosView from '@/components/scenarios-view';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

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

  return (
    <>
      <Header title="Scenarios & Test Cases" />
      <main className="flex-1 p-4 lg:p-6">
        <ScenariosView
          scenarios={scenarios}
          setScenarios={setScenarios}
          onUpdateScenario={handleUpdateScenario}
          onUpdateTestCases={handleUpdateTestCases}
          onSetTestsGenerating={handleSetTestsGenerating}
        />
      </main>
    </>
  );
}

    