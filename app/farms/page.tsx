import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { FarmsList } from '@/components/farms-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FarmsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
            </div>
            <FarmsList />
          </div>
        </main>
      </div>
    </div>
  )
}
