import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Zap, TrendingUp, Shield, Star, Plus, Sparkles, Trophy } from "lucide-react";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { cn } from "@/lib/utils";

export default function Algo() {
  const { algorithms, isLoading, toggleAlgorithm, createCustomAlgorithm } = useAlgorithms();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAlgo, setNewAlgo] = useState({
    name: "",
    description: "",
    risk_level: 3,
  });

  const activeAlgos = algorithms.filter(a => a.is_active).length;
  const avgRoi = algorithms.length > 0 
    ? algorithms.reduce((sum, a) => sum + Number(a.roi), 0) / algorithms.length 
    : 0;
  const topPerformer = algorithms.length > 0 
    ? algorithms.reduce((best, algo) => Number(algo.roi) > Number(best.roi) ? algo : best)
    : null;

  const handleCreateAlgo = () => {
    createCustomAlgorithm({
      ...newAlgo,
      config: {}
    });
    setCreateDialogOpen(false);
    setNewAlgo({ name: "", description: "", risk_level: 3 });
  };

  const getRiskColor = (level: number) => {
    if (level <= 2) return "text-primary";
    if (level <= 3) return "text-warning";
    return "text-destructive";
  };

  const getRiskLabel = (level: number) => {
    if (level <= 2) return "Low Risk";
    if (level <= 3) return "Medium Risk";
    return "High Risk";
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6">
          <div className="text-center text-muted-foreground">Loading algorithms...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header with Gaming Elements */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-border">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Trading Algorithms
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </h1>
                <p className="text-muted-foreground">Power up your trading with AI algorithms</p>
              </div>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 glow-border">
                <Plus className="h-4 w-4" />
                Create Custom Algo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Algorithm</DialogTitle>
                <DialogDescription>
                  Design your own trading strategy. It will be submitted to admins for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Algorithm Name</Label>
                  <Input
                    id="name"
                    placeholder="My Strategy"
                    value={newAlgo.name}
                    onChange={(e) => setNewAlgo({ ...newAlgo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your trading strategy..."
                    value={newAlgo.description}
                    onChange={(e) => setNewAlgo({ ...newAlgo, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Risk Level: {newAlgo.risk_level}</Label>
                  <Slider
                    value={[newAlgo.risk_level]}
                    onValueChange={([value]) => setNewAlgo({ ...newAlgo, risk_level: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>
                <Button onClick={handleCreateAlgo} className="w-full">
                  Submit for Approval
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards with Gaming Style */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="game-card border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Algorithms</CardTitle>
              <div className="level-badge w-8 h-8">
                <Zap className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">{activeAlgos}</div>
              <p className="text-xs text-muted-foreground mt-1">of {algorithms.length} available</p>
              <div className="xp-bar mt-2">
                <div className="xp-bar-fill" style={{ width: `${(activeAlgos / algorithms.length) * 100}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="game-card border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">+{avgRoi.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Combined performance</p>
            </CardContent>
          </Card>

          <Card className="game-card border-warning/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Trophy className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-warning">
                {topPerformer ? `+${Number(topPerformer.roi).toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{topPerformer?.name || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((algo) => (
            <Card 
              key={algo.id} 
              className={cn(
                "game-card relative overflow-hidden transition-all duration-300",
                algo.is_active && "border-primary/50 glow-border"
              )}
            >
              {algo.is_active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary shimmer" />
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {algo.name}
                      {algo.is_system && <Star className="h-4 w-4 text-warning fill-warning" />}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {algo.description}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={algo.is_active}
                    onCheckedChange={(checked) => toggleAlgorithm({ algorithmId: algo.id, isActive: checked })}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-2xl font-bold font-mono text-primary">+{Number(algo.roi).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold font-mono">{(Number(algo.win_rate) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success Ratio</p>
                    <p className="text-lg font-bold font-mono">{(Number(algo.success_ratio) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="text-lg font-bold font-mono">{algo.total_trades}</p>
                  </div>
                </div>

                {/* Win Rate Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-mono">{(Number(algo.success_ratio) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Number(algo.success_ratio) * 100} className="h-2" />
                </div>

                {/* Risk Level Badge */}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className={cn("gap-1", getRiskColor(algo.risk_level || 3))}>
                    <Shield className="h-3 w-3" />
                    {getRiskLabel(algo.risk_level || 3)}
                  </Badge>
                  {algo.is_system ? (
                    <Badge variant="secondary" className="bg-warning/10 text-warning">System</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-accent/10 text-accent capitalize">{algo.status}</Badge>
                  )}
                </div>

                {/* Average Profit */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Avg Profit/Trade</p>
                  <p className="text-lg font-bold font-mono text-primary">
                    +${Number(algo.avg_profit_per_trade).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
