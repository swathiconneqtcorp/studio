
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  LayoutGrid,
  PlusCircle,
  BarChart,
  ClipboardList,
  FlaskConical,
  Zap,
  Search,
  Bell,
} from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
} from 'recharts';
import Header from '@/components/header';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const kpiData = [
  { title: 'Total User Stories', value: '128', icon: ClipboardList },
  { title: 'Testcases Passed', value: '2,345', icon: FlaskConical },
  { title: 'Total Apps Used', value: '4', icon: Zap },
  { title: 'Active Tests', value: '7', icon: BarChart },
];

const barChartData = [
  { name: 'Jan', total: Math.floor(Math.random() * 2000) + 500 },
  { name: 'Feb', total: Math.floor(Math.random() * 2000) + 500 },
  { name: 'Mar', total: Math.floor(Math.random() * 2000) + 500 },
  { name: 'Apr', total: Math.floor(Math.random() * 2000) + 500 },
  { name: 'May', total: Math.floor(Math.random() * 2000) + 500 },
  { name: 'Jun', total: Math.floor(Math.random() * 2000) + 500 },
];

const pieChartData = [
  { name: 'Passed', value: 400, color: 'hsl(var(--primary))' },
  { name: 'Failed', value: 30, color: 'hsl(var(--destructive))' },
  { name: 'Pending', value: 70, color: 'hsl(var(--muted))' },
];

const testRunsData = [
  { id: 'TR-001', app: 'Clinical Trial App', status: 'Running', progress: 75 },
  { id: 'TR-002', app: 'Patient Portal', status: 'Passed', progress: 100 },
  { id: 'TR-003', app: 'EHR System', status: 'Failed', progress: 100 },
  { id: 'TR-004', app: 'Telemedicine Platform', status: 'Passed', progress: 100 },
  { id: 'TR-005', app: 'Pharmacy Management', status: 'Running', progress: 40 },
];

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'group rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card-bg-start)] to-[var(--card-bg-end)] shadow-[0_0_20px_0_var(--card-glow)] backdrop-blur-sm transition-all duration-300',
      className
    )}
  >
    <div className="relative h-full w-full rounded-xl transition-all duration-300 group-hover:border-transparent group-hover:[box-shadow:0_0_0_1px_hsl(var(--primary))]">
        {children}
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-black/30 border border-border/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
             <Link href="/requirements" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Testcase Journey
              </Button>
            </Link>
          </div>
        </div>

        <main className="mt-8 grid flex-1 items-start gap-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
              <GlassCard key={kpi.title}>
                 <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                       <CardTitle className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </CardTitle>
                      <div className="text-3xl font-bold">{kpi.value}</div>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <kpi.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
            <GlassCard className="lg:col-span-4 p-4 sm:p-6">
              <h3 className="text-lg font-semibold">
                Test Coverage Overview
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                A monthly overview of test cases generated.
              </p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={barChartData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                      contentStyle={{
                        backgroundColor: 'rgba(5, 5, 5, 0.8)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="lg:col-span-3 p-4 sm:p-6">
              <h3 className="text-lg font-semibold">
                Test Status Distribution
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Current distribution of test case statuses.
              </p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 5, 5, 0.8)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold">Recent Test Runs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              An overview of your recent test case executions.
            </p>
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/10">
                    <TableHead>Test ID</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRunsData.map((run) => (
                    <TableRow key={run.id} className="border-b-0">
                      <TableCell className="font-medium">{run.id}</TableCell>
                      <TableCell>{run.app}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.status === 'Passed'
                              ? 'default'
                              : run.status === 'Failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={
                            run.status === 'Passed' ? 'bg-green-600/70' : ''
                          }
                        >
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {run.progress}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
