import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockPerformanceData = [
  { period: "Today", profit: 245.67, trades: 12, winRate: 75 },
  { period: "This Week", profit: 1847.23, trades: 89, winRate: 71 },
  { period: "This Month", profit: 7234.56, trades: 342, winRate: 68 },
  { period: "All Time", profit: 24567.89, trades: 1256, winRate: 69 },
];

export default function Analytics() {
  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">Performance insights and reports</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {mockPerformanceData.map((data, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {data.period}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold font-mono text-primary">
                  +${data.profit.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.trades} trades · {data.winRate}% win rate
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="assets">Asset Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit/Loss Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Performance chart visualization</p>
                    <p className="text-sm mt-1">Historical P&L data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Win Rate Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <p>Win/Loss ratio chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <p>Trade volume over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p>Multi-asset performance comparison</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Exposure Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p>Risk assessment visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
