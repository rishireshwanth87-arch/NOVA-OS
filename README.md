# 🌌 NOVA-OS

> **A futuristic web operating system concept focused on simplicity, speed, and intelligent interaction.**

NOVA-OS combines a clean interface, intuitive navigation, seamless multitasking, and powerful system tools into one cohesive digital environment designed for modern users.

---

## ✨ Features

- **Desktop & Window Management**: Draggable, resizable, minimizable, and maximizable windows with smooth animations.
- **Dock & System Bar**: Fast application launcher, live system clock, battery status, and quick control panel.
- **Built-in Applications**:
  - **Gemini AI Assistant**: Integrated intelligent assistant powered by Google GenAI.
  - **Settings App**: Customizable themes, wallpapers, display settings, and system preferences.
  - **File Explorer**: Browse and manage virtual files stored locally via IndexedDB.
  - **Terminal**: Interactive command-line interface.
  - **Browser**: Built-in web preview and navigation.
  - **Calculator & Utilities**: Essential productivity utilities.
- **Customization**: Multiple dynamic wallpapers (Obsidian, Cosmic, Aurora, Deep Space), dark/light modes, and accessibility controls.
- **Persistent Storage**: IndexedDB-backed local persistence for apps, files, and user preferences.

---

## 🛠️ Tech Stack

- **Core**: React 19, JavaScript (ES Modules)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **State Management**: Zustand
- **Build Tool**: Vite
- **AI Integration**: `@google/genai` (Google Gemini SDK)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/rishireshwanth87-arch/NOVA-OS.git
cd NOVA-OS

# Install dependencies
npm --prefix nova install

# Run the development server
npm run dev
```

Alternatively, you can navigate directly into the `nova` directory:

```bash
cd nova
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

---

## 📄 License

MIT License. Designed and built with ❤️ by [rishireshwanth87-arch](https://github.com/rishireshwanth87-arch).
