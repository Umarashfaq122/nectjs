'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
  const [settings, setSettings] = useState({
    officerName: 'John Doe',
    email: 'john@farmos.com',
    phone: '+91-98765-43210',
    region: 'Jaipur, Rajasthan',
    language: 'english',
    emailAlerts: true,
    smsAlerts: false,
    urgentOnly: false,
  })

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="officer-name">Farm Officer Name</Label>
              <Input
                id="officer-name"
                value={settings.officerName}
                onChange={(e) => setSettings({...settings, officerName: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="region">Default Region</Label>
              <Select value={settings.region} onValueChange={(value) => setSettings({...settings, region: value})}>
                <SelectTrigger id="region" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jaipur">Jaipur, Rajasthan</SelectItem>
                  <SelectItem value="agra">Agra, Uttar Pradesh</SelectItem>
                  <SelectItem value="mathura">Mathura, Uttar Pradesh</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
              <Checkbox
                id="email-alerts"
                checked={settings.emailAlerts}
                onCheckedChange={(checked) => setSettings({...settings, emailAlerts: checked as boolean})}
              />
              <div className="flex-1">
                <Label htmlFor="email-alerts" className="cursor-pointer font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
              <Checkbox
                id="sms-alerts"
                checked={settings.smsAlerts}
                onCheckedChange={(checked) => setSettings({...settings, smsAlerts: checked as boolean})}
              />
              <div className="flex-1">
                <Label htmlFor="sms-alerts" className="cursor-pointer font-semibold">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
              <Checkbox
                id="urgent-only"
                checked={settings.urgentOnly}
                onCheckedChange={(checked) => setSettings({...settings, urgentOnly: checked as boolean})}
              />
              <div className="flex-1">
                <Label htmlFor="urgent-only" className="cursor-pointer font-semibold">Urgent Alerts Only</Label>
                <p className="text-sm text-muted-foreground">Only receive critical alerts</p>
              </div>
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>General system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                  <SelectItem value="punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About FarmOS</CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-semibold">Phase 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-semibold">November 14, 2024</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
