'use client';

import React, { useState, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import {
  FileText,
  LayoutGrid,
  FlaskConical,
  LifeBuoy,
  Settings,
} from 'lucide-react';

import type {
  Scenario,
  ValidationResult,
  ComplianceResult,
  TestCase,
} from '@/lib/types';

import Header from '@/components/header';
import RequirementsView from '@/components/requirements-view';
import ScenariosView from '@/components/scenarios-view';

type View = 'requirements' | 'scenarios';

export default function App() {
  const [activeView, setActiveView] = useState<View>('requirements');

  const [requirementsText, setRequirementsText] = useState('');
  const [validationResult, setValidationResult] =
    useState<ValidationResult>(null);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceResult>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const handleUpdateScenario = (updatedScenario: Scenario) => {
    setScenarios(
      scenarios.map((s) => (s.id === updatedScenario.id ? updatedScenario : s))
    );
  };
  
  const handleUpdateTestCases = (scenarioId: string, testCases: TestCase[]) => {
    setScenarios(scenarios => scenarios.map(s => 
      s.id === scenarioId 
        ? { ...s, testCases, areTestsGenerating: false } 
        : s
    ));
  };

  const handleSetTestsGenerating = (scenarioId: string, isGenerating: boolean) => {
    setScenarios(scenarios => scenarios.map(s =>
      s.id === scenarioId ? { ...s, areTestsGenerating: isGenerating } : s
    ));
  };


  const viewTitle = useMemo(() => {
    switch (activeView) {
      case 'requirements':
        return 'Requirements Analysis';
      case 'scenarios':
        return 'Scenarios & Test Cases';
      default:
        return 'Dashboard';
    }
  }, [activeView]);

  const sidebarNavItems = [
    {
      id: 'requirements',
      label: 'Requirements',
      icon: FileText,
      view: 'requirements' as View,
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      icon: LayoutGrid,
      view: 'scenarios' as View,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-sidebar-primary" />
            <span className="text-lg font-semibold">CertiTest AI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNavItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActiveView(item.view)}
                  isActive={activeView === item.view}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background">
        <Header title={viewTitle} />
        <main className="flex-1 p-4 lg:p-6">
          {activeView === 'requirements' && (
            <RequirementsView
              requirementsText={requirementsText}
              setRequirementsText={setRequirementsText}
              validationResult={validationResult}
              setValidationResult={setValidationResult}
              complianceResult={complianceResult}
              setComplianceResult={setComplianceResult}
            />
          )}
          {activeView === 'scenarios' && (
            <ScenariosView
              scenarios={scenarios}
              setScenarios={setScenarios}
              onUpdateScenario={handleUpdateScenario}
              onUpdateTestCases={handleUpdateTestCases}
              onSetTestsGenerating={handleSetTestsGenerating}
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
