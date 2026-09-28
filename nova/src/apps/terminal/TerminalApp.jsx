import React, { useState, useEffect, useRef } from 'react'
import {
  listDirectory,
  createFolder,
  createFile,
  getItemByPath,
  getItemById,
  writeFile,
  moveToTrash,
  moveItem,
  copyItem,
} from '../../storage/filesystem'
import { useSettingsStore } from '../../stores/settingsStore'
import { useOSStore } from '../../stores/osStore'
import { useJarvisStore } from '../../stores/jarvisStore'
import { jarvisService } from '../../services/jarvisService'

export function TerminalApp({ window: win }) {
  const initialPath = win?.params?.initialDir || '/Desktop'
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [currentFolderId, setCurrentFolderId] = useState(
    initialPath === '/' ? 'folder-root' : 'folder-desktop'
  )
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [output, setOutput] = useState([
    { text: 'NOVA WebOS Terminal Shell v1.0.0 (Eagle Edition)', type: 'system' },
    { text: 'Type "help" to view commands, or "python" for Python REPL.', type: 'info' },
  ])
  const [inputVal, setInputVal] = useState('')
  const [isPythonMode, setIsPythonMode] = useState(false)
  const pythonScopeRef = useRef({})
  const terminalEndRef = useRef(null)
  const theme = useSettingsStore((s) => s.theme)
  const isOnline = useOSStore((s) => s.isOnline)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  // Resolve path helper
  const resolvePathToItem = async (targetPath) => {
    let fullPath = targetPath
    if (!targetPath.startsWith('/')) {
      fullPath = currentPath === '/' ? `/${targetPath}` : `${currentPath}/${targetPath}`
    }
    if (targetPath === '~') fullPath = '/Desktop'
    return await getItemByPath(fullPath)
  }

  // Execute terminal command
  const handleCommand = async (cmdString) => {
    const trimmed = cmdString.trim()
    if (!trimmed) return

    const newHistory = [...history, trimmed]
    setHistory(newHistory)
    setHistoryIndex(-1)

    // Python Mode Execution
    if (isPythonMode) {
      const promptText = `>>> ${trimmed}`
      const newLogs = [{ text: promptText, type: 'prompt' }]

      if (trimmed === 'exit()' || trimmed === 'quit()' || trimmed === 'exit') {
        setIsPythonMode(false)
        newLogs.push({ text: 'Exiting Python 3.11 interactive session.', type: 'info' })
        setOutput((prev) => [...prev, ...newLogs])
        return
      }

      try {
        let result
        const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/)
        if (assignMatch) {
          const varName = assignMatch[1]
          const expr = assignMatch[2]
          const scope = pythonScopeRef.current
          const scopeKeys = Object.keys(scope)
          const scopeVals = Object.values(scope)
          const fn = new Function(...scopeKeys, `return (${expr})`)
          const val = fn(...scopeVals)
          scope[varName] = val
        } else if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const inner = trimmed.slice(6, -1)
          const scope = pythonScopeRef.current
          const scopeKeys = Object.keys(scope)
          const scopeVals = Object.values(scope)
          const fn = new Function(...scopeKeys, `return (${inner})`)
          result = fn(...scopeVals)
          newLogs.push({ text: String(result), type: 'response' })
        } else {
          const scope = pythonScopeRef.current
          const scopeKeys = Object.keys(scope)
          const scopeVals = Object.values(scope)
          const fn = new Function(...scopeKeys, `return (${trimmed})`)
          result = fn(...scopeVals)
          if (result !== undefined) {
            newLogs.push({ text: String(result), type: 'response' })
          }
        }
      } catch (err) {
        newLogs.push({ text: `Traceback (most recent call last):\n  Error: ${err.message}`, type: 'error' })
      }

      setOutput((prev) => [...prev, ...newLogs])
      return
    }

    const promptText = `nova@nova ${currentPath} $ ${trimmed}`
    const newLogs = [{ text: promptText, type: 'prompt' }]

    const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || []
    const cmd = parts[0]?.toLowerCase()
    const args = parts.slice(1).map((a) => a.replace(/^"|"$/g, ''))

    switch (cmd) {
      case 'help':
        newLogs.push({
          text: `Available Commands:
  help       - List terminal commands
  python/py  - Enter in-browser Python REPL mode
  jarvis <q> - Ask or command JARVIS voice assistant
  lock       - Lock NOVA screen session
  weather    - Check local weather conditions
  theme <t>  - Change theme (dark / light)
  clear      - Clear terminal screen
  pwd        - Print working directory
  ls [dir]   - List files and directories
  cd <dir>   - Change working directory
  mkdir <d>  - Create a new directory
  touch <f>  - Create a new text file
  cat <file> - Print file contents
  echo <txt> - Output text
  rm <item>  - Remove file or directory
  mv <s> <d> - Move item
  cp <s> <d> - Copy item
  tree       - Display directory tree
  neofetch   - Display NOVA Eagle OS info
  date       - Show current date & time
  whoami     - Show logged in user
  history    - Display command history`,
          type: 'response',
        })
        break

      case 'clear':
        setOutput([])
        return

      case 'pwd':
        newLogs.push({ text: currentPath, type: 'response' })
        break

      case 'whoami':
        newLogs.push({ text: 'nova', type: 'response' })
        break

      case 'date':
        newLogs.push({ text: new Date().toString(), type: 'response' })
        break

      case 'ls': {
        const targetDir = args[0] ? await resolvePathToItem(args[0]) : await getItemById(currentFolderId)
        if (!targetDir || targetDir.type !== 'folder') {
          newLogs.push({ text: `ls: cannot access '${args[0]}': No such directory`, type: 'error' })
        } else {
          const contents = await listDirectory(targetDir.id)
          if (contents.length === 0) {
            newLogs.push({ text: '(empty)', type: 'info' })
          } else {
            const listStr = contents
              .map((c) => (c.type === 'folder' ? `[${c.name}]` : c.name))
              .join('   ')
            newLogs.push({ text: listStr, type: 'response' })
          }
        }
        break
      }

      case 'cd': {
        const targetPathArg = args[0] || '~'
        if (targetPathArg === '..') {
          if (currentPath !== '/') {
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/'
            const parentItem = (await getItemByPath(parentPath)) || (await getItemByPath('/'))
            if (parentItem) {
              setCurrentFolderId(parentItem.id)
              setCurrentPath(parentItem.path)
            }
          }
        } else {
          const targetItem = await resolvePathToItem(targetPathArg)
          if (targetItem && targetItem.type === 'folder') {
            setCurrentFolderId(targetItem.id)
            setCurrentPath(targetItem.path)
          } else {
            newLogs.push({ text: `cd: no such file or directory: ${targetPathArg}`, type: 'error' })
          }
        }
        break
      }

      case 'mkdir': {
        if (!args[0]) {
          newLogs.push({ text: 'mkdir: missing operand', type: 'error' })
        } else {
          await createFolder(currentFolderId, args[0])
          newLogs.push({ text: `Created directory '${args[0]}'`, type: 'success' })
        }
        break
      }

      case 'touch': {
        if (!args[0]) {
          newLogs.push({ text: 'touch: missing file operand', type: 'error' })
        } else {
          await createFile(currentFolderId, args[0], '')
          newLogs.push({ text: `Created file '${args[0]}'`, type: 'success' })
        }
        break
      }

      case 'cat': {
        if (!args[0]) {
          newLogs.push({ text: 'cat: missing file operand', type: 'error' })
        } else {
          const fileItem = await resolvePathToItem(args[0])
          if (!fileItem || fileItem.type !== 'file') {
            newLogs.push({ text: `cat: ${args[0]}: No such file`, type: 'error' })
          } else {
            newLogs.push({ text: fileItem.content || '(file is empty)', type: 'response' })
          }
        }
        break
      }

      case 'echo': {
        const textToEcho = args.join(' ')
        newLogs.push({ text: textToEcho, type: 'response' })
        break
      }

      case 'rm': {
        if (!args[0]) {
          newLogs.push({ text: 'rm: missing operand', type: 'error' })
        } else {
          const itemToRemove = await resolvePathToItem(args[0])
          if (!itemToRemove) {
            newLogs.push({ text: `rm: cannot remove '${args[0]}': No such file or directory`, type: 'error' })
          } else {
            await moveToTrash(itemToRemove.id)
            newLogs.push({ text: `Removed '${args[0]}'`, type: 'success' })
          }
        }
        break
      }

      case 'tree': {
        const root = await getItemById(currentFolderId)
        const contents = await listDirectory(currentFolderId)
        let treeStr = `${root.name}\n`
        contents.forEach((c, idx) => {
          const isLast = idx === contents.length - 1
          treeStr += `${isLast ? '└── ' : '├── '}${c.name}\n`
        })
        newLogs.push({ text: treeStr, type: 'response' })
        break
      }

      case 'python':
      case 'py': {
        setIsPythonMode(true)
        newLogs.push({
          text: `Python 3.11.2 (NOVA In-Browser Virtual Runtime, Sep 2026)
Type "help", "copyright", "credits" or "license" for more information.
Type "exit()" or "quit()" to leave Python REPL.`,
          type: 'info',
        })
        break
      }

      case 'jarvis': {
        const query = args.join(' ')
        if (!query) {
          useJarvisStore.getState().openJarvis()
          newLogs.push({ text: 'JARVIS interface activated. How may I assist you, sir?', type: 'response' })
        } else {
          jarvisService.handleCommand(query)
          newLogs.push({ text: `[JARVIS]: Directive received: "${query}"`, type: 'response' })
        }
        break
      }

      case 'lock': {
        useOSStore.getState().lockSession()
        newLogs.push({ text: 'NOVA session locked securely.', type: 'response' })
        break
      }

      case 'theme': {
        const t = args[0]?.toLowerCase()
        if (t === 'dark' || t === 'light') {
          useSettingsStore.getState().setTheme(t)
          newLogs.push({ text: `Theme switched to ${t}.`, type: 'response' })
        } else {
          newLogs.push({ text: 'Usage: theme <dark|light>', type: 'info' })
        }
        break
      }

      case 'weather': {
        newLogs.push({
          text: `🌤️ Location: Tokyo (Atmospheric Sensors)
Condition: Clear Skies
Temperature: 22°C (71.6°F)
Humidity: 48% • Barometer: 1014 hPa`,
          type: 'response',
        })
        break
      }

      case 'neofetch': {
        const ua = navigator.userAgent
        const browserName = ua.includes('Chrome')
          ? 'Chromium / Chrome'
          : ua.includes('Firefox')
          ? 'Firefox'
          : ua.includes('Safari')
          ? 'Safari'
          : 'Modern Browser'

        newLogs.push({
          text: `
      _/\\_          NOVA WebOS v1.0.0
     / V  \\         ------------------
   /¯\\____/¯\\       Emblem: Crimson Eagle
    \\  /\\  /        OS: NOVA Operating Environment
     \\/  \\/         Assistant: JARVIS Active
                    Browser: ${browserName}
                    Platform: ${navigator.platform}
                    Viewport: ${window.innerWidth}x${window.innerHeight}
                    Storage: IndexedDB Persistence
                    Network: ${isOnline ? 'Online' : 'Offline'}
                    Theme: ${theme.toUpperCase()}`,
          type: 'response',
        })
        break
      }

      case 'history': {
        const histStr = newHistory.map((h, i) => ` ${i + 1}  ${h}`).join('\n')
        newLogs.push({ text: histStr || 'No history available.', type: 'response' })
        break
      }

      default:
        newLogs.push({
          text: `command not found: ${cmd}. Type "help" for command list.`,
          type: 'error',
        })
    }

    setOutput((prev) => [...prev, ...newLogs])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal)
      setInputVal('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const nextIdx = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(nextIdx)
        setInputVal(history[history.length - 1 - nextIdx] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1
        setHistoryIndex(nextIdx)
        setInputVal(history[history.length - 1 - nextIdx] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputVal('')
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setOutput([])
    }
  }

  return (
    <div
      onClick={() => document.getElementById('terminal-input')?.focus()}
      className="h-full w-full bg-[#0A0B10] text-[#00F0FF] p-4 font-mono text-xs overflow-auto flex flex-col select-text"
    >
      <div className="flex-1 space-y-1.5">
        {output.map((out, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap leading-relaxed ${
              out.type === 'prompt'
                ? 'text-white font-semibold'
                : out.type === 'error'
                ? 'text-red-400'
                : out.type === 'success'
                ? 'text-emerald-400'
                : out.type === 'system'
                ? 'text-[#00F0FF] font-bold'
                : 'text-slate-300'
            }`}
          >
            {out.text}
          </div>
        ))}

        {/* Command Line Prompt */}
        <div className="flex items-center gap-2 pt-1 text-white">
          <span className={`${isPythonMode ? 'text-amber-400' : 'text-[#00F0FF]'} font-semibold font-mono`}>
            {isPythonMode ? '>>>' : `nova@nova ${currentPath} $`}
          </span>
          <input
            id="terminal-input"
            type="text"
            placeholder={isPythonMode ? "Python expression (e.g. 2**10 or x = 5), or exit()" : ""}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
