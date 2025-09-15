'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runTestCaseGeneration, runImpactAnalysis } from '@/app/actions';
import { PlusCircle, Edit, Trash2, FlaskConical, Loader2, FileText, ChevronRight } from 'lucide-react';
import type { Scenario, TestCase } from '@/lib/types';
import GenerationProgress from './generation-progress';
import ImpactAnalysisDialog from './impact-analysis-dialog';

type ScenariosViewProps = {
  scenarios: Scenario[];
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
  onUpdateScenario: (scenario: Scenario) => void;
  onUpdateTestCases: (scenarioId: string, testCases: TestCase[]) => void;
  onSetTestsGenerating: (scenarioId: string, isGenerating: boolean) => void;
};

type ScenarioFormData = {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
};

const ScenarioForm: React.FC<{
  onSubmit: (data: ScenarioFormData) => void;
  initialData?: ScenarioFormData;
  buttonText: string;
}> = ({ onSubmit, initialData, buttonText }) => {
  const [formData, setFormData] = useState<ScenarioFormData>(
    initialData || { title: '', description: '', priority: 'Medium' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Scenario Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: 'High' | 'Medium' | 'Low') =>
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="submit">{buttonText}</Button></DialogClose>
      </DialogFooter>
    </form>
  );
};

const ScenarioCard: React.FC<{
  scenario: Scenario;
  onEdit: (scenario: Scenario, data: ScenarioFormData) => void;
  onDelete: (id: string) => void;
  onGenerateTests: (scenario: Scenario) => void;
}> = ({ scenario, onEdit, onDelete, onGenerateTests }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = (data: ScenarioFormData) => {
    onEdit(scenario, data);
    setIsEditOpen(false);
  };
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{scenario.title}</span>
          <Badge variant={scenario.priority === 'High' ? 'destructive' : scenario.priority === 'Medium' ? 'secondary' : 'outline'}>
            {scenario.priority}
          </Badge>
        </CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {scenario.testCases.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="test-cases">
              <AccordionTrigger>
                View {scenario.testCases.length} Test Cases
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenario.testCases.map((tc) => (
                      <TableRow key={tc.testCaseId}>
                        <TableCell>{tc.testCaseId}</TableCell>
                        <TableCell>{tc.title}</TableCell>
                        <TableCell><Badge variant="outline">{tc.priority}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerateTests(scenario)}
          disabled={scenario.areTestsGenerating}
        >
          {scenario.areTestsGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FlaskConical className="mr-2 h-4 w-4" />
              Generate Tests
            </>
          )}
        </Button>
        <div className="flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Scenario</DialogTitle>
                    </DialogHeader>
                    <ScenarioForm onSubmit={handleEdit} initialData={scenario} buttonText="Save Changes" />
                </DialogContent>
            </Dialog>
          <Button variant="ghost" size="icon" onClick={() => onDelete(scenario.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ScenariosView({
  scenarios,
  setScenarios,
  onUpdateScenario,
  onUpdateTestCases,
  onSetTestsGenerating
}: ScenariosViewProps) {
  const { toast } = useToast();
  const [isAddScenarioOpen, setIsAddScenarioOpen] = useState(false);
  const [generatingScenarioId, setGeneratingScenarioId] = useState<string | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<{ analysis: string, scenario: Scenario, newData: ScenarioFormData } | null>(null);
  const [isImpactAnalysisPending, startImpactAnalysisTransition] = useTransition();

  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'empty-state-scenarios');
  
  const handleAddScenario = (data: ScenarioFormData) => {
    const newScenario: Scenario = {
      id: `SCN-${Date.now()}`,
      areTestsGenerating: false,
      testCases: [],
      ...data,
    };
    setScenarios([...scenarios, newScenario]);
    setIsAddScenarioOpen(false);
    toast({ title: 'Scenario Added', description: `Scenario "${data.title}" has been created.` });
  };

  const handleEditScenario = (scenario: Scenario, newData: ScenarioFormData) => {
    if (scenario.testCases.length > 0) {
      startImpactAnalysisTransition(async () => {
        const changes = `Title changed from "${scenario.title}" to "${newData.title}". Description changed from "${scenario.description}" to "${newData.description}".`;
        try {
          const result = await runImpactAnalysis(changes, scenario.testCases);
          setImpactAnalysis({ analysis: result.impactAnalysis, scenario, newData });
        } catch (error) {
          toast({ title: 'Impact Analysis Failed', variant: 'destructive' });
          // If analysis fails, update scenario anyway
          onUpdateScenario({ ...scenario, ...newData });
        }
      });
    } else {
      onUpdateScenario({ ...scenario, ...newData });
      toast({ title: 'Scenario Updated' });
    }
  };

  const confirmScenarioUpdate = () => {
    if (!impactAnalysis) return;
    onUpdateScenario({ ...impactAnalysis.scenario, ...impactAnalysis.newData, testCases: [] });
    toast({ title: 'Scenario Updated', description: 'Test cases have been cleared due to changes.' });
    setImpactAnalysis(null);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
    toast({ title: 'Scenario Deleted' });
  };

  const handleGenerateTests = async (scenario: Scenario) => {
    onSetTestsGenerating(scenario.id, true);
    setGeneratingScenarioId(scenario.id);
    
    try {
      const result = await runTestCaseGeneration(
        scenario.description,
        ['FDA', 'GDPR'],
        scenario.priority
      );
      onUpdateTestCases(scenario.id, result.testCases);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Test Case Generation Failed',
        variant: 'destructive',
      });
      onSetTestsGenerating(scenario.id, false);
    } finally {
        setGeneratingScenarioId(null);
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Scenarios</h2>
        <Dialog open={isAddScenarioOpen} onOpenChange={setIsAddScenarioOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Scenario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Scenario</DialogTitle>
              <DialogDescription>
                Define a new scenario to generate test cases for.
              </DialogDescription>
            </DialogHeader>
            <ScenarioForm onSubmit={handleAddScenario} buttonText="Add Scenario" />
          </DialogContent>
        </Dialog>
      </div>

      {scenarios.length === 0 ? (
        <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
                {emptyStateImage && (
                    <Image
                        src={emptyStateImage.imageUrl}
                        alt={emptyStateImage.description}
                        width={300}
                        height={200}
                        className="rounded-lg"
                        data-ai-hint={emptyStateImage.imageHint}
                    />
                )}
                <h3 className="text-xl font-semibold">No Scenarios Yet</h3>
                <p className="text-muted-foreground">
                    Click Add Scenario to get started.
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onEdit={handleEditScenario}
              onDelete={handleDeleteScenario}
              onGenerateTests={handleGenerateTests}
            />
          ))}
        </div>
      )}
      
      <GenerationProgress
        isOpen={generatingScenarioId !== null}
        onClose={() => setGeneratingScenarioId(null)}
        scenarioTitle={scenarios.find(s => s.id === generatingScenarioId)?.title || ''}
      />

      <ImpactAnalysisDialog
        isOpen={impactAnalysis !== null || isImpactAnalysisPending}
        isLoading={isImpactAnalysisPending}
        analysis={impactAnalysis?.analysis || ''}
        onConfirm={confirmScenarioUpdate}
        onCancel={() => setImpactAnalysis(null)}
      />
    </div>
  );
}
