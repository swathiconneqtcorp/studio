
'use client';

import React, { useEffect, useState } from 'react';
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
  LayoutGrid,
  PlusCircle,
  BarChart,
  ClipboardList,
  FlaskConical,
  Zap,
  Search,
  Bell,
  ChevronRight,
  ArrowDown,
  ArrowUp,
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
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const kpiData = [
  {
    title: 'Total User Stories',
    value: '128',
    icon: ClipboardList,
    change: '+12.5%',
    changeType: 'increase',
    vsLastMonth: '114',
  },
  {
    title: 'Testcases Passed',
    value: '2,345',
    icon: FlaskConical,
    change: '+5.2%',
    changeType: 'increase',
    vsLastMonth: '2,229',
  },
  {
    title: 'Total Apps Used',
    value: '4',
    icon: Zap,
    change: '0%',
    changeType: 'neutral',
    vsLastMonth: '4',
  },
  {
    title: 'Active Tests',
    value: '7',
    icon: BarChart,
    change: '-14.3%',
    changeType: 'decrease',
    vsLastMonth: '8',
  },
];

const barChartData = [
  { name: 'Jan', total: 0 },
  { name: 'Feb', total: 0 },
  { name: 'Mar', total: 0 },
  { name: 'Apr', total: 0 },
  { name: 'May', total: 0 },
  { name: 'Jun', total: 0 },
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
      'group rounded-xl bg-gradient-to-br from-[var(--card-bg-start)] to-[var(--card-bg-end)] backdrop-blur-sm transition-all duration-300',
      'shadow-[0_0_80px_0_var(--card-glow)]',
      className
    )}
  >
    <div
      className={cn(
        'h-full w-full rounded-xl transition-all duration-300',
        ''
      )}
    >
      {children}
    </div>
  </div>
);

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [hydratedBarChartData, setHydratedBarChartData] = useState(barChartData);

  useEffect(() => {
    setIsClient(true);
    setHydratedBarChartData(
      barChartData.map((item) => ({
        ...item,
        total: Math.floor(Math.random() * 2000) + 500,
      }))
    );
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
              <Card key={kpi.title} className="bg-gradient-to-br from-card to-card/60">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <kpi.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{kpi.title}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{kpi.value}</p>
                      <p
                        className={cn(
                          'text-xs font-semibold flex items-center',
                          kpi.changeType === 'increase' && 'text-green-500',
                          kpi.changeType === 'decrease' && 'text-red-500',
                          kpi.changeType === 'neutral' && 'text-muted-foreground'
                        )}
                      >
                        {kpi.changeType === 'increase' && (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        )}
                        {kpi.changeType === 'decrease' && (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {kpi.change}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs last month: {kpi.vsLastMonth}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                  <RechartsBarChart data={hydratedBarChartData}>
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
                          className={cn({
                            'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30': run.status === 'Passed',
                            'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30': run.status === 'Failed',
                            'bg-secondary text-secondary-foreground hover:bg-secondary/80': run.status === 'Running'
                          })}
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

    