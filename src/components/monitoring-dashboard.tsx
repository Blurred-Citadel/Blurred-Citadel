"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, Users, Building } from 'lucide-react';

const defaultData = {
    overview: {
        metrics: [
            { timestamp: '2024-01-01', laborMarketActivity: 65, clientActivity: 45 },
            { timestamp: '2024-01-02', laborMarketActivity: 70, clientActivity: 50 },
            { timestamp: '2024-01-03', laborMarketActivity: 75, clientActivity: 55 }
        ],
        trends: [
            { timestamp: '2024-01-01', trend: 30 },
            { timestamp: '2024-01-02', trend: 35 },
            { timestamp: '2024-01-03', trend: 40 }
        ]
    },
    laborMarket: {
        workforceTrends: [
            { category: 'Remote Work', value: 65 },
            { category: 'Contract', value: 45 },
            { category: 'Full-time', value: 80 }
        ],
        skillsDemand: [
            { timestamp: '2024-01-01', demand: 50 },
            { timestamp: '2024-01-02', demand: 55 },
            { timestamp: '2024-01-03', demand: 60 }
        ]
    },
    clientIndustries: {
        industryPerformance: [
            { industry: 'Technology', performance: 85 },
            { industry: 'Finance', performance: 75 },
            { industry: 'Healthcare', performance: 90 }
        ],
        growthOpportunities: [
            { timestamp: '2024-01-01', opportunity: 40 },
            { timestamp: '2024-01-02', opportunity: 45 },
            { timestamp: '2024-01-03', opportunity: 50 }
        ]
    },
    alerts: {
        alerts: [
            { 
                severity: 'warning', 
                message: 'Increased demand in technology sector' 
            },
            { 
                severity: 'info', 
                message: 'New remote work trends emerging' 
            }
        ]
    }
};

const MonitoringDashboard = () => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // In the future, this will fetch real data
        setData(defaultData);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading monitoring data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Blurred Citadel Monitor</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="labor">Labor Market</TabsTrigger>
                    <TabsTrigger value="client">Client Industries</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Key Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.overview.metrics}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="laborMarketActivity" stroke="#8884d8" />
                                        <Line type="monotone" dataKey="clientActivity" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Trend Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.overview.trends}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="trend" fill="#8884d8" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="labor">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Workforce Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.laborMarket.workforceTrends}>
                                        <XAxis dataKey="category" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Demand</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.laborMarket.skillsDemand}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="demand" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="client">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Industry Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.clientIndustries.industryPerformance}>
                                        <XAxis dataKey="industry" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="performance" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Growth Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.clientIndustries.growthOpportunities}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="opportunity" fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="alerts">
                    <div className="space-y-4">
                        {data.alerts.alerts.map((alert, index) => (
                            <Alert key={index} variant={alert.severity as any}>
                                <AlertTriangle className="w-4 h-4" />
                                <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MonitoringDashboard;
