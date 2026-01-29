"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, Bug, Wind, Leaf, X } from "lucide-react"

export function AlertsManagement() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Soil Moisture Alert",
      description: "Green Valley Chapu Farm - Wheat field requires irrigation within 48 hours",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      icon: Droplets,
      priority: "High",
      action: "Schedule 1st irrigation immediately",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Pest Detection",
      description: "Armyworm detected in Maize field - Sunrise Fields Chapu",
      farm: "Sunrise Fields Chapu",
      crop: "Maize",
      icon: Bug,
      priority: "Critical",
      action: "Apply recommended pesticide spray",
      timestamp: "4 hours ago",
    },
    {
      id: 3,
      type: "info",
      title: "Weather Advisory",
      description: "Strong winds (40-50 km/h) expected in next 48 hours in Bahawalpur region, Cholistan area",
      farm: "All Farms in Chapu",
      crop: "All Crops",
      icon: Wind,
      priority: "Medium",
      action: "Ensure field preparedness, monitor crops",
      timestamp: "6 hours ago",
    },
    {
      id: 4,
      type: "warning",
      title: "Disease Risk - Yellow Rust",
      description: "Conditions favorable for Yellow Rust in Wheat - High humidity predicted in Cholistan",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      icon: Leaf,
      priority: "High",
      action: "Apply fungicide preventively",
      timestamp: "8 hours ago",
    },
    {
      id: 5,
      type: "info",
      title: "Weed Emergency",
      description: "Post-emergence weeds at critical level - Recommended immediate action",
      farm: "Harvest Hills Chapu",
      crop: "Rice",
      icon: Leaf,
      priority: "Medium",
      action: "Apply post-emergence weedicide",
      timestamp: "12 hours ago",
    },
  ]

  const recommendations = [
    {
      id: 1,
      title: "Pre-Emergence Weedicide Application",
      description: "Apply within 48 hours of sowing for Maize crop to prevent weed competition",
      farm: "Sunrise Fields Chapu",
      crop: "Maize",
      stage: "Pre-Sowing",
      impact: "High",
      products: ["Pendimethalin", "Atrazine"],
      dosage: "1-1.5 kg/ha for Cholistan region",
    },
    {
      id: 2,
      title: "1st Irrigation Scheduling",
      description: "Schedule 1st irrigation for Wheat after 21-25 days of sowing in Cholistan climate",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      stage: "Growth & Tillering",
      impact: "High",
      products: ["Water - 50-60 mm"],
      dosage: "1-1.5 acre feet for local conditions",
    },
    {
      id: 3,
      title: "Soil pH Check Required",
      description: "Check soil pH before Maize sowing - Adjust if below 5.5 (common in Chapu area)",
      farm: "Sunrise Fields Chapu",
      crop: "Maize",
      stage: "Pre-Sowing",
      impact: "Medium",
      products: ["Lime (if needed)"],
      dosage: "2-3 tons/acre based on soil test",
    },
    {
      id: 4,
      title: "Bio-stimulant Application",
      description: "Apply bio-stimulants for better crop establishment suited to Cholistan climate",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      stage: "Sowing & Emergence",
      impact: "Medium",
      products: ["Seaweed Extract", "Amino Acids"],
      dosage: "1-2 ml per liter water",
    },
  ]

  const filteredAlerts = alerts.filter((a) => !dismissedAlerts.includes(a.id))

  const alertStats = {
    critical: alerts.filter((a) => a.priority === "Critical" && !dismissedAlerts.includes(a.id)).length,
    high: alerts.filter((a) => a.priority === "High" && !dismissedAlerts.includes(a.id)).length,
    medium: alerts.filter((a) => a.priority === "Medium" && !dismissedAlerts.includes(a.id)).length,
  }

  return (
    <Tabs defaultValue="alerts" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="alerts">Active Alerts ({filteredAlerts.length})</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="alerts" className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive mb-1">{alertStats.critical}</div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">{alertStats.high}</div>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-1">{alertStats.medium}</div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="relative">
              <Alert
                className={`border-l-4 ${
                  alert.priority === "Critical"
                    ? "border-destructive bg-destructive/5"
                    : alert.priority === "High"
                      ? "border-accent bg-accent/5"
                      : "border-secondary bg-secondary/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <alert.icon
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        alert.priority === "Critical"
                          ? "text-destructive"
                          : alert.priority === "High"
                            ? "text-accent"
                            : "text-secondary"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{alert.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {alert.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                      </div>
                      <AlertDescription className="text-sm mb-2">{alert.description}</AlertDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Farm: {alert.farm}</span>
                        <span>Crop: {alert.crop}</span>
                      </div>
                      <div className="mt-3 p-2 bg-background rounded text-sm">
                        <p className="font-semibold text-foreground">Action: {alert.action}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 flex-shrink-0"
                    onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </Alert>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-4">
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Badge variant="outline">{rec.stage}</Badge>
                    </div>
                    <CardDescription>{rec.description}</CardDescription>
                  </div>
                  <Badge
                    className={
                      rec.impact === "High"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {rec.impact} Impact
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Farm & Crop</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{rec.farm}</Badge>
                      <Badge variant="outline">{rec.crop}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Recommended Products</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.products.map((product) => (
                        <Badge key={product} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-semibold">Dosage:</span> {rec.dosage}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
