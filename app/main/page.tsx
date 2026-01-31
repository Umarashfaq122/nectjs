import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { FarmOverview } from '@/components/farm-overview'
import { CropStageTracker } from '@/components/crop-stage-tracker'
import { AlertsAndRecommendations } from '@/components/alerts-recommendations'
import { QuickStats } from '@/components/quick-stats'

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <QuickStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FarmOverview />
              </div>
              <div>
                <AlertsAndRecommendations />
              </div>
            </div>
            <CropStageTracker />
          </div>
        </main>
      </div>
    </div>
  )
}
