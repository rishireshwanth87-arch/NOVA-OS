import { useJarvisStore } from '../stores/jarvisStore'
import { useOSStore } from '../stores/osStore'
import { useWindowStore } from '../stores/windowStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useMusicStore } from '../stores/musicStore'
import { useAIStore } from '../stores/aiStore'
import { appRegistry } from '../core/app-registry/appRegistry'
import { GoogleGenAI } from '@google/genai'

// Function definitions for Gemini Tools
const systemFunctions = {
  openApp: ({ appId }) => {
    const apps = appRegistry.getAll()
    const found = apps.find(a => a.id.toLowerCase().includes(appId.toLowerCase()) || a.name.toLowerCase().includes(appId.toLowerCase()))
    if (found) {
      useWindowStore.getState().openWindow(found)
      return { status: 'success', message: `Opened app ${found.name}` }
    }
    return { status: 'error', message: `App ${appId} not found` }
  },
  lockScreen: () => {
    useOSStore.getState().lockSession()
    return { status: 'success', message: 'Screen locked' }
  },
  playMusic: () => {
    useMusicStore.getState().play()
    const current = useMusicStore.getState().currentTrack()
    return { status: 'success', message: `Resumed music. Playing ${current.title} by ${current.artist}` }
  },
  pauseMusic: () => {
    useMusicStore.getState().pause()
    return { status: 'success', message: 'Music paused' }
  },
  nextTrack: () => {
    useMusicStore.getState().nextTrack()
    const current = useMusicStore.getState().currentTrack()
    return { status: 'success', message: `Skipped to next track. Now playing ${current.title}` }
  },
  setTheme: ({ mode }) => {
    if (mode === 'dark' || mode === 'light') {
      useSettingsStore.getState().setTheme(mode)
      return { status: 'success', message: `Theme set to ${mode}` }
    }
    return { status: 'error', message: 'Invalid theme mode. Must be dark or light' }
  },
  getSystemStatus: () => {
    return { status: 'nominal', latency: '2ms', memory: 'Optimal', message: 'All NOVA subsystems operating within nominal parameters.' }
  },
  getTimeAndDate: () => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      date: now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }
}

const geminiTools = [{
  functionDeclarations: [
    {
      name: 'openApp',
      description: 'Opens a system application by its name or ID (e.g. browser, calculator, music, terminal, settings)',
      parameters: {
        type: 'OBJECT',
        properties: { appId: { type: 'STRING', description: 'The name or id of the app' } },
        required: ['appId']
      }
    },
    {
      name: 'lockScreen',
      description: 'Locks the computer screen/session'
    },
    {
      name: 'playMusic',
      description: 'Resumes or starts playing music'
    },
    {
      name: 'pauseMusic',
      description: 'Pauses the currently playing music'
    },
    {
      name: 'nextTrack',
      description: 'Skips to the next music track'
    },
    {
      name: 'setTheme',
      description: 'Sets the visual theme mode of the operating system',
      parameters: {
        type: 'OBJECT',
        properties: { mode: { type: 'STRING', description: "Either 'dark' or 'light'" } },
        required: ['mode']
      }
    },
    {
      name: 'getSystemStatus',
      description: 'Gets the current system health and status diagnostics'
    },
    {
      name: 'getTimeAndDate',
      description: 'Gets the current local time and date'
    }
  ]
}]

class JarvisService {
  constructor() {
    this.recognition = null
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null
    this.preferredVoice = null
    this.interactionId = null
    this.initSpeech()
  }

  initSpeech() {
    if (typeof window === 'undefined') return

    const updateVoices = () => {
      if (!this.synthesis) return
      const voices = this.synthesis.getVoices()
      this.preferredVoice =
        voices.find((v) => v.name.includes('Google UK English Male') || v.name.includes('George') || v.name.includes('Oliver')) ||
        voices.find((v) => v.lang.startsWith('en-GB')) ||
        voices.find((v) => v.name.includes('Daniel') || v.name.includes('Male')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0]
    }

    if (this.synthesis) {
      updateVoices()
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = updateVoices
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'

        this.recognition.onstart = () => {
          useJarvisStore.getState().setIsListening(true)
        }

        this.recognition.onresult = (event) => {
          const current = event.resultIndex
          const text = event.results[current][0].transcript
          useJarvisStore.getState().setTranscript(text)

          if (event.results[current].isFinal) {
            this.handleCommand(text)
          }
        }

        this.recognition.onerror = (event) => {
          console.warn('Jarvis Speech Recognition Error:', event.error)
          useJarvisStore.getState().setIsListening(false)
        }

        this.recognition.onend = () => {
          useJarvisStore.getState().setIsListening(false)
          if (useJarvisStore.getState().isAutomatedWakeWord) {
            setTimeout(() => {
              try {
                this.recognition.start()
              } catch (e) {}
            }, 500)
          }
        }
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e)
      }
    }
  }

  startListening() {
    if (this.recognition) {
      try {
        this.recognition.start()
      } catch (e) {}
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (e) {}
    }
    useJarvisStore.getState().setIsListening(false)
  }

  speak(text) {
    if (!this.synthesis) return

    this.synthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice
    }
    utterance.pitch = 0.9
    utterance.rate = 1.05

    utterance.onstart = () => useJarvisStore.getState().setIsSpeaking(true)
    utterance.onend = () => useJarvisStore.getState().setIsSpeaking(false)
    utterance.onerror = () => useJarvisStore.getState().setIsSpeaking(false)

    this.synthesis.speak(utterance)
  }

  async handleCommand(query) {
    const q = query.trim()
    if (!q) return

    useJarvisStore.getState().addUserQuery(q)
    useJarvisStore.getState().setIsThinking(true)

    const apiKey = useAIStore.getState().geminiApiKey

    if (!apiKey) {
      const reply = "I'm sorry sir, but my AI core is offline. Please configure my Gemini API Key in the Settings app."
      useJarvisStore.getState().setResponse(reply)
      this.speak(reply)
      useJarvisStore.getState().setIsThinking(false)
      return
    }

    try {
      const client = new GoogleGenAI({ apiKey })

      const requestOptions = {
        model: 'gemini-3.6-flash',
        input: q,
        system_instruction: "You are JARVIS, a highly advanced, slightly dry and witty AI assistant operating inside NOVA WebOS. You act like Tony Stark's JARVIS. Keep your responses crisp, concise, and professional. Always use tools when appropriate to fulfill the user's request. NEVER output markdown formatting in your responses, as they will be spoken aloud via text-to-speech.",
        tools: geminiTools,
      }

      if (this.interactionId) {
        requestOptions.previous_interaction_id = this.interactionId
      }

      let interaction = await client.interactions.create(requestOptions)
      
      // Handle tool calls in a loop
      while (true) {
        let hasFunctionCall = false
        const functionResults = []

        for (const step of interaction.steps) {
           if (step.type === 'function_call') {
             hasFunctionCall = true
             const fnName = step.name
             const fnArgs = step.arguments || {}
             
             let fnResult
             if (systemFunctions[fnName]) {
                try {
                    fnResult = systemFunctions[fnName](fnArgs)
                } catch(e) {
                    fnResult = { error: e.message }
                }
             } else {
                fnResult = { error: `Function ${fnName} not found` }
             }

             functionResults.push({
                 type: 'function_result',
                 name: fnName,
                 call_id: step.id,
                 result: fnResult
             })
           }
        }

        if (hasFunctionCall) {
            interaction = await client.interactions.create({
                model: 'gemini-3.6-flash',
                input: functionResults,
                previous_interaction_id: interaction.id,
                system_instruction: requestOptions.system_instruction,
                tools: geminiTools,
            })
        } else {
            break
        }
      }

      this.interactionId = interaction.id
      let finalResponse = interaction.output_text || "Task complete, sir."
      
      useJarvisStore.getState().setResponse(finalResponse)
      this.speak(finalResponse)
      
    } catch (err) {
      console.error("Gemini API Error:", err)
      const reply = "I encountered an error: " + err.message
      useJarvisStore.getState().setResponse(reply)
      this.speak(reply)
    } finally {
      useJarvisStore.getState().setIsThinking(false)
    }
  }
}

export const jarvisService = new JarvisService()
