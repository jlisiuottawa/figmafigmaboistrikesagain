import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Garden() {
  const { user, refreshUser } = useAuth()
  const [garden, setGarden] = useState({ plants: [], background: null })
  const [availableItems, setAvailableItems] = useState({ plants: [], backgrounds: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('garden') // 'garden' or 'shop'
  const [shopTab, setShopTab] = useState('plants') // 'plants' or 'backgrounds'
  const [error, setError] = useState(null)
  const [purchaseMessage, setPurchaseMessage] = useState(null)
  const [draggedPlant, setDraggedPlant] = useState(null)
  const [tempPositions, setTempPositions] = useState({})
  const gardenAreaRef = useRef(null)

  useEffect(() => {
    loadGardenData()
  }, [])

  const loadGardenData = async () => {
    try {
      setLoading(true)
      const [gardenData, plantsData, backgroundsData] = await Promise.all([
        api.getGarden(),
        api.getGardenItems('plant'),
        api.getGardenItems('background')
      ])
      
      setGarden(gardenData)
      setAvailableItems({
        plants: plantsData.items || [],
        backgrounds: backgroundsData.items || []
      })
    } catch (error) {
      console.error('Failed to load garden:', error)
      setError('Failed to load garden data')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (item) => {
    try {
      setPurchaseMessage(null)
      setError(null)

      const response = await api.purchaseGardenItem(item.id, 0, 0)
      setPurchaseMessage(`${item.name} purchased successfully! 🌱`)
      
      // Refresh garden and user data
      await Promise.all([
        loadGardenData(),
        refreshUser()
      ])

      // Clear message after 3 seconds
      setTimeout(() => setPurchaseMessage(null), 3000)
    } catch (error) {
      console.error('Purchase failed:', error)
      setError(error.message || 'Failed to purchase item')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDragStart = (e, plant) => {
    setDraggedPlant(plant)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (!draggedPlant || !gardenAreaRef.current) return

    const rect = gardenAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Store temporary position
    setTempPositions(prev => ({
      ...prev,
      [draggedPlant.id]: { x, y }
    }))

    setDraggedPlant(null)
  }

  const handlePlantClick = async () => {
    try {
      setError(null)
      setPurchaseMessage(null)

      // Save all temp positions to backend
      const updatePromises = Object.entries(tempPositions).map(([plantId, pos]) =>
        api.updatePlantPosition(parseInt(plantId), Math.round(pos.x), Math.round(pos.y))
      )

      await Promise.all(updatePromises)
      
      setPurchaseMessage('Plants placed successfully! 🌱')
      setTempPositions({})
      
      // Refresh garden data
      await loadGardenData()

      setTimeout(() => setPurchaseMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save plant positions:', error)
      setError(error.message || 'Failed to save plant positions')
      setTimeout(() => setError(null), 3000)
    }
  }

  const getPlantPosition = (plant) => {
    // Check if there's a temp position first
    if (tempPositions[plant.id]) {
      return tempPositions[plant.id]
    }
    // Otherwise use saved position
    return { x: plant.position_x || 0, y: plant.position_y || 0 }
  }

  const handleRemovePlant = async (plantId) => {
    try {
      setError(null)
      setPurchaseMessage(null)

      await api.removePlant(plantId)
      
      setPurchaseMessage('Plant removed from garden! You can replant it anytime. 🌱')
      
      // Clear temp position if exists
      setTempPositions(prev => {
        const updated = { ...prev }
        delete updated[plantId]
        return updated
      })
      
      // Refresh garden data
      await loadGardenData()

      setTimeout(() => setPurchaseMessage(null), 3000)
    } catch (error) {
      console.error('Failed to remove plant:', error)
      setError(error.message || 'Failed to remove plant')
      setTimeout(() => setError(null), 3000)
    }
  }

  const hasUnsavedPositions = Object.keys(tempPositions).length > 0

  const userSeeds = user?.seeds || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20 flex items-center justify-center">
        <div className="text-xl">Loading garden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Garden 🌱</h1>
          <p className="text-slate-400">Grow your garden with seeds earned from challenges</p>
          <div className="mt-3 flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2 w-fit">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-yellow-400">{userSeeds}</span>
            <span className="text-slate-400">seeds</span>
          </div>
        </div>

        {/* Messages */}
        {purchaseMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400">
            {purchaseMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('garden')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'garden'
                ? 'bg-brand-primary text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            🏡 My Garden
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'shop'
                ? 'bg-brand-primary text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            🛒 Shop
          </button>
        </div>

        {/* Garden View */}
        {activeTab === 'garden' && (
          <div className="space-y-6">
            {/* Background Section with Drop Zone */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Garden</h2>
                {hasUnsavedPositions && (
                  <button
                    onClick={handlePlantClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    🌱 Plant!
                  </button>
                )}
              </div>
              
              {garden.background && garden.background.background_id ? (
                <div
                  ref={gardenAreaRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative h-96 rounded-lg overflow-hidden cursor-crosshair"
                  style={{
                    backgroundImage: `url(${garden.background.image_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Render planted items on background */}
                  {garden.plants.map(plant => {
                    const pos = getPlantPosition(plant)
                    const hasPosition = pos.x !== 0 || pos.y !== 0 || tempPositions[plant.id]
                    
                    if (!hasPosition) return null

                    return (
                      <div
                        key={plant.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, plant)}
                        className="absolute cursor-move"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                      >
                        <img
                          src={plant.image_path}
                          alt={plant.name}
                          className="w-16 h-16 object-contain pointer-events-none"
                          title={plant.name}
                        />
                      </div>
                    )
                  })}
                  
                  {/* Instructions overlay when no plants placed */}
                  {garden.plants.length > 0 && !garden.plants.some(p => {
                    const pos = getPlantPosition(p)
                    return pos.x !== 0 || pos.y !== 0 || tempPositions[p.id]
                  }) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🌱</div>
                        <p className="text-lg font-semibold">Drag plants from below onto your garden!</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 rounded-lg bg-slate-900/50 border-2 border-dashed border-slate-700 flex items-center justify-center">
                  <p className="text-slate-500">No background selected. Visit the shop to buy a background!</p>
                </div>
              )}
            </div>

            {/* Plants Inventory Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">Your Plants ({garden.plants.length})</h2>
              {garden.plants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {garden.plants.map(plant => {
                    const pos = getPlantPosition(plant)
                    const isPlaced = pos.x !== 0 || pos.y !== 0 || tempPositions[plant.id]
                    
                    return (
                      <div
                        key={plant.id}
                        draggable={garden.background && garden.background.background_id}
                        onDragStart={(e) => handleDragStart(e, plant)}
                        className={`bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-brand-primary/30 transition-all ${
                          garden.background && garden.background.background_id ? 'cursor-move' : 'cursor-not-allowed'
                        } ${isPlaced ? 'opacity-50' : ''}`}
                        title={garden.background && garden.background.background_id ? 'Drag to place in garden' : 'Buy a background first'}
                      >
                        <div className="aspect-square bg-slate-800/50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={plant.image_path}
                            alt={plant.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <p className="text-sm font-medium text-center truncate">{plant.name}</p>
                        {isPlaced && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-400 text-center">
                              {tempPositions[plant.id] ? '📍 Temporary' : '✓ Placed'}
                            </p>
                            <button
                              onClick={() => handleRemovePlant(plant.id)}
                              className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-colors"
                              title="Remove from garden (keeps in inventory)"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-5xl mb-3">🌱</div>
                  <p>No plants yet. Start shopping to grow your garden!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop View */}
        {activeTab === 'shop' && (
          <div>
            {/* Shop Tab Navigation */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShopTab('plants')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  shopTab === 'plants'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                🌿 Plants
              </button>
              <button
                onClick={() => setShopTab('backgrounds')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  shopTab === 'backgrounds'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                🖼️ Backgrounds
              </button>
            </div>

            {/* Shop Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopTab === 'plants' && availableItems.plants.map(plant => {
                const canAfford = userSeeds >= plant.cost_seeds
                const ownedCount = garden.plants.filter(p => p.item_id === plant.id).length
                const atMaxLimit = ownedCount >= 2
                
                return (
                  <div
                    key={plant.id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-brand-primary/30 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={plant.image_path}
                          alt={plant.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white mb-1">{plant.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">{plant.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-semibold">
                            🌱 {plant.cost_seeds} seeds
                          </span>
                          {atMaxLimit ? (
                            <span className="text-xs bg-slate-700/50 text-slate-400 px-3 py-1 rounded">
                              Max owned ({ownedCount}/2)
                            </span>
                          ) : ownedCount > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                Owned ({ownedCount}/2)
                              </span>
                              <button
                                onClick={() => handlePurchase(plant)}
                                disabled={!canAfford}
                                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  canAfford
                                    ? 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'Buy Another' : 'Not enough seeds'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePurchase(plant)}
                              disabled={!canAfford}
                              className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                                canAfford
                                  ? 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {canAfford ? 'Buy' : 'Not enough seeds'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {shopTab === 'backgrounds' && availableItems.backgrounds.map(background => {
                const canAfford = userSeeds >= background.cost_seeds
                const isActive = garden.background?.background_id === background.id
                
                return (
                  <div
                    key={background.id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-brand-primary/30 transition-all"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                      <img
                        src={background.image_path}
                        alt={background.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{background.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{background.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-semibold">
                        🌱 {background.cost_seeds} seeds
                      </span>
                      {isActive ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded">
                          ✓ Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(background)}
                          disabled={!canAfford}
                          className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                            canAfford
                              ? 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Buy' : 'Not enough seeds'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
