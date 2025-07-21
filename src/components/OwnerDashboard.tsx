import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Code, 
  Settings, 
  BarChart3, 
  Users, 
  Puzzle,
  Globe,
  Palette,
  Copy,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

const OwnerDashboard = () => {
  const [embedCode, setEmbedCode] = useState(`<script src="https://embed.flashfusion.app/widget.js" data-api-key="your-api-key"></script>`);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground">Manage integrations and embed widgets</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                <Globe className="w-3 h-3 mr-1" />
                Enterprise
              </Badge>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="embed">Embed Widget</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-sm text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Designs Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">5,678</div>
                  <p className="text-sm text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Revenue Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$12,345</div>
                  <p className="text-sm text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.2%</div>
                  <p className="text-sm text-muted-foreground">+0.4% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user interactions with your embedded widgets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "User #1234", action: "Created product design", time: "2 minutes ago" },
                    { user: "User #5678", action: "Published to Shopify", time: "15 minutes ago" },
                    { user: "User #9012", action: "Generated AI idea", time: "1 hour ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{activity.user}</div>
                        <div className="text-sm text-muted-foreground">{activity.action}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Configuration</CardTitle>
                <CardDescription>Customize your FlashFusion widget for your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="widget-title">Widget Title</Label>
                      <Input id="widget-title" placeholder="Design Studio" />
                    </div>
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <Input id="primary-color" type="color" defaultValue="#8B5CF6" />
                    </div>
                    <div>
                      <Label htmlFor="widget-size">Widget Size</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Compact</option>
                        <option>Medium</option>
                        <option>Full Width</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="widget-theme">Theme</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Auto</option>
                        <option>Light</option>
                        <option>Dark</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" value="ff_live_sk_..." readOnly />
                    </div>
                    <div>
                      <Label htmlFor="domain">Allowed Domain</Label>
                      <Input id="domain" placeholder="yoursite.com" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>Copy this code and paste it into your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea 
                    value={embedCode}
                    readOnly
                    className="font-mono text-sm"
                    rows={6}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Integrations</CardTitle>
                <CardDescription>Manage connections to e-commerce platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Shopify', status: 'connected', users: 234 },
                    { name: 'Etsy', status: 'connected', users: 156 },
                    { name: 'TikTok Shop', status: 'pending', users: 89 },
                    { name: 'eBay', status: 'disconnected', users: 0 },
                    { name: 'Facebook Marketplace', status: 'connected', users: 67 },
                    { name: 'Printify', status: 'connected', users: 123 },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.users} users connected
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={integration.status === 'connected' ? 'default' : 'secondary'}
                          className={integration.status === 'connected' ? 'bg-green-500' : ''}
                        >
                          {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {integration.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {integration.status === 'connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>Widget usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mb-4" />
                    <p>Analytics chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Designs</CardTitle>
                  <CardDescription>Most popular design categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Minimalist', count: 1234, percentage: 45 },
                      { category: 'Vintage', count: 856, percentage: 31 },
                      { category: 'Modern', count: 432, percentage: 16 },
                      { category: 'Abstract', count: 218, percentage: 8 },
                    ].map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-muted-foreground">{item.count} designs</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.percentage}%</div>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;