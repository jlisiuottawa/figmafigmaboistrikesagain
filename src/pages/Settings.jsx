import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import EnergySurvey from '../components/EnergySurvey'
import notificationService from '../services/notificationService'

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const { notificationSettings, updateNotificationSettings } = useNotifications()
  const navigate = useNavigate()
  const [showSurvey, setShowSurvey] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [loadingSurvey, setLoadingSurvey] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [testingNotification, setTestingNotification] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  useEffect(() => {
    loadSurvey()
    // Check notification permission status
    setNotificationPermission(notificationService.checkPermission())
  }, [])

  const loadSurvey = async () => {
    try {
      const response = await api.getSurvey()
      setSurvey(response.survey)
    } catch (error) {
      console.error('Failed to load survey:', error)
    } finally {
      setLoadingSurvey(false)
    }
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleNotification = (key) => {
    const newValue = !notificationSettings[key]
    updateNotificationSettings({ [key]: newValue })
  }

  const handleSurveyComplete = async () => {
    setShowSurvey(false)
    await loadSurvey()
  }

  const handleRequestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      // Register service worker for persistent notifications
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered for notifications')
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }
    }
  }

  const handleTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      await handleRequestNotificationPermission()
      return
    }
    
    setTestingNotification(true)
    try {
      await notificationService.testNotification()
    } catch (error) {
      console.error('Test notification failed:', error)
      alert('Failed to send test notification. Please check your browser settings.')
    } finally {
      setTestingNotification(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        {/* Energy Survey Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Energy Profile</h2>
          {showSurvey ? (
            <EnergySurvey 
              onComplete={handleSurveyComplete}
              onSkip={() => setShowSurvey(false)}
              existingSurvey={survey}
            />
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Energy Survey</div>
                    <div className="text-sm text-slate-400">
                      {survey 
                        ? `Completed - ${survey.location}, ${survey.state_code}` 
                        : 'Complete to see accurate energy savings calculations'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSurvey(true)}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    {survey ? 'Update' : 'Complete Survey'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                </div>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Username</div>
                  <div className="text-sm text-slate-400">@{user.username}</div>
                </div>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                  Change
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Password</div>
                  <div className="text-sm text-slate-400">••••••••</div>
                </div>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Browser Notification Permission */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-white">Browser Notifications</div>
                  <div className="text-sm text-slate-400">
                    {notificationPermission === 'granted' 
                      ? 'Enabled - You will receive notifications even when the app is closed'
                      : notificationPermission === 'denied'
                      ? 'Blocked - Please enable notifications in your browser settings'
                      : 'Allow notifications to stay updated on friend activity and reminders'}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {notificationPermission === 'granted' && (
                    <button
                      onClick={handleTestNotification}
                      disabled={testingNotification}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {testingNotification ? 'Sending...' : 'Test'}
                    </button>
                  )}
                  {notificationPermission !== 'granted' && (
                    <button
                      onClick={handleRequestNotificationPermission}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 rounded-lg text-sm font-medium transition-colors"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Daily Reminders</div>
                  <div className="text-sm text-slate-400">Get reminded after 6 PM if you haven't logged in</div>
                </div>
                <button
                  onClick={() => toggleNotification('daily')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.daily ? 'bg-brand-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.daily ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Friend Activity</div>
                  <div className="text-sm text-slate-400">Get notified when friends complete tasks</div>
                </div>
                <button
                  onClick={() => toggleNotification('friends')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.friends ? 'bg-brand-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.friends ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Leaderboard Updates</div>
                  <div className="text-sm text-slate-400">Get notified when your leaderboard position changes</div>
                </div>
                <button
                  onClick={() => toggleNotification('leaderboard')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.leaderboard ? 'bg-brand-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.leaderboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Achievement Alerts</div>
                  <div className="text-sm text-slate-400">Get notified when you earn new achievements</div>
                </div>
                <button
                  onClick={() => toggleNotification('achievements')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.achievements ? 'bg-brand-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.achievements ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <button className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Profile Visibility</div>
                  <div className="text-sm text-slate-400">Public</div>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <button className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Activity Sharing</div>
                  <div className="text-sm text-slate-400">Friends only</div>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <button className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Data & Privacy</div>
                  <div className="text-sm text-slate-400">Manage your data</div>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <button className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">Help & Support</div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <button className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">Terms of Service</div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <button 
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">Privacy Policy</div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <div className="p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">Version</div>
                <div className="text-sm text-slate-400">1.9.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full p-4 border-b border-slate-700/50 text-left hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-red-400">Sign Out</div>
                <span className="text-slate-400">→</span>
              </div>
            </button>

            <button className="w-full p-4 text-left hover:bg-red-500/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-medium text-red-400">Delete Account</div>
                <span className="text-slate-400">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-slate-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-200 text-lg leading-relaxed">
                We use your information to give you personalized energy saving stats and tips. 
                Your information is never shared with any third parties.
              </p>
            </div>
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
