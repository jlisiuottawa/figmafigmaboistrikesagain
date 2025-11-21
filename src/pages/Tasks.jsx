import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// Define simple tasks that users can complete
const TASK_LIST = [
  { id: 1, title: 'Turn off 10 lights', icon: '💡', seeds: 100 },
  { id: 2, title: 'Bike to work', icon: '🚲', seeds: 150 },
  { id: 3, title: 'Unplug unused devices', icon: '🔌', seeds: 75 },
  { id: 4, title: 'Use cold water for laundry', icon: '💧', seeds: 120 },
  { id: 5, title: 'Air dry clothes instead of using dryer', icon: '👕', seeds: 100 },
  { id: 6, title: 'Take a 5-minute shower', icon: '🚿', seeds: 80 },
  { id: 7, title: 'Use a reusable water bottle', icon: '♻️', seeds: 50 },
  { id: 8, title: 'Turn off computer when not in use', icon: '💻', seeds: 75 },
  { id: 9, title: 'Use natural light instead of lamps', icon: '🌞', seeds: 100 },
  { id: 10, title: 'Lower thermostat by 2 degrees', icon: '🌡️', seeds: 130 },
  { id: 11, title: 'Carpool or use public transportation', icon: '🚌', seeds: 150 },
  { id: 12, title: 'Use a power strip and turn it off', icon: '⚡', seeds: 80 },
  { id: 13, title: 'Close curtains to keep heat in/out', icon: '🪟', seeds: 100 },
  { id: 14, title: 'Run dishwasher only when full', icon: '🍽️', seeds: 110 },
  { id: 15, title: 'Replace one bulb with LED', icon: '💡', seeds: 120 }
]

// Bonus tasks that cycle when all main tasks are done
const BONUS_TASKS = [
  { id: 101, title: 'Walk instead of drive for short trips', icon: '🚶', seeds: 100 },
  { id: 102, title: 'Use a programmable thermostat', icon: '🎛️', seeds: 120 },
  { id: 103, title: 'Wash dishes by hand efficiently', icon: '🧼', seeds: 90 },
  { id: 104, title: 'Use reusable bags for shopping', icon: '🛍️', seeds: 60 }
]

export default function Tasks() {
  const { user, updateUser, refreshUser } = useAuth()
  const [completedTasks, setCompletedTasks] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [lastCompletedDate, setLastCompletedDate] = useState(null)
  const [availableTasks, setAvailableTasks] = useState([])

  // Check if we need to reset tasks for a new day
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const lastDate = user.lastActivityDate || user.last_activity_date
      
      setLastCompletedDate(lastDate)
      
      // If it's a new day, reset completed tasks (main tasks only)
      if (lastDate && lastDate !== today) {
        setCompletedTasks(new Set())
        // Update user's last activity date and reset main tasks
        updateUser({ 
          completedTaskIds: [],
          last_activity_date: today
        })
      } else if (user?.completedTaskIds) {
        setCompletedTasks(new Set(user.completedTaskIds))
      }
    }
  }, [user?.id])

  // Determine which tasks to show
  useEffect(() => {
    const mainTasksCompleted = TASK_LIST.every(task => completedTasks.has(task.id))
    
    if (mainTasksCompleted) {
      // All main tasks done, show all bonus tasks (they refresh when completed)
      setAvailableTasks([...TASK_LIST, ...BONUS_TASKS])
    } else {
      // Show only main tasks
      setAvailableTasks(TASK_LIST)
    }
  }, [completedTasks])

  const handleCompleteTask = async (task) => {
    if (completedTasks.has(task.id)) {
      return // Already completed
    }

    setLoading(true)
    try {
      // Add task to completed set
      const newCompletedTasks = new Set(completedTasks)
      newCompletedTasks.add(task.id)
      
      // If it's a bonus task, immediately remove it from completed set to allow re-completion
      const isBonusTask = BONUS_TASKS.some(t => t.id === task.id)
      if (isBonusTask) {
        // Temporarily show the task as completed
        setCompletedTasks(newCompletedTasks)
        
        // Update user seeds only (don't persist bonus tasks in completedTaskIds)
        const newSeeds = (user.seeds || 0) + task.seeds
        const today = new Date().toISOString().split('T')[0]
        
        await updateUser({ 
          seeds: newSeeds,
          last_activity_date: today
        })
        
        // Clear the bonus task from completed after a short delay to show the animation
        setTimeout(() => {
          setCompletedTasks(prevTasks => {
            const resetTasks = new Set(prevTasks)
            resetTasks.delete(task.id)
            return resetTasks
          })
        }, 500)
      } else {
        // Main task - add to completed and persist
        setCompletedTasks(newCompletedTasks)
        
        const newSeeds = (user.seeds || 0) + task.seeds
        const today = new Date().toISOString().split('T')[0]
        
        await updateUser({ 
          seeds: newSeeds,
          completedTaskIds: Array.from(newCompletedTasks),
          last_activity_date: today
        })
      }

      // Refresh user to get latest data
      await refreshUser()
    } catch (error) {
      console.error('Failed to complete task:', error)
      // Revert on error
      const revertedTasks = new Set(completedTasks)
      revertedTasks.delete(task.id)
      setCompletedTasks(revertedTasks)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const mainTasksCompleted = TASK_LIST.filter(task => completedTasks.has(task.id)).length
  const totalCompleted = mainTasksCompleted
  const allMainTasksDone = mainTasksCompleted === TASK_LIST.length
  const totalSeeds = [...TASK_LIST]
    .filter(task => completedTasks.has(task.id))
    .reduce((sum, task) => sum + task.seeds, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Daily Tasks</h1>
          <p className="text-slate-400">Complete eco-friendly tasks to earn seeds!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-brand-primary">{totalCompleted}</div>
            <div className="text-xs text-slate-400">Completed Today</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-2xl font-bold text-white">{mainTasksCompleted}/{TASK_LIST.length}</div>
            <div className="text-xs text-slate-400">Main Tasks</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="text-2xl mb-1">🌱</div>
            <div className="text-2xl font-bold text-yellow-400">{totalSeeds}</div>
            <div className="text-xs text-slate-400">From Main Tasks</div>
          </div>
        </div>

        {/* Bonus Tasks Info Banner */}
        {allMainTasksDone && (
          <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Bonus Tasks Unlocked!</h3>
                <p className="text-sm text-slate-300">
                  You've completed all main tasks! Bonus tasks refresh instantly - complete them as many times as you want today!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {/* Main Tasks Section */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Daily Tasks</span>
              {allMainTasksDone && <span className="text-green-400 text-sm">(All Complete!)</span>}
            </h2>
            <div className="space-y-3">
              {TASK_LIST.map(task => {
                const isCompleted = completedTasks.has(task.id)
                
                return (
                  <div
                    key={task.id}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                      isCompleted 
                        ? 'border-green-500/30 bg-green-900/10' 
                        : 'border-slate-700/50 hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{task.icon}</div>
                      <div className="flex-grow">
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Reward: <span className="text-yellow-400 font-semibold">🌱 {task.seeds} seeds</span>
                        </p>
                      </div>
                      <div>
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <span className="text-2xl">✓</span>
                            <span>Done</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            disabled={loading}
                            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bonus Tasks Section - Only show when main tasks are done */}
          {allMainTasksDone && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <span>🎁</span>
                <span>Bonus Tasks</span>
                <span className="text-purple-400 text-sm">(Refresh instantly!)</span>
              </h2>
              <div className="space-y-3">
                {BONUS_TASKS.map(task => {
                  const isCompleted = completedTasks.has(task.id)
                  
                  return (
                    <div
                      key={task.id}
                      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                        isCompleted 
                          ? 'border-purple-500/30 bg-purple-900/10' 
                          : 'border-purple-700/50 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{task.icon}</div>
                        <div className="flex-grow">
                          <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Bonus Reward: <span className="text-yellow-400 font-semibold">🌱 {task.seeds} seeds</span>
                          </p>
                        </div>
                        <div>
                          {isCompleted ? (
                            <div className="flex items-center gap-2 text-purple-400 font-semibold">
                              <span className="text-2xl">✓</span>
                              <span>Done</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCompleteTask(task)}
                              disabled={loading}
                              className="px-5 py-2 bg-purple-600 hover:bg-purple-600/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Completion Messages */}
        {allMainTasksDone && (
          <div className="mt-6 bg-gradient-to-r from-green-500/20 to-brand-primary/20 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">All Main Tasks Completed!</h2>
            <p className="text-slate-300">Great job! You've earned seeds. Check out the bonus tasks above for unlimited extra rewards!</p>
            <p className="text-slate-400 text-sm mt-2">Main tasks will refresh tomorrow at midnight!</p>
          </div>
        )}
      </div>
    </div>
  )
}
