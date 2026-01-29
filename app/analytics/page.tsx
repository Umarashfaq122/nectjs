import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import FarmAnalytics from '@/components/FarmAnalytics'


export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Farm Analytics</h2>
              <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
            </div>
            {/* <AnalyticsDashboard /> */}
            <FarmAnalytics/>
          </div>
        </main>
      </div>
    </div>
  )
}
