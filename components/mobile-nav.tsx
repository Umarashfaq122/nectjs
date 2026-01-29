'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { LayoutDashboard, Leaf, BarChart3, Settings, Home } from 'lucide-react'

export function MobileNav() {
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Leaf, label: 'Crops', href: '/crops' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-40">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors flex-1"
          >
            <item.icon size={20} />
            <span className="text-xs text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
