import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { TasksManagement } from '@/components/tasks-management'

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Farm Tasks</h2>
              <p className="text-muted-foreground mt-1">Track and manage farm activities</p>
            </div>
            <TasksManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
