'use client'

import { Card } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Spray insecticide in Field #2', priority: 'urgent', dueDate: 'Today', completed: false },
    { id: 2, title: 'Check soil moisture levels', priority: 'high', dueDate: 'Today', completed: true },
    { id: 3, title: 'Schedule irrigation for Field #1', priority: 'high', dueDate: 'Tomorrow', completed: false },
    { id: 4, title: 'Collect germination data', priority: 'medium', dueDate: 'Tomorrow', completed: false },
    { id: 5, title: 'Review harvest recommendations', priority: 'low', dueDate: 'This Week', completed: true },
  ])

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task))
  }

  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-white p-4 shadow-lg">
        <Link href="/mobile/dashboard">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Tasks</h1>
        <span className="bg-white text-primary px-2 py-1 rounded text-xs font-bold">
          {tasks.filter(t => !t.completed).length}
        </span>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className={`p-3 cursor-pointer transition-opacity ${task.completed ? 'opacity-60' : ''}`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-start gap-3">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
