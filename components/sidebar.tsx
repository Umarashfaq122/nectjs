'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard,
  Leaf,
  BarChart3,
  Settings,
  Menu,
  X,
  Sprout,
  Map,
  AlertCircle,
  CheckCircle2,
  Users,
  MessageSquareText

} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  id: string
  icon: React.ElementType
  label: string
  href: string
  badge?: string | null
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/main' },
  { id: 'farms', icon: Map, label: 'Farms', href: '/farms' },
  { id: 'crops', icon: Leaf, label: 'Crops', href: '/crops' },
  { id: 'visits', icon: Users, label: 'Visits', href: '/visits' },
  { id: 'stages', icon: Sprout, label: 'Growth Stages', href: '/stages' },
  { id: 'recommendation', icon: MessageSquareText, label: 'Recommendation', href: '/recommendation' },
  { id: 'alerts', icon: AlertCircle, label: 'Alerts', href: '/alerts' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { id: 'tasks', icon: CheckCircle2, label: 'Tasks', href: '/tasks' },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-sidebar-accent rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Yield Enhancement Program</h1>
              <p className="text-xs text-sidebar-foreground/70">Farm Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.id} // ✅ FIXED (UNIQUE)
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>

                {item.badge && (
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/20 rounded-lg p-3">
            <p className="text-xs text-sidebar-foreground/70">Connected</p>
            <p className="text-sm font-semibold">Farm Officer</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
