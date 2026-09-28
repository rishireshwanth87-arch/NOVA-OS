import { FilesApp } from '../../apps/files/FilesApp'
import { TerminalApp } from '../../apps/terminal/TerminalApp'
import { NotesApp } from '../../apps/notes/NotesApp'
import { CalculatorApp } from '../../apps/calculator/CalculatorApp'
import { CalendarApp } from '../../apps/calendar/CalendarApp'
import { SettingsApp } from '../../apps/settings/SettingsApp'
import { SystemMonitorApp } from '../../apps/system-monitor/SystemMonitorApp'
import { AsterApp } from '../../apps/aster/Aster'
import { CameraApp } from '../../apps/camera/CameraApp'
import { GalleryApp } from '../../apps/gallery/GalleryApp'
import { MusicPlayerApp } from '../../apps/music/MusicPlayerApp'
import { StoreApp } from '../../apps/store/StoreApp'
import { StudioApp } from '../../apps/studio/StudioApp'
import { MapsApp } from '../../apps/maps/MapsApp'

export const INITIAL_APPS = [
  {
    id: 'aster',
    name: 'Browser',
    iconName: 'Compass',
    category: 'Internet',
    singleton: true,
    defaultWidth: 960,
    defaultHeight: 620,
    minWidth: 540,
    minHeight: 380,
    description: 'NOVA Web Browser',
    component: AsterApp,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    iconName: 'Calculator',
    category: 'Utilities',
    singleton: true,
    defaultWidth: 320,
    defaultHeight: 460,
    minWidth: 280,
    minHeight: 400,
    description: 'Precision Standard Calculator',
    component: CalculatorApp,
  },
  {
    id: 'camera',
    name: 'Camera',
    iconName: 'Camera',
    category: 'Media',
    singleton: true,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 440,
    minHeight: 360,
    description: 'Photo Booth & Camera Filters',
    component: CameraApp,
  },
  {
    id: 'files',
    name: 'Files',
    iconName: 'Folder',
    category: 'System',
    singleton: true,
    defaultWidth: 860,
    defaultHeight: 540,
    minWidth: 480,
    minHeight: 320,
    description: 'Virtual File System Manager',
    component: FilesApp,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    iconName: 'Image',
    category: 'Creativity',
    singleton: true,
    defaultWidth: 800,
    defaultHeight: 540,
    minWidth: 480,
    minHeight: 360,
    description: 'Desktop Media & Wallpaper Gallery',
    component: GalleryApp,
  },
  {
    id: 'music',
    name: 'Musicplr',
    iconName: 'Music',
    category: 'Entertainment',
    singleton: true,
    defaultWidth: 420,
    defaultHeight: 520,
    minWidth: 340,
    minHeight: 440,
    description: 'Ambient Audio Player & Synthesizer',
    component: MusicPlayerApp,
  },
  {
    id: 'settings',
    name: 'Settings',
    iconName: 'Settings',
    category: 'System',
    singleton: true,
    defaultWidth: 800,
    defaultHeight: 560,
    minWidth: 500,
    minHeight: 380,
    description: 'OS Preferences & Personalization',
    component: SettingsApp,
  },
  {
    id: 'store',
    name: 'Store',
    iconName: 'ShoppingBag',
    category: 'Ecosystem',
    singleton: true,
    defaultWidth: 860,
    defaultHeight: 580,
    minWidth: 540,
    minHeight: 400,
    description: 'NOVA App & Extension Store',
    component: StoreApp,
  },
  {
    id: 'studio',
    name: 'Studio',
    iconName: 'Code',
    category: 'Development',
    singleton: true,
    defaultWidth: 840,
    defaultHeight: 560,
    minWidth: 500,
    minHeight: 380,
    description: 'Code Studio & Interactive Sandbox',
    component: StudioApp,
  },
  {
    id: 'notes',
    name: 'Text',
    iconName: 'FileText',
    category: 'Productivity',
    singleton: true,
    defaultWidth: 740,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    description: 'Quick Notes & Scratchpad',
    component: NotesApp,
  },
  {
    id: 'calendar',
    name: 'Time',
    iconName: 'Calendar',
    category: 'Productivity',
    singleton: true,
    defaultWidth: 880,
    defaultHeight: 560,
    minWidth: 500,
    minHeight: 360,
    description: 'Integrated Schedule & Event Manager',
    component: CalendarApp,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    iconName: 'Terminal',
    category: 'System',
    singleton: true,
    defaultWidth: 760,
    defaultHeight: 460,
    minWidth: 420,
    minHeight: 280,
    description: 'NOVA Command Line Shell',
    component: TerminalApp,
  },
  {
    id: 'system-monitor',
    name: 'System Monitor',
    iconName: 'Activity',
    category: 'System',
    singleton: true,
    defaultWidth: 840,
    defaultHeight: 540,
    minWidth: 500,
    minHeight: 360,
    description: 'System Diagnostics, Telemetry & Storage Backup',
    component: SystemMonitorApp,
  },
  {
    id: 'maps',
    name: 'Maps',
    iconName: 'Map',
    category: 'Navigation',
    singleton: true,
    defaultWidth: 860,
    defaultHeight: 540,
    minWidth: 480,
    minHeight: 360,
    description: 'Global Maps & Navigation',
    component: MapsApp,
  },
]

class AppRegistry {
  constructor() {
    this.apps = new Map()
    INITIAL_APPS.forEach((app) => this.register(app))
  }

  register(app) {
    if (!app.id || !app.name) {
      throw new Error('Application registration requires valid id and name')
    }
    this.apps.set(app.id, app)
  }

  unregister(appId) {
    this.apps.delete(appId)
  }

  get(appId) {
    return this.apps.get(appId)
  }

  getAll() {
    return Array.from(this.apps.values())
  }
}

export const appRegistry = new AppRegistry()
