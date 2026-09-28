import React, { useState, useEffect } from 'react'
import {
  Moon,
  Sun,
  Monitor,
  Palette,
  Layout,
  Layers,
  HardDrive,
  Info,
  Check,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Sliders,
  Bell,
  Sparkles,
  Cpu,
  ChevronRight
} from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useAIStore } from '../../stores/aiStore'
import { NovaLogo } from '../../components/brand/NovaLogo'
import {
  NOVA_WALLPAPER,
  AURORA_WALLPAPER,
  DEEP_SPACE_WALLPAPER,
  OBSIDIAN_WALLPAPER,
} from '../../assets/branding'

export function SettingsApp({ window: win }) {
  const [activeSection, setActiveSection] = useState(win?.params?.section || 'personalization')
  const [personalizationTab, setPersonalizationTab] = useState('taskbar') 
  const [storageEstimate, setStorageEstimate] = useState(null)

  useEffect(() => {
    if (win?.params?.section) {
      setActiveSection(win.params.section)
    }
  }, [win?.params?.section])

  // Stores
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const themePreset = useSettingsStore((s) => s.themePreset)
  const setThemePreset = useSettingsStore((s) => s.setThemePreset)
  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const setWallpaper = useSettingsStore((s) => s.setWallpaper)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const setAccentColor = useSettingsStore((s) => s.setAccentColor)

  const dockPosition = useSettingsStore((s) => s.dockPosition)
  const setDockPosition = useSettingsStore((s) => s.setDockPosition)
  const dockAlignment = useSettingsStore((s) => s.dockAlignment)
  const setDockAlignment = useSettingsStore((s) => s.setDockAlignment)
  const dockSize = useSettingsStore((s) => s.dockSize)
  const setDockSize = useSettingsStore((s) => s.setDockSize)
  const dockAutoHide = useSettingsStore((s) => s.dockAutoHide)
  const setDockAutoHide = useSettingsStore((s) => s.setDockAutoHide)
  const dockStyle = useSettingsStore((s) => s.dockStyle)
  const setDockStyle = useSettingsStore((s) => s.setDockStyle)
  const dockTransparency = useSettingsStore((s) => s.dockTransparency)
  const setDockTransparency = useSettingsStore((s) => s.setDockTransparency)

  const showPinnedApps = useSettingsStore((s) => s.showPinnedApps)
  const setShowPinnedApps = useSettingsStore((s) => s.setShowPinnedApps)
  const showRunningApps = useSettingsStore((s) => s.showRunningApps)
  const setShowRunningApps = useSettingsStore((s) => s.setShowRunningApps)
  const activeIndicatorStyle = useSettingsStore((s) => s.activeIndicatorStyle)
  const setActiveIndicatorStyle = useSettingsStore((s) => s.setActiveIndicatorStyle)

  const showSystemTrayNetwork = useSettingsStore((s) => s.showSystemTrayNetwork)
  const setShowSystemTrayNetwork = useSettingsStore((s) => s.setShowSystemTrayNetwork)
  const showSystemTrayVolume = useSettingsStore((s) => s.showSystemTrayVolume)
  const setShowSystemTrayVolume = useSettingsStore((s) => s.setShowSystemTrayVolume)
  const showSystemTrayBattery = useSettingsStore((s) => s.showSystemTrayBattery)
  const setShowSystemTrayBattery = useSettingsStore((s) => s.setShowSystemTrayBattery)
  const showSystemTrayNotifications = useSettingsStore((s) => s.showSystemTrayNotifications)
  const setShowSystemTrayNotifications = useSettingsStore((s) => s.setShowSystemTrayNotifications)
  const showSystemTrayClock = useSettingsStore((s) => s.showSystemTrayClock)
  const setShowSystemTrayClock = useSettingsStore((s) => s.setShowSystemTrayClock)
  const clockFormat = useSettingsStore((s) => s.clockFormat)
  const setClockFormat = useSettingsStore((s) => s.setClockFormat)
  const showClockSeconds = useSettingsStore((s) => s.showClockSeconds)
  const toggleShowClockSeconds = useSettingsStore((s) => s.toggleShowClockSeconds)

  const showWorkspaceIndicator = useSettingsStore((s) => s.showWorkspaceIndicator)
  const setShowWorkspaceIndicator = useSettingsStore((s) => s.setShowWorkspaceIndicator)
  const lockTaskbar = useSettingsStore((s) => s.lockTaskbar)
  const setLockTaskbar = useSettingsStore((s) => s.setLockTaskbar)
  
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace)
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace)
  const renameWorkspace = useWorkspaceStore((s) => s.renameWorkspace)
  const removeWorkspace = useWorkspaceStore((s) => s.removeWorkspace)

  const geminiApiKey = useAIStore((s) => s.geminiApiKey)
  const setGeminiApiKey = useAIStore((s) => s.setGeminiApiKey)

  const [newWsName, setNewWsName] = useState('')
  const [editingWsId, setEditingWsId] = useState(null)
  const [editingWsName, setEditingWsName] = useState('')

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorageEstimate({
          usageMB: (est.usage / (1024 * 1024)).toFixed(2),
          quotaMB: (est.quota / (1024 * 1024)).toFixed(0),
        })
      })
    }
  }, [])

  const capabilityCheck = (apiName) => {
    switch (apiName) {
      case 'notifications': return typeof window !== 'undefined' && 'Notification' in window
      case 'clipboard': return typeof navigator !== 'undefined' && 'clipboard' in navigator
      case 'filesystem': return typeof window !== 'undefined' && 'showOpenFilePicker' in window
      case 'fullscreen': return typeof document !== 'undefined' && 'fullscreenEnabled' in document
      case 'serviceWorker': return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      default: return false
    }
  }

  // Common UI Components for the new premium design
  const SectionTitle = ({ title, subtitle }) => (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{title}</h2>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );

  const SettingRow = ({ label, description, control, border = true }) => (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-white/5' : ''}`}>
      <div className="pr-4">
        <div className="font-medium text-slate-200 text-[13px]">{label}</div>
        {description && <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{description}</div>}
      </div>
      <div className="shrink-0 ml-4">
        {control}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#00F0FF]' : 'bg-white/10'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );

  const SegmentedControl = ({ options, value, onChange }) => (
    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 capitalize ${
            value === opt.id 
              ? 'bg-white/15 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          {opt.label || opt.id}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-full w-full bg-transparent text-slate-200 select-none overflow-hidden font-sans">
      
      {/* Sidebar Navigation - Glassmorphism Style */}
      <aside className="w-56 bg-black/30 backdrop-blur-3xl border-r border-white/10 flex flex-col p-4 gap-2 shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">
          System Preferences
        </div>

        {[
          { id: 'personalization', name: 'Personalization', icon: Palette },
          { id: 'workspaces', name: 'Workspaces', icon: Layers },
          { id: 'ai', name: 'AI Assistant', icon: Cpu },
          { id: 'system', name: 'System Info', icon: HardDrive },
          { id: 'about', name: 'About NOVA', icon: Info },
        ].map((sec) => {
          const IconComp = sec.icon
          const active = activeSection === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-[#00F0FF]/20 to-transparent border border-[#00F0FF]/30 shadow-[inset_2px_0_0_#00F0FF]'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComp size={16} className={active ? 'text-[#00F0FF]' : 'group-hover:scale-110 transition-transform'} />
                <span className={`text-[13px] ${active ? 'text-white font-semibold' : 'font-medium'}`}>{sec.name}</span>
              </div>
              {active && <ChevronRight size={14} className="text-[#00F0FF]/60" />}
            </button>
          )
        })}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-black/20 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="relative p-10 max-w-3xl mx-auto min-h-full">
          
          {activeSection === 'personalization' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <SectionTitle 
                title="Personalization" 
                subtitle="Customize the appearance, taskbar, and visual behavior of your environment." 
              />
              
              {/* Premium Tabs */}
              <div className="flex p-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/5 mb-8 w-fit shadow-inner">
                {[
                  { id: 'taskbar', label: 'Taskbar', icon: Layout },
                  { id: 'appearance', label: 'Appearance', icon: Sliders },
                  { id: 'wallpapers', label: 'Wallpapers', icon: Eye },
                  { id: 'themes', label: 'Presets', icon: Sparkles },
                ].map((tab) => {
                  const IconC = tab.icon
                  const active = personalizationTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPersonalizationTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-[12px] font-medium ${
                        active
                          ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <IconC size={14} className={active ? 'text-[#00F0FF]' : ''} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* TASKBAR TAB */}
              {personalizationTab === 'taskbar' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-[#00F0FF] mb-2 flex items-center gap-2">
                      <Layout size={14} /> Position & Layout
                    </h3>
                    
                    <SettingRow 
                      label="Taskbar Position" 
                      description="Dock screen placement (Bottom, Top, Left, Right)." 
                      control={
                        <SegmentedControl 
                          options={[{id:'bottom'}, {id:'top'}, {id:'left'}, {id:'right'}]} 
                          value={dockPosition} 
                          onChange={setDockPosition} 
                        />
                      } 
                    />
                    
                    <SettingRow 
                      label="Taskbar Alignment" 
                      description="Icon alignment inside taskbar container." 
                      control={
                        <SegmentedControl 
                          options={[{id:'left'}, {id:'center'}, {id:'right'}]} 
                          value={dockAlignment} 
                          onChange={setDockAlignment} 
                        />
                      } 
                    />
                    
                    <SettingRow 
                      label="Taskbar Icon Size" 
                      description="Scale taskbar icons and container padding." 
                      control={
                        <SegmentedControl 
                          options={[{id:'compact'}, {id:'normal'}, {id:'large'}]} 
                          value={dockSize} 
                          onChange={setDockSize} 
                        />
                      } 
                    />
                    
                    <SettingRow 
                      label="Auto-hide Taskbar" 
                      description="Automatically slide taskbar off-screen when not hovered." 
                      border={false}
                      control={<Toggle checked={dockAutoHide} onChange={setDockAutoHide} />} 
                    />
                  </Card>

                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2">
                      <Eye size={14} /> Style & Indicators
                    </h3>
                    
                    <SettingRow 
                      label="Taskbar Surface Style" 
                      description="Glassmorphism, solid graphite, or neon outline." 
                      control={
                        <select
                          value={dockStyle}
                          onChange={(e) => setDockStyle(e.target.value)}
                          className="bg-black/50 border border-white/10 hover:border-white/20 text-white rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer"
                        >
                          <option value="floating">Floating Glass</option>
                          <option value="solid">Solid Graphite</option>
                          <option value="neon">Neon Cyberpunk</option>
                          <option value="flush">Flush Bar</option>
                        </select>
                      } 
                    />
                    
                    <SettingRow 
                      label="Active App Indicator Style" 
                      description="Visual style for active window indicator dots." 
                      control={
                        <SegmentedControl 
                          options={[{id:'pill', label:'Cyan Pill'}, {id:'dot'}, {id:'line'}, {id:'pulse'}]} 
                          value={activeIndicatorStyle} 
                          onChange={setActiveIndicatorStyle} 
                        />
                      } 
                    />

                    <SettingRow 
                      label="Show Pinned Applications" 
                      description="Display pinned app launchers on taskbar." 
                      control={<Toggle checked={showPinnedApps} onChange={setShowPinnedApps} />} 
                    />
                    
                    <SettingRow 
                      label="Show Running Applications" 
                      description="Show active non-pinned applications on taskbar." 
                      border={false}
                      control={<Toggle checked={showRunningApps} onChange={setShowRunningApps} />} 
                    />
                  </Card>

                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                      <Bell size={14} /> System Tray & Clock
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        { label: 'Network Icon', checked: showSystemTrayNetwork, onChange: setShowSystemTrayNetwork },
                        { label: 'Notification Bell', checked: showSystemTrayNotifications, onChange: setShowSystemTrayNotifications },
                        { label: 'Live Clock', checked: showSystemTrayClock, onChange: setShowSystemTrayClock },
                        { label: 'Workspace Indicator', checked: showWorkspaceIndicator, onChange: setShowWorkspaceIndicator },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                          <span className="text-slate-300 text-[12px] font-medium">{item.label}</span>
                          <Toggle checked={item.checked} onChange={item.onChange} />
                        </div>
                      ))}
                    </div>
                    
                    <SettingRow 
                      label="Clock Format" 
                      description="12-hour AM/PM vs 24-hour time format." 
                      control={
                        <SegmentedControl 
                          options={[{id:'12h'}, {id:'24h'}]} 
                          value={clockFormat} 
                          onChange={setClockFormat} 
                        />
                      } 
                    />
                    
                    <SettingRow 
                      label="Show Live Seconds" 
                      description="Display seconds counter in live clock." 
                      border={false}
                      control={<Toggle checked={showClockSeconds} onChange={toggleShowClockSeconds} />} 
                    />
                  </Card>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {personalizationTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-[#00F0FF] mb-4">
                      Color Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'dark', name: 'Dark Graphite', icon: Moon },
                        { id: 'light', name: 'Clean Light', icon: Sun },
                        { id: 'system', name: 'System Auto', icon: Monitor },
                      ].map((mode) => {
                        const IconComp = mode.icon
                        const active = theme === mode.id
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setTheme(mode.id)}
                            className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 group ${
                              active
                                ? 'bg-gradient-to-b from-[#00F0FF]/20 to-transparent border-[#00F0FF]/50 text-white shadow-[0_4px_20px_rgba(0,240,255,0.15)] scale-[1.02]'
                                : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-slate-200'
                            }`}
                          >
                            <IconComp size={24} className={active ? 'text-[#00F0FF]' : 'group-hover:scale-110 transition-transform'} />
                            <span className="text-[13px] font-medium">{mode.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-emerald-400 mb-4">
                      Accent Color
                    </h3>
                    <div className="flex gap-4">
                      {[
                        { id: 'cyan', name: 'Electric Cyan', color: '#00F0FF' },
                        { id: 'indigo', name: 'Indigo Pulse', color: '#6366F1' },
                        { id: 'emerald', name: 'Emerald Cyber', color: '#10B981' },
                        { id: 'amber', name: 'Amber Glow', color: '#F59E0B' },
                      ].map((acc) => {
                        const active = accentColor === acc.id;
                        return (
                          <button
                            key={acc.id}
                            onClick={() => setAccentColor(acc.id)}
                            className={`flex-1 p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                              active
                                ? 'border-white/40 bg-white/10 text-white shadow-lg scale-[1.02]'
                                : 'border-white/5 bg-black/30 text-slate-400 hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-full shadow-inner transition-transform duration-300 ${active ? 'scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-black/50' : ''}`} style={{ backgroundColor: acc.color }} />
                            <span className="text-[11px] font-medium">{acc.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* WALLPAPERS TAB */}
              {personalizationTab === 'wallpapers' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-purple-400 mb-4">
                      Desktop Wallpapers
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      {[
                        { id: 'cosmic', name: 'Cosmic Eclipse', img: NOVA_WALLPAPER },
                        { id: 'aurora', name: 'Aurora Dark', img: AURORA_WALLPAPER },
                        { id: 'deep-space', name: 'Deep Space', img: DEEP_SPACE_WALLPAPER },
                        { id: 'minimal', name: 'Minimal Obsidian', img: OBSIDIAN_WALLPAPER },
                      ].map((wp) => {
                        const active = wallpaper === wp.id || (wallpaper === 'graphite' && wp.id === 'cosmic');
                        return (
                          <button
                            key={wp.id}
                            onClick={() => setWallpaper(wp.id)}
                            style={{
                              backgroundImage: `url(${wp.img})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            className={`h-40 rounded-2xl border p-4 flex flex-col justify-end transition-all duration-500 relative overflow-hidden group ${
                              active
                                ? 'border-[#00F0FF] ring-4 ring-[#00F0FF]/30 shadow-[0_8px_30px_rgba(0,240,255,0.2)] scale-[1.02]'
                                : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`absolute inset-0 transition-colors duration-500 ${active ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-black/50 group-hover:bg-black/30'}`} />
                            
                            <div className="relative z-10 flex items-center justify-between w-full">
                              <span className="font-bold text-white text-[14px] drop-shadow-lg tracking-wide">
                                {wp.name}
                              </span>
                              {active && (
                                <div className="w-6 h-6 rounded-full bg-[#00F0FF] flex items-center justify-center shadow-[0_0_15px_#00F0FF]">
                                  <Check size={14} className="text-black" />
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* THEME PRESETS TAB */}
              {personalizationTab === 'themes' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card>
                    <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-amber-400 mb-4">
                      Curated Theme Presets
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'obsidian', name: 'Obsidian Dark', desc: 'Dark graphite with Electric Cyan accent', color: '#00F0FF' },
                        { id: 'cyberpunk', name: 'Cyberpunk Aurora', desc: 'Neon Cyberpunk with Amber Glow', color: '#F59E0B' },
                        { id: 'solarized', name: 'Solarized Light', desc: 'Clean Light with Indigo Pulse', color: '#6366F1' },
                        { id: 'matrix', name: 'Emerald Matrix', desc: 'Deep Space with Emerald Cyber', color: '#10B981' },
                      ].map((preset) => {
                        const active = themePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setThemePreset(preset.id)}
                            className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all duration-300 group ${
                              active
                                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30 shadow-lg scale-[1.02]'
                                : 'bg-black/30 border-white/5 hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <span className={`font-bold text-[14px] ${active ? 'text-white' : 'text-slate-200'}`}>{preset.name}</span>
                              <span className={`w-4 h-4 rounded-full shadow-inner ${active ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-black/50' : ''}`} style={{ backgroundColor: preset.color }} />
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{preset.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeSection === 'workspaces' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <SectionTitle 
                title="Virtual Workspaces" 
                subtitle="Manage multiple desktop environments to organize your workflow." 
              />
              
              <Card className="space-y-4">
                <div className="space-y-3">
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className="flex items-center justify-between bg-black/40 border border-white/5 hover:border-white/15 rounded-xl p-3.5 transition-colors group"
                    >
                      {editingWsId === ws.id ? (
                        <input
                          type="text"
                          value={editingWsName}
                          onChange={(e) => setEditingWsName(e.target.value)}
                          onBlur={() => {
                            renameWorkspace(ws.id, editingWsName)
                            setEditingWsId(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              renameWorkspace(ws.id, editingWsName)
                              setEditingWsId(null)
                            }
                          }}
                          autoFocus
                          className="bg-black/80 border border-[#00F0FF] text-[13px] text-white rounded-lg px-3 py-1.5 w-1/2 outline-none shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className={`text-[14px] ${activeWorkspaceId === ws.id ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{ws.name}</span>
                          {activeWorkspaceId === ws.id && (
                            <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeWorkspaceId !== ws.id && (
                          <button
                            onClick={() => switchWorkspace(ws.id)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white rounded-lg transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingWsId(ws.id)
                            setEditingWsName(ws.name)
                          }}
                          className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            onClick={() => removeWorkspace(ws.id)}
                            className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                  <input
                    type="text"
                    placeholder="Create new workspace..."
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newWsName.trim()) {
                        addWorkspace(newWsName.trim())
                        setNewWsName('')
                      }
                    }}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  />
                  <button
                    onClick={() => {
                      if (newWsName.trim()) {
                        addWorkspace(newWsName.trim())
                        setNewWsName('')
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold text-[13px] rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                  >
                    <Plus size={16} />
                    <span>Create</span>
                  </button>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <SectionTitle 
                title="AI Assistant" 
                subtitle="Configure Jarvis, the intelligent core of NOVA WebOS, powered by Google Gemini." 
              />
              
              <Card>
                <div className="flex items-start gap-4 mb-6 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <Cpu size={24} className="text-[#00F0FF]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white mb-1">Gemini API Integration</h3>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      Jarvis utilizes the powerful Gemini Interactions API for advanced natural language understanding and real-time operating system function calling.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                    API Key Configuration
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your Gemini API Key (AIzaSy...)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl px-4 py-3 text-[13px] text-white placeholder-slate-600 outline-none transition-all shadow-inner"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] text-slate-500">Key is stored securely in local browser storage.</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] font-medium text-[#00F0FF] hover:text-white transition-colors flex items-center gap-1">
                      Get API Key <ChevronRight size={12} />
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <SectionTitle 
                title="System Info" 
                subtitle="Hardware environment and browser capability inspection." 
              />
              
              <div className="grid gap-6">
                <Card>
                  <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-[#00F0FF] mb-4">
                    Environment Diagnostics
                  </h3>
                  <div className="space-y-3 font-mono text-[12px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-slate-400">Viewport Dimensions</span>
                      <span className="text-white bg-white/10 px-2 py-0.5 rounded">{window.innerWidth} x {window.innerHeight}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-slate-400">Device Pixel Ratio</span>
                      <span className="text-white bg-white/10 px-2 py-0.5 rounded">{window.devicePixelRatio}x</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-slate-400">User Platform</span>
                      <span className="text-white bg-white/10 px-2 py-0.5 rounded">{navigator.platform}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">IndexedDB Storage</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        {storageEstimate ? `${storageEstimate.usageMB} MB / ${storageEstimate.quotaMB} MB` : 'Available'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-semibold text-white text-[11px] uppercase tracking-widest text-purple-400 mb-4">
                    Browser Capabilities Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Notifications API', cap: 'notifications' },
                      { name: 'Clipboard API', cap: 'clipboard' },
                      { name: 'File System Access API', cap: 'filesystem' },
                      { name: 'Fullscreen API', cap: 'fullscreen' },
                      { name: 'Service Worker / PWA', cap: 'serviceWorker' },
                    ].map((item) => {
                      const supported = capabilityCheck(item.cap)
                      return (
                        <div
                          key={item.name}
                          className="p-3.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-300 text-[12px]">{item.name}</span>
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${supported ? 'text-emerald-400 bg-emerald-400' : 'text-slate-600 bg-slate-600'}`} />
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 h-full flex flex-col items-center justify-center -mt-10">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-[#00F0FF] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
                <NovaLogo size={80} className="relative z-10 drop-shadow-2xl" />
              </div>
              
              <div className="text-center mt-8 space-y-2">
                <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase drop-shadow-lg">NOVA WebOS</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-purple-500/20 border border-white/10 backdrop-blur-md">
                  <p className="text-[11px] text-white font-bold tracking-widest">VERSION 1.0.0 • PRODUCTION KERNEL</p>
                </div>
                <p className="text-[13px] text-slate-400 mt-4 italic">"Your environment. Reimagined."</p>
              </div>

              <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left max-w-sm w-full shadow-2xl">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-widest border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                  <Layers size={14} className="text-[#00F0FF]" /> Technology Stack
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-slate-300 text-[12px] font-medium">
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00F0FF] rounded-full"/> React 19</div>
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-400 rounded-full"/> Vite 8</div>
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full"/> Tailwind CSS v4</div>
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-400 rounded-full"/> Zustand 5</div>
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-rose-400 rounded-full"/> IndexedDB</div>
                  <div className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full"/> Native APIs</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
