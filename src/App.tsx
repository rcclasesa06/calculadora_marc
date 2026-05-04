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
  Trash2,
  Image as ImageIcon,
  ImageMinus
} from 'lucide-react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'pow' | null;
type CalcMode = 'basica' | 'conjunta';

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
  const [mode, setMode] = useState<CalcMode>('basica');
  const [isRadians, setIsRadians] = useState(true);
  const [bgImage, setBgImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fact = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= Math.floor(n); i++) res *= i;
    return res;
  };

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
      case 'pow':
        computation = Math.pow(prev, current);
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
    const opSymbols: Record<string, string> = { 
      add: '+', 
      subtract: '-', 
      multiply: '×', 
      divide: '÷',
      pow: '^'
    };
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

  const handleAdvanced = (fn: string) => {
    const current = parseFloat(currentValue);
    let result = 0;
    let name = '';

    const toRad = (val: number) => isRadians ? val : (val * Math.PI) / 180;
    const fromRad = (val: number) => isRadians ? val : (val * 180) / Math.PI;

    switch (fn) {
      case 'sqrt': result = Math.sqrt(current); name = `√(${current})`; break;
      case 'cbrt': result = Math.cbrt(current); name = `∛(${current})`; break;
      case 'sqr': result = Math.pow(current, 2); name = `(${current})²`; break;
      case 'cube': result = Math.pow(current, 3); name = `(${current})³`; break;
      case 'sin': result = Math.sin(toRad(current)); name = `sin(${current})`; break;
      case 'cos': result = Math.cos(toRad(current)); name = `cos(${current})`; break;
      case 'tan': result = Math.tan(toRad(current)); name = `tan(${current})`; break;
      case 'asin': result = fromRad(Math.asin(current)); name = `asin(${current})`; break;
      case 'acos': result = fromRad(Math.acos(current)); name = `acos(${current})`; break;
      case 'atan': result = fromRad(Math.atan(current)); name = `atan(${current})`; break;
      case 'sinh': result = Math.sinh(current); name = `sinh(${current})`; break;
      case 'cosh': result = Math.cosh(current); name = `cosh(${current})`; break;
      case 'tanh': result = Math.tanh(current); name = `tanh(${current})`; break;
      case 'abs': result = Math.abs(current); name = `abs(${current})`; break;
      case 'fact': result = fact(current); name = `${current}!`; break;
      case 'log10': result = Math.log10(current); name = `log(${current})`; break;
      case 'log2': result = Math.log2(current); name = `log2(${current})`; break;
      case 'ln': result = Math.log(current); name = `ln(${current})`; break;
      case 'exp': result = Math.exp(current); name = `e^${current}`; break;
      case '10x': result = Math.pow(10, current); name = `10^${current}`; break;
      case 'inv': result = 1/current; name = `1/${current}`; break;
      case 'pi': result = Math.PI; name = 'π'; break;
      case 'e': result = Math.E; name = 'e'; break;
      case 'rand': result = Math.random(); name = 'rand'; break;
      case 'round': result = Math.round(current); name = `round(${current})`; break;
      case 'floor': result = Math.floor(current); name = `floor(${current})`; break;
      case 'ceil': result = Math.ceil(current); name = `ceil(${current})`; break;
      default: return;
    }

    const resultStr = Number(result.toFixed(8)).toString();
    
    // Add to history if it's a computational function (not just a constant)
    if (fn !== 'pi' && fn !== 'e') {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: name,
        result: resultStr
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50));
    }

    setCurrentValue(resultStr);
    setOverwrite(true);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDisplay = (val: string) => {
    const [integer, decimal] = val.split('.');
    const formattedInteger = Number(integer).toLocaleString('en-US');
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 font-sans text-[#1D1D1F] overflow-hidden">
      {/* Background Layer (Base Color) */}
      <div className={`absolute inset-0 -z-30 transition-colors duration-700 ${bgImage ? 'bg-black' : 'bg-[#F5F5F7]'}`} id="base-bg" />

      {/* Background Image Layer */}
      <AnimatePresence>
        {bgImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
      </AnimatePresence>

      {/* Background Blobs Layer */}
      <div className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-500 ${bgImage ? 'opacity-30' : 'opacity-100'}`} id="blobs-container">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/30 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, -80, 0], y: [0, 120, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/30 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 150, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-pink-300/20 blur-[80px]" 
        />
      </div>

      {/* Controls and Calculator Content (Now clearly above background) */}
      <div className="relative z-10 flex flex-col items-center w-full mb-4 max-w-[400px]">
        {/* Background Selector Buttons */}
        <div className="flex gap-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/20" id="bg-controls">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 text-gray-700 hover:bg-white/60"
            title="Importar fondo de la galería"
          >
            <ImageIcon size={18} />
            <span className="hidden sm:inline">importar fondo de la galeria</span>
          </button>
          
          {bgImage && (
            <button 
              onClick={() => setBgImage(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 text-red-600 hover:bg-red-50/60"
              title="Quitar Fondo"
            >
              <ImageMinus size={18} />
              <span className="hidden sm:inline">Quitar</span>
            </button>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-4 w-full" id="mode-switcher">
        <button 
          onClick={() => setMode('basica')}
          className={`
            flex-1 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg border-2
            ${mode === 'basica' 
              ? 'bg-[#0071E3] text-white border-[#0071E3] scale-105' 
              : 'bg-white/60 text-gray-500 border-transparent hover:bg-white/80'}
          `}
        >
          Calculadora Básica
        </button>
        <button 
          onClick={() => setMode('conjunta')}
          className={`
            flex-1 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg border-2
            ${mode === 'conjunta' 
              ? 'bg-[#0071E3] text-white border-[#0071E3] scale-105' 
              : 'bg-white/60 text-gray-500 border-transparent hover:bg-white/80'}
          `}
        >
          Calculadora Conjunta
        </button>
      </div>
    </div>



      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full transition-all duration-500 bg-white rounded-[40px] shadow-2xl shadow-black/10 overflow-hidden border border-white/50 backdrop-blur-xl ${mode === 'basica' ? 'max-w-[340px]' : 'max-w-[500px]'}`}
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
        <div className={`p-4 grid gap-3 bg-[#FBFBFD] transition-all duration-500 ${mode === 'basica' ? 'grid-cols-4' : 'grid-cols-6'}`} id="buttons-grid">
          {mode === 'conjunta' && (
            <>
              {/* Scientific Rows */}
              <CalcButton onClick={() => setIsRadians(!isRadians)} variant="operator" id="btn-rad-deg" className="text-xs">{isRadians ? 'Rad' : 'Deg'}</CalcButton>
              <CalcButton onClick={() => handleAdvanced('fact')} variant="action" id="btn-fact" className="text-sm">x!</CalcButton>
              <CalcButton onClick={() => handleAdvanced('abs')} variant="action" id="btn-abs" className="text-sm">|x|</CalcButton>
              <CalcButton onClick={() => handleAdvanced('inv')} variant="action" id="btn-inv" className="text-sm">1/x</CalcButton>
              <CalcButton onClick={() => handleAdvanced('pi')} variant="action" id="btn-pi" className="text-sm">π</CalcButton>
              <CalcButton onClick={() => handleAdvanced('e')} variant="action" id="btn-e" className="text-sm">e</CalcButton>

              <CalcButton onClick={() => handleAdvanced('sin')} variant="action" id="btn-sin" className="text-sm">sin</CalcButton>
              <CalcButton onClick={() => handleAdvanced('cos')} variant="action" id="btn-cos" className="text-sm">cos</CalcButton>
              <CalcButton onClick={() => handleAdvanced('tan')} variant="action" id="btn-tan" className="text-sm">tan</CalcButton>
              <CalcButton onClick={() => handleAdvanced('asin')} variant="action" id="btn-asin" className="text-sm">sin⁻¹</CalcButton>
              <CalcButton onClick={() => handleAdvanced('acos')} variant="action" id="btn-acos" className="text-sm">cos⁻¹</CalcButton>
              <CalcButton onClick={() => handleAdvanced('atan')} variant="action" id="btn-atan" className="text-sm">tan⁻¹</CalcButton>

              <CalcButton onClick={() => handleAdvanced('sinh')} variant="action" id="btn-sinh" className="text-sm">sinh</CalcButton>
              <CalcButton onClick={() => handleAdvanced('cosh')} variant="action" id="btn-cosh" className="text-sm">cosh</CalcButton>
              <CalcButton onClick={() => handleAdvanced('tanh')} variant="action" id="btn-tanh" className="text-sm">tanh</CalcButton>
              <CalcButton onClick={() => handleAdvanced('log10')} variant="action" id="btn-log10" className="text-sm">log₁₀</CalcButton>
              <CalcButton onClick={() => handleAdvanced('log2')} variant="action" id="btn-log2" className="text-sm">log₂</CalcButton>
              <CalcButton onClick={() => handleAdvanced('ln')} variant="action" id="btn-ln" className="text-sm">ln</CalcButton>

              <CalcButton onClick={() => handleAdvanced('sqrt')} variant="action" id="btn-sqrt" className="text-sm">√</CalcButton>
              <CalcButton onClick={() => handleAdvanced('cbrt')} variant="action" id="btn-cbrt" className="text-sm">∛</CalcButton>
              <CalcButton onClick={() => handleAdvanced('sqr')} variant="action" id="btn-sqr" className="text-sm">x²</CalcButton>
              <CalcButton onClick={() => handleAdvanced('cube')} variant="action" id="btn-cube" className="text-sm">x³</CalcButton>
              <CalcButton onClick={() => chooseOperation('pow')} active={operation === 'pow'} variant="operator" id="btn-pow" className="text-sm">xʸ</CalcButton>
              <CalcButton onClick={() => handleAdvanced('exp')} variant="action" id="btn-exp" className="text-sm">eˣ</CalcButton>

              <CalcButton onClick={() => handleAdvanced('10x')} variant="action" id="btn-10x" className="text-sm">10ˣ</CalcButton>
              <CalcButton onClick={() => handleAdvanced('rand')} variant="action" id="btn-rand" className="text-sm">rand</CalcButton>
              <CalcButton onClick={() => handleAdvanced('round')} variant="action" id="btn-round" className="text-sm">round</CalcButton>
              <CalcButton onClick={() => handleAdvanced('floor')} variant="action" id="btn-floor" className="text-sm">floor</CalcButton>
              <CalcButton onClick={() => handleAdvanced('ceil')} variant="action" id="btn-ceil" className="text-sm">ceil</CalcButton>
              <div className="bg-transparent" />
            </>
          )}

          {/* Row 1 */}
          <CalcButton onClick={clear} variant="action" id="btn-clear"><RotateCcw size={20} /></CalcButton>
          <CalcButton onClick={toggleSign} variant="action" id="btn-plus-minus">±</CalcButton>
          <CalcButton onClick={applyPercent} variant="action" id="btn-percent"><Percent size={20} /></CalcButton>
          <CalcButton onClick={() => chooseOperation('divide')} active={operation === 'divide'} variant="operator" id="btn-divide"><Divide size={24} /></CalcButton>
          {mode === 'conjunta' && <div className="col-span-2" />}

          {/* Row 2 */}
          <CalcButton onClick={() => addDigit('7')} id="btn-7">7</CalcButton>
          <CalcButton onClick={() => addDigit('8')} id="btn-8">8</CalcButton>
          <CalcButton onClick={() => addDigit('9')} id="btn-9">9</CalcButton>
          <CalcButton onClick={() => chooseOperation('multiply')} active={operation === 'multiply'} variant="operator" id="btn-multiply"><X size={24} /></CalcButton>
          {mode === 'conjunta' && <div className="col-span-2" />}

          {/* Row 3 */}
          <CalcButton onClick={() => addDigit('4')} id="btn-4">4</CalcButton>
          <CalcButton onClick={() => addDigit('5')} id="btn-5">5</CalcButton>
          <CalcButton onClick={() => addDigit('6')} id="btn-6">6</CalcButton>
          <CalcButton onClick={() => chooseOperation('subtract')} active={operation === 'subtract'} variant="operator" id="btn-subtract"><Minus size={24} /></CalcButton>
          {mode === 'conjunta' && <div className="col-span-2" />}

          {/* Row 4 */}
          <CalcButton onClick={() => addDigit('1')} id="btn-1">1</CalcButton>
          <CalcButton onClick={() => addDigit('2')} id="btn-2">2</CalcButton>
          <CalcButton onClick={() => addDigit('3')} id="btn-3">3</CalcButton>
          <CalcButton onClick={() => chooseOperation('add')} active={operation === 'add'} variant="operator" id="btn-plus"><Plus size={24} /></CalcButton>
          {mode === 'conjunta' && <div className="col-span-2" />}

          {/* Row 5 */}
          <CalcButton onClick={() => addDigit('0')} className={mode === 'basica' ? "col-span-2" : "col-span-1"} id="btn-0">0</CalcButton>
          {mode === 'conjunta' && <div className="invisible" />}
          <CalcButton onClick={() => addDigit('.')} id="btn-dot">.</CalcButton>
          <CalcButton onClick={equals} variant="equals" className={mode === 'conjunta' ? "col-span-3" : ""} id="btn-equals"><Equal size={24} /></CalcButton>
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


