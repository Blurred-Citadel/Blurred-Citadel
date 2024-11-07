"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { TrendingUp, AlertTriangle, Activity, Users, Building } from 'lucide-react';

const defaultData = {
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
                                <p>Metrics will be displayed here</p>
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
                                <p>Trends will be displayed here</p>
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
                                <p>Workforce trends will be displayed here</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Demand</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Skills demand data will be displayed here</p>
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
                                <p>Industry performance data will be displayed here</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Growth Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Growth opportunities will be displayed here</p>
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
