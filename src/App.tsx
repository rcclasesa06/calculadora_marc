import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Delete, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal, 
  RotateCcw,
  Percent,
  History,
  Sun,
  Moon,
  Sparkles,
  Trash2
} from 'lucide-react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | null;
type Theme = 'light' | 'dark' | 'rainbow';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
}

export default function App() {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [hue, setHue] = useState(0);

  // Rainbow effect logic
  useEffect(() => {
    let interval: number;
    if (theme === 'rainbow') {
      interval = window.setInterval(() => {
        setHue((prev) => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [theme]);

  const clear = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
    setOverwrite(false);
  };

  const deleteDigit = () => {
    if (overwrite) {
      setCurrentValue('0');
      setOverwrite(false);
      return;
    }
    if (currentValue === '0') return;
    if (currentValue.length === 1) {
      setCurrentValue('0');
      return;
    }
    setCurrentValue(currentValue.slice(0, -1));
  };

  const addDigit = (digit: string) => {
    if (digit === '.' && currentValue.includes('.')) return;
    if (overwrite) {
      setCurrentValue(digit === '.' ? '0.' : digit);
      setOverwrite(false);
    } else {
      setCurrentValue(currentValue === '0' && digit !== '.' ? digit : currentValue + digit);
    }
  };

  const chooseOperation = (op: Operation) => {
    if (currentValue === '0' && previousValue === null) return;
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
      setOperation(op);
      setOverwrite(true);
    } else {
      const result = compute();
      setPreviousValue(result);
      setOperation(op);
      setCurrentValue(result);
      setOverwrite(true);
    }
  };

  const compute = (): string => {
    const prev = parseFloat(previousValue || '0');
    const current = parseFloat(currentValue);
    if (isNaN(prev) || isNaN(current)) return '';
    
    let computation = 0;
    switch (operation) {
      case 'add':
        computation = prev + current;
        break;
      case 'subtract':
        computation = prev - current;
        break;
      case 'multiply':
        computation = prev * current;
        break;
      case 'divide':
        computation = current === 0 ? 0 : prev / current;
        break;
      default:
        return currentValue;
    }
    
    // Format to avoid long decimal trails but keep precision
    return Number(computation.toFixed(8)).toString();
  };

  const equals = () => {
    if (operation === null || previousValue === null) return;
    const result = compute();
    
    // Add to history
    const opSymbols: Record<string, string> = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
    const expression = `${previousValue} ${opSymbols[operation || '']} ${currentValue}`;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));

    setCurrentValue(result);
    setPreviousValue(null);
    setOperation(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    setCurrentValue((prev) => (parseFloat(prev) * -1).toString());
  };

  const applyPercent = () => {
    setCurrentValue((prev) => (parseFloat(prev) / 100).toString());
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) addDigit(e.key);
      if (e.key === '.') addDigit('.');
      if (e.key === '+') chooseOperation('add');
      if (e.key === '-') chooseOperation('subtract');
      if (e.key === '*') chooseOperation('multiply');
      if (e.key === '/') chooseOperation('divide');
      if (e.key === 'Enter' || e.key === '=') equals();
      if (e.key === 'Escape') clear();
      if (e.key === 'Backspace') deleteDigit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentValue, previousValue, operation, overwrite]);

  const formatDisplay = (val: string) => {
    const [integer, decimal] = val.split('.');
    const formattedInteger = Number(integer).toLocaleString('en-US');
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  const getBgStyles = () => {
    if (theme === 'dark') return 'bg-[#0F1115]';
    if (theme === 'rainbow') return '';
    return 'bg-[#F5F5F7]';
  };

  const getRainbowBg = () => {
    if (theme !== 'rainbow') return {};
    return {
      backgroundColor: `hsla(${hue}, 70%, 90%, 1)`,
      backgroundImage: `linear-gradient(135deg, hsla(${hue}, 70%, 90%, 1) 0%, hsla(${(hue + 60) % 360}, 70%, 90%, 1) 100%)`
    };
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-700 flex flex-col items-center justify-center p-4 font-sans text-[#1D1D1F] ${getBgStyles()}`}
      style={getRainbowBg()}
    >
      {/* Theme Toggle Controls */}
      <div className="mb-8 flex gap-4 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/20" id="theme-controls">
        <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} label="Blanco" icon={<Sun size={18} />} />
        <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} label="Oscuro" icon={<Moon size={18} />} />
        <ThemeButton active={theme === 'rainbow'} onClick={() => setTheme('rainbow')} label="Arcoíris" icon={<Sparkles size={18} />} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[340px] bg-white rounded-[40px] shadow-2xl shadow-black/10 overflow-hidden border border-white/50 backdrop-blur-xl"
        id="calculator-container"
      >
        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-0 z-50 bg-white shadow-xl flex flex-col"
              id="history-panel"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-800">Historial</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setHistory([])}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.length === 0 ? (
                  <p className="text-center text-gray-400 mt-10">Sin historial aún</p>
                ) : (
                  history.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-right border-b border-gray-50 pb-3"
                    >
                      <p className="text-sm text-gray-400 font-mono mb-1">{item.expression}</p>
                      <p className="text-xl font-semibold font-mono text-[#0071E3]">= {item.result}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Area */}
        <div className="p-8 pb-6 flex flex-col items-end justify-end min-h-[160px] bg-gradient-to-b from-white to-[#FBFBFD]" id="display-container">
          <button 
            onClick={() => setShowHistory(true)}
            className="absolute top-6 left-8 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            id="history-toggle"
          >
            <History size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div 
              key={previousValue + (operation || '')}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.5, y: 0 }}
              className="text-sm font-medium tracking-tight h-6 mb-1"
              id="previous-operation"
            >
              {previousValue} {operation === 'add' && '+'} 
              {operation === 'subtract' && '-'} 
              {operation === 'multiply' && '×'} 
              {operation === 'divide' && '÷'}
            </motion.div>
          </AnimatePresence>
          <div className="w-full text-right overflow-hidden" id="current-value-container">
             <motion.div 
              key={currentValue}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-semibold tracking-tighter truncate font-mono"
              id="current-value"
            >
              {formatDisplay(currentValue)}
            </motion.div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-4 grid grid-cols-4 gap-3 bg-[#FBFBFD]" id="buttons-grid">
          {/* Row 1 */}
          <CalcButton onClick={clear} variant="action" id="btn-clear"><RotateCcw size={20} /></CalcButton>
          <CalcButton onClick={toggleSign} variant="action" id="btn-plus-minus">±</CalcButton>
          <CalcButton onClick={applyPercent} variant="action" id="btn-percent"><Percent size={20} /></CalcButton>
          <CalcButton onClick={() => chooseOperation('divide')} active={operation === 'divide'} variant="operator" id="btn-divide"><Divide size={24} /></CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => addDigit('7')} id="btn-7">7</CalcButton>
          <CalcButton onClick={() => addDigit('8')} id="btn-8">8</CalcButton>
          <CalcButton onClick={() => addDigit('9')} id="btn-9">9</CalcButton>
          <CalcButton onClick={() => chooseOperation('multiply')} active={operation === 'multiply'} variant="operator" id="btn-multiply"><X size={24} /></CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => addDigit('4')} id="btn-4">4</CalcButton>
          <CalcButton onClick={() => addDigit('5')} id="btn-5">5</CalcButton>
          <CalcButton onClick={() => addDigit('6')} id="btn-6">6</CalcButton>
          <CalcButton onClick={() => chooseOperation('subtract')} active={operation === 'subtract'} variant="operator" id="btn-subtract"><Minus size={24} /></CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => addDigit('1')} id="btn-1">1</CalcButton>
          <CalcButton onClick={() => addDigit('2')} id="btn-2">2</CalcButton>
          <CalcButton onClick={() => addDigit('3')} id="btn-3">3</CalcButton>
          <CalcButton onClick={() => chooseOperation('add')} active={operation === 'add'} variant="operator" id="btn-plus"><Plus size={24} /></CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => addDigit('0')} className="col-span-2" id="btn-0">0</CalcButton>
          <CalcButton onClick={() => addDigit('.')} id="btn-dot">.</CalcButton>
          <CalcButton onClick={equals} variant="equals" id="btn-equals"><Equal size={24} /></CalcButton>
        </div>
        
        {/* Footer info */}
        <div className="pb-6 pt-2 px-8 text-center" id="footer">
          <p className="text-[10px] uppercase tracking-widest text-[#86868B] font-medium">Marc Calculator</p>
        </div>
      </motion.div>
    </div>
  );
}

interface CalcButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'action' | 'equals';
  active?: boolean;
  className?: string;
  id: string;
}

function CalcButton({ children, onClick, variant = 'number', active = false, className = '', id }: CalcButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'operator':
        return active 
          ? 'bg-[#0071E3] text-white' 
          : 'bg-[#F5F5F7] text-[#0071E3] hover:bg-[#E8E8ED]';
      case 'action':
        return 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]';
      case 'equals':
        return 'bg-[#0071E3] text-white hover:bg-[#0077ED]';
      default:
        return 'bg-white border border-[#D2D2D7]/30 text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm';
    }
  };

  return (
    <motion.button
      id={id}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`
        h-14 rounded-2xl flex items-center justify-center text-xl font-medium transition-colors duration-200
        ${getVariantStyles()}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300
        ${active ? 'bg-white text-[#0071E3] shadow-sm' : 'text-gray-500 hover:text-gray-800'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
