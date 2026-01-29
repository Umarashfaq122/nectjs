import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { SettingsPage as SettingsContent } from '@/components/settings-page'

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Settings</h2>
              <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>
            <SettingsContent />
          </div>
        </main>
      </div>
    </div>
  )
}
