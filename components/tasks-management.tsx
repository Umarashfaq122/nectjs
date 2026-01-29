"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Trash2, Clock, CheckCheck } from "lucide-react"

export function TasksManagement() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Schedule 1st Irrigation - Wheat",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      location: "Cholistan, Chapu, Bahawalpur",
      dueDate: "2024-11-16",
      priority: "High",
      status: "pending",
      description: "Apply 1st irrigation after 21-25 days of sowing - Critical for Cholistan region",
    },
    {
      id: 2,
      title: "Apply Pre-Emergence Weedicide",
      farm: "Sunrise Fields Chapu",
      crop: "Maize",
      location: "Cholistan, Chapu, Bahawalpur",
      dueDate: "2024-11-20",
      priority: "High",
      status: "pending",
      description: "Apply within 48 hours of sowing for optimal weed control",
    },
    {
      id: 3,
      title: "Soil pH Testing",
      farm: "Sunrise Fields Chapu",
      crop: "Maize",
      location: "Cholistan, Chapu, Bahawalpur",
      dueDate: "2024-11-18",
      priority: "Medium",
      status: "pending",
      description: "Check pH before sowing - Cholistan soils often need lime adjustment",
    },
    {
      id: 4,
      title: "Farm Visit - Pesticide Monitoring",
      farm: "Green Valley Chapu Farm",
      crop: "Wheat",
      location: "Cholistan, Chapu, Bahawalpur",
      dueDate: "2024-11-15",
      priority: "High",
      status: "completed",
      description: "Monitor for yellow rust and apply fungicide if needed",
    },
    {
      id: 5,
      title: "Harvest Cotton Field",
      farm: "Sunrise Fields Chapu",
      crop: "Cotton",
      location: "Cholistan, Chapu, Bahawalpur",
      dueDate: "2024-11-30",
      priority: "Medium",
      status: "completed",
      description: "Field is ready - schedule harvesting crew for timely pickup",
    },
  ])

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: task.status === "completed" ? "pending" : "completed" } : task,
      ),
    )
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const tasksByPriority = {
    high: pendingTasks.filter((t) => t.priority === "High").length,
    medium: pendingTasks.filter((t) => t.priority === "Medium").length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{pendingTasks.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{tasksByPriority.high}</p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{tasksByPriority.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No pending tasks</p>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task.id)} className="mt-1 flex-shrink-0">
                    <Circle size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge
                        variant="outline"
                        className={
                          task.priority === "High" ? "border-accent text-accent" : "border-secondary text-secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{task.farm}</Badge>
                      <Badge variant="outline">{task.crop}</Badge>
                      <span className="text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="flex-shrink-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCheck size={20} />
            Completed Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No completed tasks</p>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="border border-border rounded-lg p-4 bg-muted/30 opacity-75">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task.id)} className="mt-1 flex-shrink-0">
                    <CheckCircle2 size={20} className="text-primary" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold line-through text-muted-foreground">{task.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{task.farm}</Badge>
                      <Badge variant="outline">{task.crop}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="flex-shrink-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
