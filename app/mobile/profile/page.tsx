'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-white p-4 shadow-lg">
        <Link href="/mobile/dashboard">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar & Name */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            RK
          </div>
          <h2 className="text-xl font-bold">Ravi Kumar</h2>
          <p className="text-sm text-muted-foreground">Farm Officer • North Region</p>
        </Card>

        {/* Contact Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">ravi.kumar@farmms.com</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-muted-foreground">Region</p>
              <p className="font-medium">North Region • Zone A</p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">Notification Preferences</Button>
            <Button variant="outline" className="w-full justify-start">Language: English</Button>
            <Button variant="outline" className="w-full justify-start">About App v1.0</Button>
          </div>
        </Card>

        {/* Logout */}
        <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
