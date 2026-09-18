import React from 'react';
import { Play, Pause, X, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface QuickTimerFloaterProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onAdd15: () => void;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  label?: string;
}

export const QuickTimerFloater: React.FC<QuickTimerFloaterProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  onToggle,
  onReset,
  onAdd15,
  onClose,
  soundEnabled,
  onToggleSound,
  label = 'Descanso entre series',
}) => {
  if (secondsLeft <= 0 && !isRunning) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const timeFormatted = `${minutes}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  const percentage = totalSeconds > 0 ? Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100)) : 0;

  return (
    <div
      id="quick-timer-floater"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 flex items-center gap-3.5 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Mini circular progress indicator */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-12 h-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            className={`${secondsLeft <= 5 ? 'text-rose-500' : 'text-emerald-400'} transition-all duration-300`}
            fill="transparent"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * percentage) / 100}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold font-mono tracking-tight">
          {timeFormatted}
        </span>
      </div>

      <div className="flex flex-col min-w-[110px]">
        <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-200">
          {isRunning ? 'Temporizador activo' : 'Pausado'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pl-1 border-l border-slate-700/60">
        <button
          id="btn-quicktimer-toggle"
          onClick={onToggle}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition-colors"
          title={isRunning ? 'Pausar' : 'Iniciar'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          id="btn-quicktimer-add15"
          onClick={onAdd15}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-colors flex items-center gap-0.5"
          title="Sumar 15 segundos"
        >
          <Plus className="w-3 h-3" /> 15s
        </button>

        <button
          id="btn-quicktimer-sound"
          onClick={onToggleSound}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title={soundEnabled ? 'Silenciar beeps' : 'Activar beeps'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        <button
          id="btn-quicktimer-reset"
          onClick={onReset}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Reiniciar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          id="btn-quicktimer-close"
          onClick={onClose}
          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
          title="Cerrar temporizador"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
