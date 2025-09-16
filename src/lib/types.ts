
import type { ValidateRequirementsOutput } from '@/ai/flows/validate-requirements';
import type { ComplianceCheckOutput } from '@/ai/flows/compliance-check';
import type { GenerateTestCasesOutput } from '@/ai/flows/automated-test-case-generation';
import type { ParseProjectDetailsOutput } from '@/ai/flows/parse-project-details';

export type TestCase = GenerateTestCasesOutput['testCases'][0];

export type Scenario = {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  testCases: TestCase[];
  areTestsGenerating: boolean;
};

export type ValidationResult = ValidateRequirementsOutput | null;
export type ComplianceResult = ComplianceCheckOutput | null;
export type ProjectDetails = ParseProjectDetailsOutput;
