"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";
import {
    TrendingUp,
    Users,
    Award,
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Calendar,
    Target,
    Activity
} from "lucide-react";
import { usePermissions } from "@/hooks/use-user-role";

export const dynamic = 'force-dynamic';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ComplianceReportsPage() {
    const { user } = useUser();
    const { canViewReports, isLoading: permissionsLoading } = usePermissions();
    const [selectedTimeframe, setSelectedTimeframe] = useState("30");
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    // Fetch data from various APIs
    const users = useQuery(api.users.listUsers);
    const trainingStats = useQuery(api.training.getTrainingStats);
    const certificationStats = useQuery(api.certifications.getCertificationStats);
    const policies = useQuery(api.policies.getAllPolicies);
    const policyAcknowledgments = useQuery(api.policies.getPolicyAcknowledgments);

    // Mock data for demonstration (would be replaced with real data)
    const departmentData = [
        { name: 'Call Center', employees: 15, completed: 12, inProgress: 2, notStarted: 1 },
        { name: 'Management', employees: 5, completed: 5, inProgress: 0, notStarted: 0 },
        { name: 'IT Support', employees: 3, completed: 3, inProgress: 0, notStarted: 0 },
        { name: 'Compliance', employees: 2, completed: 2, inProgress: 0, notStarted: 0 },
    ];

    const complianceOverTime = [
        { month: 'Jan', completion: 65 },
        { month: 'Feb', completion: 72 },
        { month: 'Mar', completion: 78 },
        { month: 'Apr', completion: 85 },
        { month: 'May', completion: 90 },
        { month: 'Jun', completion: 94 },
    ];

    const quizPerformanceData = [
        { category: 'Data Protection', avgScore: 87, passRate: 94 },
        { category: 'PCI DSS', avgScore: 91, passRate: 98 },
        { category: 'Call Security', avgScore: 83, passRate: 89 },
        { category: 'Fraud Prevention', avgScore: 88, passRate: 92 },
    ];

    if (permissionsLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!canViewReports) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to view compliance reports. Contact your administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const totalEmployees = users?.length || 0;
    const totalPolicies = policies?.length || 0;
    const totalAcknowledgments = policyAcknowledgments?.length || 0;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-2">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <span>Compliance Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor training completion, policy acknowledgments, and overall compliance status
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Time Period</label>
                            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last year</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Department</label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="call_center">Call Center</SelectItem>
                                    <SelectItem value="management">Management</SelectItem>
                                    <SelectItem value="it_support">IT Support</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Employees</p>
                                <p className="text-2xl font-bold">{totalEmployees}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Training Completion</p>
                                <p className="text-2xl font-bold">{trainingStats?.completionRate.toFixed(1) || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium">Active Certificates</p>
                                <p className="text-2xl font-bold">{certificationStats?.activeCertifications || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Policy Acknowledgments</p>
                                <p className="text-2xl font-bold">{totalAcknowledgments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="training">Training</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Department Completion Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Training Status</CardTitle>
                                <CardDescription>Training completion by department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={departmentData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="completed" stackId="a" fill="#0088FE" name="Completed" />
                                        <Bar dataKey="inProgress" stackId="a" fill="#FFBB28" name="In Progress" />
                                        <Bar dataKey="notStarted" stackId="a" fill="#FF8042" name="Not Started" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Compliance Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Trend</CardTitle>
                                <CardDescription>Overall compliance percentage over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={complianceOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="completion" stroke="#0088FE" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts and Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Alerts</CardTitle>
                            <CardDescription>Items requiring immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {certificationStats?.expiringSoon && certificationStats.expiringSoon > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            {certificationStats.expiringSoon} certificates expire within 30 days
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Alert>
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                        3 employees have overdue training modules
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <FileText className="h-4 w-4" />
                                    <AlertDescription>
                                        New policy "Updated PCI DSS Guidelines" requires acknowledgment from 12 employees
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Training Module Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Performance by Category</CardTitle>
                                <CardDescription>Average scores and pass rates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={quizPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="category" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="avgScore" fill="#0088FE" name="Avg Score %" />
                                        <Bar dataKey="passRate" fill="#00C49F" name="Pass Rate %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Training Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Training Module Status</CardTitle>
                                <CardDescription>Current status of all training modules</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Data Protection Fundamentals</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={94} className="w-24 h-2" />
                                            <span className="text-sm">94%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">PCI DSS Compliance</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={87} className="w-24 h-2" />
                                            <span className="text-sm">87%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Call Recording Security</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={76} className="w-24 h-2" />
                                            <span className="text-sm">76%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Social Engineering Defense</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={82} className="w-24 h-2" />
                                            <span className="text-sm">82%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Training Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Training Status</CardTitle>
                            <CardDescription>Detailed view of individual employee progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Completed Modules</TableHead>
                                        <TableHead>Average Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>John Smith</TableCell>
                                        <TableCell>Call Center</TableCell>
                                        <TableCell>4/4</TableCell>
                                        <TableCell>89%</TableCell>
                                        <TableCell><Badge variant="default">Complete</Badge></TableCell>
                                        <TableCell>2 days ago</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Sarah Johnson</TableCell>
                                        <TableCell>Call Center</TableCell>
                                        <TableCell>3/4</TableCell>
                                        <TableCell>92%</TableCell>
                                        <TableCell><Badge variant="secondary">In Progress</Badge></TableCell>
                                        <TableCell>1 day ago</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Mike Davis</TableCell>
                                        <TableCell>Management</TableCell>
                                        <TableCell>4/4</TableCell>
                                        <TableCell>95%</TableCell>
                                        <TableCell><Badge variant="default">Complete</Badge></TableCell>
                                        <TableCell>1 week ago</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="policies" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Policy Acknowledgment Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Policy Acknowledgment Status</CardTitle>
                                <CardDescription>Acknowledgment rates for active policies</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Customer Data Protection Policy</p>
                                            <p className="text-sm text-muted-foreground">Required for all employees</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={100} className="w-24 h-2" />
                                            <span className="text-sm">25/25</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">PCI DSS Compliance Guidelines</p>
                                            <p className="text-sm text-muted-foreground">Required for payment handlers</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={87} className="w-24 h-2" />
                                            <span className="text-sm">13/15</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Call Recording Security Policy</p>
                                            <p className="text-sm text-muted-foreground">Required for call center staff</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={93} className="w-24 h-2" />
                                            <span className="text-sm">14/15</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Policy Updates */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Policy Updates</CardTitle>
                                <CardDescription>Latest policy changes and acknowledgments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Incident Response Procedures updated</p>
                                            <p className="text-xs text-muted-foreground">2 days ago • 23/25 acknowledged</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">New Acceptable Use Policy published</p>
                                            <p className="text-xs text-muted-foreground">1 week ago • 18/25 acknowledged</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Data Retention Schedule updated</p>
                                            <p className="text-xs text-muted-foreground">2 weeks ago • 25/25 acknowledged</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="certificates" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Certificate Status Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Certificate Status Distribution</CardTitle>
                                <CardDescription>Current status of all certificates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Active', value: certificationStats?.activeCertifications || 0 },
                                                { name: 'Expiring Soon', value: certificationStats?.expiringSoon || 0 },
                                                { name: 'Expired', value: certificationStats?.expiredCertifications || 0 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                                        >
                                            {[0, 1, 2].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Certificate Renewals */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Certificate Renewals</CardTitle>
                                <CardDescription>Certificates expiring in the next 60 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">PCI DSS Compliance - John Smith</p>
                                            <p className="text-xs text-muted-foreground">Expires in 15 days</p>
                                        </div>
                                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                                            Urgent
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Data Protection - Sarah Johnson</p>
                                            <p className="text-xs text-muted-foreground">Expires in 28 days</p>
                                        </div>
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                            Soon
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Call Security - Mike Davis</p>
                                            <p className="text-xs text-muted-foreground">Expires in 45 days</p>
                                        </div>
                                        <Badge variant="outline" className="border-blue-500 text-blue-700">
                                            Upcoming
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    {/* Overall Compliance Score */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Compliance Score</CardTitle>
                            <CardDescription>Comprehensive compliance assessment for Royal Credit Recoveries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full border-8 border-green-200 flex items-center justify-center">
                                            <div className="text-3xl font-bold text-green-600">94%</div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium">Training Compliance</p>
                                    <p className="text-xs text-muted-foreground">Above 90% target</p>
                                </div>
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full border-8 border-blue-200 flex items-center justify-center">
                                            <div className="text-3xl font-bold text-blue-600">89%</div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium">Policy Acknowledgment</p>
                                    <p className="text-xs text-muted-foreground">Target: 95%</p>
                                </div>
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full border-8 border-yellow-200 flex items-center justify-center">
                                            <div className="text-3xl font-bold text-yellow-600">97%</div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium">Certificate Validity</p>
                                    <p className="text-xs text-muted-foreground">Excellent status</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Assessment */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Assessment</CardTitle>
                                <CardDescription>Current compliance risks and mitigation status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">PCI DSS Compliance - Low Risk</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm">Data Protection Training - Medium Risk</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">Policy Acknowledgments - Low Risk</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm">Certificate Renewals - High Risk</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Regulatory Framework Status</CardTitle>
                                <CardDescription>Compliance with key regulations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">PCI DSS</span>
                                        <Badge variant="default">Compliant</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Data Protection Act</span>
                                        <Badge variant="default">Compliant</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Financial Services Regulation</span>
                                        <Badge variant="outline">Review Required</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Information Security Standards</span>
                                        <Badge variant="default">Compliant</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}