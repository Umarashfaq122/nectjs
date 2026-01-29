import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { AlertsManagement } from '@/components/alerts-management'

export default function AlertsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Alerts & Recommendations</h2>
              <p className="text-muted-foreground mt-1">Monitor farm health and get actionable insights</p>
            </div>
            <AlertsManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
