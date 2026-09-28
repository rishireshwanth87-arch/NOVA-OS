import React, { useState, useEffect } from 'react'
import { Delete, RotateCcw, History } from 'lucide-react'

export function CalculatorApp() {
  const [display, setDisplay] = useState('0')
  const [prevValue, setPrevValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [overwrite, setOverwrite] = useState(false)
  const [calcHistory, setCalcHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const handleDigit = (digit) => {
    if (display === '0' || overwrite) {
      setDisplay(digit)
      setOverwrite(false)
    } else {
      setDisplay((prev) => prev + digit)
    }
  }

  const handleDecimal = () => {
    if (overwrite) {
      setDisplay('0.')
      setOverwrite(false)
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPrevValue(null)
    setOperation(null)
    setOverwrite(false)
  }

  const handleBackspace = () => {
    if (overwrite) return
    if (display.length === 1 || display === 'Error') {
      setDisplay('0')
    } else {
      setDisplay((prev) => prev.slice(0, -1))
    }
  }

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error') return
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))
  }

  const handlePercentage = () => {
    const val = parseFloat(display)
    if (isNaN(val)) return
    const result = (val / 100).toString()
    setDisplay(result)
  }

  const compute = (a, b, op) => {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
      case '*':
        return a * b
      case '÷':
      case '/':
        if (b === 0) return 'Error'
        return a / b
      default:
        return b
    }
  }

  const handleOperator = (op) => {
    const current = parseFloat(display)
    if (isNaN(current)) return

    if (prevValue !== null && operation && !overwrite) {
      const result = compute(prevValue, current, operation)
      if (result === 'Error') {
        setDisplay('Error')
        setPrevValue(null)
        setOperation(null)
        return
      }
      setDisplay(result.toString())
      setPrevValue(result)
    } else {
      setPrevValue(current)
    }

    setOperation(op)
    setOverwrite(true)
  }

  const handleEquals = () => {
    if (prevValue === null || !operation) return
    const current = parseFloat(display)
    if (isNaN(current)) return

    const result = compute(prevValue, current, operation)
    const resultStr = result === 'Error' ? 'Error' : result.toString()

    // Add to history
    setCalcHistory((prev) => [
      { expr: `${prevValue} ${operation} ${current}`, result: resultStr },
      ...prev,
    ])

    setDisplay(resultStr)
    setPrevValue(null)
    setOperation(null)
    setOverwrite(true)
  }

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === '.') handleDecimal()
      else if (e.key === '+') handleOperator('+')
      else if (e.key === '-') handleOperator('-')
      else if (e.key === '*') handleOperator('×')
      else if (e.key === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (e.key === 'Backspace') handleBackspace()
      else if (e.key === 'Escape') handleClear()
      else if (e.key === '%') handlePercentage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, prevValue, operation, overwrite])

  return (
    <div className="h-full w-full bg-[#0E0F17] text-slate-100 flex flex-col p-4 select-none font-sans justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          Standard Calculator
        </span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1 rounded hover:bg-white/10 ${showHistory ? 'text-[#00F0FF]' : 'text-slate-400'}`}
          title="Toggle History"
        >
          <History size={14} />
        </button>
      </div>

      {showHistory ? (
        /* History Panel */
        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 overflow-auto space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-1 font-semibold text-[11px]">
            <span>Calculation History</span>
            <button onClick={() => setCalcHistory([])} className="hover:text-red-400 text-[10px]">
              Clear
            </button>
          </div>
          {calcHistory.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No history yet</p>
          ) : (
            calcHistory.map((item, idx) => (
              <div key={idx} className="flex justify-between font-mono text-[11px] py-1 border-b border-white/5">
                <span className="text-slate-400">{item.expr} =</span>
                <span className="text-[#00F0FF] font-semibold">{item.result}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calculator Display */
        <div className="flex-1 flex flex-col justify-end bg-black/40 border border-white/10 rounded-xl p-4 mb-3 text-right">
          <div className="text-xs text-slate-400 h-5 font-mono">
            {prevValue !== null && `${prevValue} ${operation || ''}`}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight truncate text-[#00F0FF]">
            {display}
          </div>
        </div>
      )}

      {/* Button Keypad */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleClear}
          className="p-3 bg-red-500/20 text-red-300 rounded-xl font-bold hover:bg-red-500/30 border border-red-500/30 active:scale-95 transition-all"
        >
          AC
        </button>
        <button
          onClick={handleToggleSign}
          className="p-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          ±
        </button>
        <button
          onClick={handlePercentage}
          className="p-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="p-3 bg-[#00F0FF]/15 text-[#00F0FF] rounded-xl font-bold hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 active:scale-95 transition-all"
        >
          ÷
        </button>

        <button
          onClick={() => handleDigit('7')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="p-3 bg-[#00F0FF]/15 text-[#00F0FF] rounded-xl font-bold hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 active:scale-95 transition-all"
        >
          ×
        </button>

        <button
          onClick={() => handleDigit('4')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="p-3 bg-[#00F0FF]/15 text-[#00F0FF] rounded-xl font-bold hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 active:scale-95 transition-all"
        >
          -
        </button>

        <button
          onClick={() => handleDigit('1')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="p-3 bg-[#00F0FF]/15 text-[#00F0FF] rounded-xl font-bold hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 active:scale-95 transition-all"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="p-3 col-span-2 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="p-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="p-3 bg-[#00F0FF] text-black rounded-xl font-bold hover:bg-[#33F3FF] shadow-lg active:scale-95 transition-all"
        >
          =
        </button>
      </div>
    </div>
  )
}
