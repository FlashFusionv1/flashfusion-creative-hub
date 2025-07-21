import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Wand2, 
  Download, 
  Share2, 
  BarChart3, 
  Settings,
  Plus,
  Sparkles,
  ShoppingBag
} from "lucide-react";

const CreatorDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Creator Studio</h1>
              <p className="text-muted-foreground">Design amazing products with AI</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro Creator
              </Badge>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="studio" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="studio">AI Studio</TabsTrigger>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="studio" className="space-y-6">
            {/* AI Tools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-2">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>AI Idea Generator</CardTitle>
                  <CardDescription>
                    Generate product ideas based on trending styles and market demand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Generating</Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-2">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Style Combiner</CardTitle>
                  <CardDescription>
                    Mix and match design styles with our grouped theme system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Open Designer
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-2">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Export Tools</CardTitle>
                  <CardDescription>
                    Export your designs as ZIP, JSON, or with complete metadata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Export Options
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your most used tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Product
                  </Button>
                  <Button size="sm" variant="outline">
                    <Palette className="w-4 h-4 mr-2" />
                    Style Editor
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Design
                  </Button>
                  <Button size="sm" variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest creative work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet. Create your first design!</p>
                  <Button className="mt-4 bg-gradient-to-r from-primary to-accent">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Publishing</CardTitle>
                <CardDescription>Connect and publish to major e-commerce platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {['Shopify', 'Etsy', 'TikTok Shop', 'eBay', 'Facebook Marketplace', 'Printify'].map((platform) => (
                    <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{platform}</div>
                        <div className="text-sm text-muted-foreground">Not connected</div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Published Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0</div>
                  <p className="text-sm text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard;