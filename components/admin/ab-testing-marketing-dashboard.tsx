'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Target,
  PlayCircle,
  PauseCircle,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface ExperimentResult {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  variants: {
    control: { participants: number; conversions: number; conversionRate: number };
    treatment: { participants: number; conversions: number; conversionRate: number };
  };
  confidence: number;
  winner?: 'control' | 'treatment';
  startDate: string;
  endDate?: string;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'draft';
  subject: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface UserSegment {
  id: string;
  name: string;
  userCount: number;
  criteria: Record<string, any>;
}

export function ABTestingMarketingDashboard() {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('ab-testing');

  // A/B Testing state
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    variants: {
      control: { name: 'Control', weight: 50 },
      treatment: { name: 'Treatment', weight: 50 }
    }
  });

  // Marketing state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    type: 'welcome',
    content: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load A/B test results
      const abResponse = await fetch('/api/ab-testing/admin');
      if (abResponse.ok) {
        const abData = await abResponse.json();
        setExperiments(abData.experiments || []);
      }

      // Load marketing campaigns
      const campaignsResponse = await fetch('/api/marketing/automation?type=campaigns');
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      // Load user segments
      const segmentsResponse = await fetch('/api/marketing/automation?type=segments');
      if (segmentsResponse.ok) {
        const segmentsData = await segmentsResponse.json();
        setSegments(segmentsData.segments || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExperiment = async () => {
    try {
      const response = await fetch('/api/ab-testing/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          experimentId: `exp_${Date.now()}`,
          config: newExperiment
        })
      });

      if (response.ok) {
        await loadData();
        setNewExperiment({
          name: '',
          description: '',
          variants: {
            control: { name: 'Control', weight: 50 },
            treatment: { name: 'Treatment', weight: 50 }
          }
        });
      }
    } catch (error) {
      console.error('Error creating experiment:', error);
    }
  };

  const toggleExperiment = async (experimentId: string, action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/ab-testing/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          experimentId
        })
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error(`Error ${action}ing experiment:`, error);
    }
  };

  const createCampaign = async (type: string = 'custom') => {
    try {
      const response = await fetch('/api/marketing/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: type === 'custom' ? 'campaign' : type,
          data: type === 'custom' ? newCampaign : undefined
        })
      });

      if (response.ok) {
        await loadData();
        if (type === 'custom') {
          setNewCampaign({
            name: '',
            subject: '',
            type: 'welcome',
            content: ''
          });
        }
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">A/B Testing & Marketing Dashboard</h1>
        <Button onClick={loadData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ab-testing" className="space-y-6">
          {/* A/B Testing Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experiments.filter(e => e.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experiments.reduce((sum, exp) => 
                    sum + exp.variants.control.participants + exp.variants.treatment.participants, 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experiments.length > 0 ? (
                    (experiments.reduce((sum, exp) => 
                      sum + (exp.variants.control.conversionRate + exp.variants.treatment.conversionRate) / 2, 0
                    ) / experiments.length).toFixed(1)
                  ) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Significant Results</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experiments.filter(e => e.confidence >= 95).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Experiment */}
          <Card>
            <CardHeader>
              <CardTitle>Create New A/B Test</CardTitle>
              <CardDescription>
                Set up a new experiment to test different variants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="exp-name">Experiment Name</Label>
                  <Input
                    id="exp-name"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Pricing Page Test"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-description">Description</Label>
                  <Input
                    id="exp-description"
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the test"
                  />
                </div>
              </div>
              <Button onClick={createExperiment} disabled={!newExperiment.name}>
                <Plus className="h-4 w-4 mr-2" />
                Create Experiment
              </Button>
            </CardContent>
          </Card>

          {/* Active Experiments */}
          <Card>
            <CardHeader>
              <CardTitle>Active Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experiments.map((experiment) => (
                  <div key={experiment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{experiment.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={experiment.status === 'active' ? 'default' : 'secondary'}>
                          {experiment.status}
                        </Badge>
                        {experiment.confidence >= 95 && experiment.winner && (
                          <Badge variant="outline">
                            Winner: {experiment.winner}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExperiment(experiment.id, experiment.status === 'active' ? 'stop' : 'start')}
                        >
                          {experiment.status === 'active' ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Control</h4>
                        <div className="text-sm text-muted-foreground">
                          {experiment.variants.control.participants} participants
                        </div>
                        <div className="text-lg font-semibold">
                          {experiment.variants.control.conversionRate.toFixed(1)}% conversion
                        </div>
                        <Progress value={experiment.variants.control.conversionRate} className="mt-2" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Treatment</h4>
                        <div className="text-sm text-muted-foreground">
                          {experiment.variants.treatment.participants} participants
                        </div>
                        <div className="text-lg font-semibold">
                          {experiment.variants.treatment.conversionRate.toFixed(1)}% conversion
                        </div>
                        <Progress value={experiment.variants.treatment.conversionRate} className="mt-2" />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Confidence: {experiment.confidence.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started: {new Date(experiment.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          {/* Marketing Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0 ? (
                    (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1)
                  ) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Segments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Campaign Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>
                Create automated email campaigns for user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button onClick={() => createCampaign('welcome_campaign')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Welcome Series
                </Button>
                <Button onClick={() => createCampaign('upsell_campaign')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Upsell Campaign
                </Button>
                <Button onClick={() => createCampaign('churn_prevention_campaign')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Churn Prevention
                </Button>
                <Button onClick={() => createCampaign('custom')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Campaign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaign List */}
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{campaign.subject}</p>
                    
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.metrics.sent}</div>
                        <div className="text-sm text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.openRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.clickRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Click Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.conversionRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Combined Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>A/B Test Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={experiments.map(exp => ({
                    name: exp.name.substring(0, 20),
                    control: exp.variants.control.conversionRate,
                    treatment: exp.variants.treatment.conversionRate,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="control" fill="#8884d8" name="Control" />
                    <Bar dataKey="treatment" fill="#82ca9d" name="Treatment" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={campaigns.map(campaign => ({
                    name: campaign.name.substring(0, 15),
                    openRate: campaign.openRate,
                    clickRate: campaign.clickRate,
                    conversionRate: campaign.conversionRate,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="openRate" stroke="#8884d8" name="Open Rate" />
                    <Line type="monotone" dataKey="clickRate" stroke="#82ca9d" name="Click Rate" />
                    <Line type="monotone" dataKey="conversionRate" stroke="#ffc658" name="Conversion Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Your A/B tests show an average lift of{' '}
                    {experiments.length > 0 ? (
                      ((experiments.reduce((sum, exp) => 
                        sum + (exp.variants.treatment.conversionRate - exp.variants.control.conversionRate), 0
                      ) / experiments.length)).toFixed(1)
                    ) : 0}% 
                    {' '}in conversion rates across all experiments.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Your email campaigns have an average open rate of{' '}
                    {campaigns.length > 0 ? (
                      (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1)
                    ) : 0}%, 
                    which is{' '}
                    {campaigns.length > 0 && (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length) > 20 
                      ? 'above' : 'below'} industry average.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
