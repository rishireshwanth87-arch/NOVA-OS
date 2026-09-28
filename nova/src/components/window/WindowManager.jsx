import React from 'react'
import { useWindowStore } from '../../stores/windowStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { Window } from './Window'

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)

  const workspaceWindows = windows

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {workspaceWindows.map((win) => (
        <div key={win.id} className="pointer-events-auto">
          <Window window={win} />
        </div>
      ))}
    </div>
  )
}
