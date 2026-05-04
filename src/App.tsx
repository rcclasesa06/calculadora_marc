import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Delete, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal, 
  RotateCcw,
  Percent
} from 'lucide-react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | null;

export default function App() {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [overwrite, setOverwrite] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-sans text-[#1D1D1F]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] bg-white rounded-[40px] shadow-2xl shadow-black/10 overflow-hidden border border-white/50 backdrop-blur-xl"
        id="calculator-container"
      >
        {/* Display Area */}
        <div className="p-8 pb-6 flex flex-col items-end justify-end min-h-[160px] bg-gradient-to-b from-white to-[#FBFBFD]" id="display-container">
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
          <p className="text-[10px] uppercase tracking-widest text-[#86868B] font-medium">Precision Instrument</p>
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
