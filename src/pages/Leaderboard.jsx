import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('This Month')
  const [sortBy, setSortBy] = useState('seeds') // 'seeds' or 'streak'

  const timeFilters = ['This Week', 'This Month', 'All Time']

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await api.getFriendsLeaderboard()
      setLeaderboardData(response.leaderboard || [])
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => {
    if (sortBy === 'streak') {
      return (b.streak || 0) - (a.streak || 0)
    } else {
      // Sort by seeds (using completed_tasks as a proxy for total seeds earned)
      return (b.completed_tasks || 0) - (a.completed_tasks || 0)
    }
  })

  if (!user) return null

  // Find current user's rank
  const userRank = sortedLeaderboard.findIndex(u => u.id === user.id) + 1
  const currentUser = sortedLeaderboard.find(u => u.id === user.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-slate-400">Compete with your friends</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {timeFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-6">
          <span className="text-slate-400 text-sm py-2">Sort by:</span>
          <button
            onClick={() => setSortBy('seeds')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              sortBy === 'seeds'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌱 Seeds
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              sortBy === 'streak'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Streak
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {sortedLeaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {sortedLeaderboard.slice(0, 3).map((person, idx) => {
                  const accessories = person.accessories ? JSON.parse(person.accessories) : []
                  const rank = idx + 1
                  
                  return (
                    <div
                      key={person.id}
                      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center ${
                        idx === 0 ? 'order-2 md:scale-105' : idx === 1 ? 'order-1' : 'order-3'
                      }`}
                    >
                      <div className="text-4xl mb-2">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                      </div>
                      
                      {/* Mascot with accessories */}
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <img 
                          src="/EcoBuddyTransparent_cropped.png" 
                          alt="EcoBuddy" 
                          className="w-full h-full object-contain"
                        />
                        {accessories.includes('sunglasses') && (
                          <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 text-2xl">🕶️</div>
                        )}
                        {accessories.includes('tophat') && (
                          <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 text-2xl">🎩</div>
                        )}
                        {accessories.includes('crown') && (
                          <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 text-2xl">👑</div>
                        )}
                        {accessories.includes('scarf') && (
                          <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 text-2xl">🧣</div>
                        )}
                      </div>
                      
                      <div className="font-semibold text-white mb-1">{person.name}</div>
                      <div className="text-2xl font-bold text-brand-primary mb-1">{person.completed_tasks || 0}</div>
                      <div className="text-xs text-slate-400">tasks completed</div>
                      <div className="mt-2 text-xs text-slate-500">🔥 {person.streak || 0} days</div>
                      <div className="mt-1 text-xs text-green-400">Today: {person.daily_progress || 0} tasks</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full Leaderboard List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              {sortedLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="mb-2">No leaderboard data yet</p>
                  <p className="text-sm">Add friends to see rankings!</p>
                </div>
              ) : (
                sortedLeaderboard.map((person, index) => {
                  const isCurrentUser = person.id === user.id
                  const rank = index + 1
                  const accessories = person.accessories ? JSON.parse(person.accessories) : []

                  return (
                    <div
                      key={person.id}
                      className={`flex items-center gap-4 p-4 border-b border-slate-700/50 last:border-b-0 transition-colors ${
                        isCurrentUser 
                          ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary' 
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center">
                        <div className="text-xl font-bold text-slate-400">#{rank}</div>
                      </div>

                      {/* Badge */}
                      <div className="text-3xl">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '⭐'}
                      </div>

                      {/* Mascot with accessories */}
                      <div className="relative w-16 h-16">
                        <img 
                          src="/EcoBuddyTransparent_cropped.png" 
                          alt="EcoBuddy" 
                          className="w-full h-full object-contain"
                        />
                        {accessories.includes('sunglasses') && (
                          <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 text-xl">🕶️</div>
                        )}
                        {accessories.includes('tophat') && (
                          <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 text-xl">🎩</div>
                        )}
                        {accessories.includes('crown') && (
                          <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 text-xl">👑</div>
                        )}
                        {accessories.includes('scarf') && (
                          <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 text-xl">🧣</div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-grow">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {person.name}
                          {isCurrentUser && (
                            <span className="text-xs bg-brand-primary px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          🔥 {person.streak || 0} day streak • Today: {person.daily_progress || 0} tasks
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-brand-primary">{person.completed_tasks || 0}</div>
                        <div className="text-xs text-slate-400">tasks done</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* User Stats Summary */}
            {currentUser && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-slate-400 text-sm mb-1">Your Rank</div>
                  <div className="text-2xl font-bold text-white">#{userRank || '-'}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-slate-400 text-sm mb-1">Total Tasks</div>
                  <div className="text-2xl font-bold text-brand-primary">{currentUser.completed_tasks || 0}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-slate-400 text-sm mb-1">Current Streak</div>
                  <div className="text-2xl font-bold text-orange-400">{currentUser.streak || 0} 🔥</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-slate-400 text-sm mb-1">Today's Progress</div>
                  <div className="text-2xl font-bold text-white">{currentUser.daily_progress || 0}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
