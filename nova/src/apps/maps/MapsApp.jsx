import React, { useState } from 'react'
import { Search, MapPin, Layers, Navigation, Navigation2, Crosshair } from 'lucide-react'

export function MapsApp() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'saved'

  // Default coordinates (e.g., San Francisco)
  const [coords, setCoords] = useState({ lat: 37.7749, lon: -122.4194 })
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`

  const savedLocations = [
    { name: 'Home Base', lat: 37.7749, lon: -122.4194 },
    { name: 'Server Farm', lat: 45.5231, lon: -122.6765 },
    { name: 'Tech Hub', lat: 40.7128, lon: -74.0060 },
  ]

  const handleLocationSelect = (loc) => {
    setCoords({ lat: loc.lat, lon: loc.lon })
  }

  return (
    <div className="h-full w-full bg-[#0d0e17] text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-[#121320] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
            />
          </div>
        </div>

        <div className="flex px-4 pt-3 gap-4 border-b border-white/5">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'search' ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'saved' ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Saved
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'saved' && (
            <div className="space-y-1">
              {savedLocations.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 text-purple-400 transition-colors">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover:text-[#00F0FF] transition-colors">{loc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {activeTab === 'search' && (
            <div className="p-4 text-center text-slate-500 text-sm">
              No recent searches
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative bg-black/20">
        <iframe
          title="Map View"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapUrl}
          className="opacity-90 saturate-50 contrast-125 filter mix-blend-screen"
        ></iframe>
        
        {/* Map Controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <button className="w-10 h-10 rounded-full bg-[#121320]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#00F0FF] hover:bg-[#1a1c2e] shadow-lg transition-all">
            <Crosshair size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#121320]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#00F0FF] hover:bg-[#1a1c2e] shadow-lg transition-all">
            <Navigation2 size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#121320]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#00F0FF] hover:bg-[#1a1c2e] shadow-lg transition-all">
            <Layers size={18} />
          </button>
        </div>

        {/* Top Info Bar overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className="bg-[#121320]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-[#00F0FF]" />
              <span className="text-sm font-medium text-slate-200">Current View</span>
              <span className="text-xs font-mono text-slate-400 ml-2">[{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
