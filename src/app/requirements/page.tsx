
'use client';

import React, { useState } from 'react';

import type {
  ValidationResult,
  ComplianceResult,
} from '@/lib/types';

import Header from '@/components/header';
import RequirementsView from '@/components/requirements-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RequirementsPage() {
  const [requirementsText, setRequirementsText] = useState('');
  const [validationResult, setValidationResult] =
    useState<ValidationResult>(null);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceResult>(null);

  return (
    <>
      <Header title="Requirements Analysis" />
      <main className="flex-1 p-4 lg:p-6">
        <div className="flex justify-end mb-4">
          <Link href="/scenarios">
            <Button>Go to Scenarios</Button>
          </Link>
        </div>
        <RequirementsView
          requirementsText={requirementsText}
          setRequirementsText={setRequirementsText}
          validationResult={validationResult}
          setValidationResult={setValidationResult}
          complianceResult={complianceResult}
          setComplianceResult={setComplianceResult}
        />
      </main>
    </>
  );
}

    