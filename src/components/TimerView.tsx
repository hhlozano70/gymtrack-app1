import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Bell, BellOff, Plus, Minus, Flame, RefreshCw } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface TimerViewProps {
  onStartRestFromParent?: (seconds: number) => void;
}

export const TimerView: React.FC<TimerViewProps> = () => {
  const [activeMode, setActiveMode] = useState<'rest' | 'stopwatch' | 'hiit'>('rest');

  // Sound cues enabled
  const [soundEnabled, setSoundEnabled] = useState(true);

  // -------------------------------------------------------------
  // 1. REST TIMER STATE
  // -------------------------------------------------------------
  const [restInitialSeconds, setRestInitialSeconds] = useState(60);
  const [restRemaining, setRestRemaining] = useState(60);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const restIntervalRef = useRef<any>(null);

  const startRestTimer = (seconds: number) => {
    setRestInitialSeconds(seconds);
    setRestRemaining(seconds);
    setIsRestRunning(true);
  };

  useEffect(() => {
    if (isRestRunning) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current);
            setIsRestRunning(false);
            if (soundEnabled) {
              audioManager.playRestComplete();
            }
            return 0;
          }
          if (soundEnabled && prev <= 4 && prev > 1) {
            audioManager.playBeep(700, 0.09);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }
    return () => clearInterval(restIntervalRef.current);
  }, [isRestRunning, soundEnabled]);

  const addRestTime = (seconds: number) => {
    setRestRemaining((prev) => Math.max(0, prev + seconds));
    setRestInitialSeconds((prev) => Math.max(prev, prev + seconds));
  };

  const resetRestTimer = () => {
    setIsRestRunning(false);
    setRestRemaining(restInitialSeconds);
  };

  // -------------------------------------------------------------
  // 2. STOPWATCH STATE
  // -------------------------------------------------------------
  const [stopwatchTime, setStopwatchTime] = useState(0); // in milliseconds
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number; lapTime: number; overallTime: number }[]>([]);
  const stopwatchIntervalRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isStopwatchRunning) {
      lastTimeRef.current = Date.now();
      stopwatchIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setStopwatchTime((prev) => prev + delta);
      }, 10);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [isStopwatchRunning]);

  const handleStopwatchLap = () => {
    if (stopwatchTime === 0) return;
    const previousOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const lapDelta = stopwatchTime - previousOverall;
    const newLap = {
      id: laps.length + 1,
      lapTime: lapDelta,
      overallTime: stopwatchTime,
    };
    setLaps([newLap, ...laps]);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      centiseconds: String(centiseconds).padStart(2, '0'),
    };
  };

  // -------------------------------------------------------------
  // 3. HIIT / TABATA INTERVAL TIMER STATE
  // -------------------------------------------------------------
  const [hiitConfig, setHiitConfig] = useState({
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    prepSeconds: 10,
  });
  const [hiitCurrentRound, setHiitCurrentRound] = useState(1);
  const [hiitPhase, setHiitPhase] = useState<'prep' | 'work' | 'rest' | 'finished'>('prep');
  const [hiitTimeRemaining, setHiitTimeRemaining] = useState(10);
  const [isHiitRunning, setIsHiitRunning] = useState(false);
  const hiitIntervalRef = useRef<any>(null);

  const startHiit = () => {
    setHiitCurrentRound(1);
    setHiitPhase('prep');
    setHiitTimeRemaining(hiitConfig.prepSeconds);
    setIsHiitRunning(true);
  };

  const resetHiit = () => {
    setIsHiitRunning(false);
    setHiitCurrentRound(1);
    setHiitPhase('prep');
    setHiitTimeRemaining(hiitConfig.prepSeconds);
  };

  useEffect(() => {
    if (isHiitRunning && hiitPhase !== 'finished') {
      hiitIntervalRef.current = setInterval(() => {
        setHiitTimeRemaining((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (hiitPhase === 'prep') {
              setHiitPhase('work');
              if (soundEnabled) audioManager.playGo();
              return hiitConfig.workSeconds;
            } else if (hiitPhase === 'work') {
              if (hiitCurrentRound >= hiitConfig.rounds) {
                setHiitPhase('finished');
                setIsHiitRunning(false);
                if (soundEnabled) audioManager.playRestComplete();
                return 0;
              } else {
                setHiitPhase('rest');
                if (soundEnabled) audioManager.playRestComplete();
                return hiitConfig.restSeconds;
              }
            } else if (hiitPhase === 'rest') {
              setHiitCurrentRound((r) => r + 1);
              setHiitPhase('work');
              if (soundEnabled) audioManager.playGo();
              return hiitConfig.workSeconds;
            }
            return 0;
          }

          // Countdown beeps
          if (soundEnabled && prev <= 4 && prev > 1) {
            audioManager.playBeep(800, 0.08);
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(hiitIntervalRef.current);
    }
    return () => clearInterval(hiitIntervalRef.current);
  }, [isHiitRunning, hiitPhase, hiitCurrentRound, hiitConfig, soundEnabled]);

  const swFormatted = formatStopwatch(stopwatchTime);
  const restProgress = restInitialSeconds > 0 ? (restRemaining / restInitialSeconds) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Cronómetro & Temporizadores de Gimnasio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Optimiza tus descansos entre series, mide tus series y programa intervalos HIIT.
          </p>
        </div>

        {/* Sound toggle */}
        <button
          id="btn-toggle-sound"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            soundEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {soundEnabled ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4" />}
          <span>{soundEnabled ? 'Sonidos activos' : 'Silenciado'}</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
        <button
          id="tab-mode-rest"
          onClick={() => setActiveMode('rest')}
          className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'rest'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Descanso entre Series
        </button>
        <button
          id="tab-mode-stopwatch"
          onClick={() => setActiveMode('stopwatch')}
          className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'stopwatch'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Cronómetro con Vueltas
        </button>
        <button
          id="tab-mode-hiit"
          onClick={() => setActiveMode('hiit')}
          className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'hiit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Tabata / HIIT Intervalos
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 1. REST TIMER TAB */}
      {/* -------------------------------------------------------- */}
      {activeMode === 'rest' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-center">
          {/* Circular Countdown Progress */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="10"
                className={`${
                  restRemaining <= 5 && restRemaining > 0 ? 'text-rose-500' : 'text-emerald-500'
                } transition-all duration-300`}
                fill="transparent"
                strokeDasharray={703.7}
                strokeDashoffset={703.7 - (703.7 * restProgress) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tighter text-slate-900">
                {Math.floor(restRemaining / 60)}:
                {restRemaining % 60 < 10 ? '0' : ''}
                {restRemaining % 60}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
                {isRestRunning ? 'Recuperando aliento' : restRemaining === 0 ? '¡A por la siguiente serie!' : 'Listo para iniciar'}
              </span>
            </div>
          </div>

          {/* Controls: Play/Pause, +15, Reset */}
          <div className="flex items-center justify-center gap-4">
            <button
              id="btn-rest-sub15"
              onClick={() => addRestTime(-15)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors"
              title="Restar 15 segundos"
            >
              <Minus className="w-5 h-5" />
            </button>

            <button
              id="btn-rest-toggle"
              onClick={() => setIsRestRunning(!isRestRunning)}
              className={`px-8 py-4 rounded-xl font-bold text-lg text-white shadow-md flex items-center gap-3 transition-transform active:scale-95 ${
                isRestRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isRestRunning ? (
                <>
                  <Pause className="w-6 h-6" /> Pausar
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" /> Iniciar Descanso
                </>
              )}
            </button>

            <button
              id="btn-rest-add15"
              onClick={() => addRestTime(15)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors"
              title="Sumar 15 segundos"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              id="btn-rest-reset"
              onClick={resetRestTimer}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
              title="Reiniciar temporizador"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Tiempos recomendados según objetivo
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { sec: 30, label: '30s', desc: 'HIIT / Quema' },
                { sec: 45, label: '45s', desc: 'Resistencia' },
                { sec: 60, label: '60s', desc: 'Hipertrofia' },
                { sec: 90, label: '90s', desc: 'Compuestos' },
                { sec: 120, label: '2 min', desc: 'Fuerza pesada' },
                { sec: 180, label: '3 min', desc: 'Powerlifting' },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  onClick={() => startRestTimer(preset.sec)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    restInitialSeconds === preset.sec && !isRestRunning
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold">{preset.label}</span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* 2. STOPWATCH TAB */}
      {/* -------------------------------------------------------- */}
      {activeMode === 'stopwatch' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Big Digital Display */}
          <div className="text-center py-6">
            <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tight">
              <span>{swFormatted.minutes}</span>:<span>{swFormatted.seconds}</span>
              <span className="text-3xl sm:text-4xl text-slate-400 font-semibold">
                .{swFormatted.centiseconds}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">
              {isStopwatchRunning ? 'Midiendo tiempo de serie / ejercicio' : 'Cronómetro detenido'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              id="btn-stopwatch-toggle"
              onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
              className={`px-8 py-4 rounded-xl font-bold text-lg text-white shadow-md flex items-center gap-3 transition-transform active:scale-95 ${
                isStopwatchRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isStopwatchRunning ? (
                <>
                  <Pause className="w-6 h-6" /> Detener
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" /> Iniciar
                </>
              )}
            </button>

            <button
              id="btn-stopwatch-lap"
              onClick={handleStopwatchLap}
              disabled={stopwatchTime === 0}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Flag className="w-5 h-5 text-emerald-600" />
              <span>Vuelta</span>
            </button>

            <button
              id="btn-stopwatch-reset"
              onClick={resetStopwatch}
              disabled={stopwatchTime === 0}
              className="p-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-emerald-600" />
                <span>Historial de Vueltas ({laps.length})</span>
              </h3>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {laps.map((lap) => {
                  const lapFormat = formatStopwatch(lap.lapTime);
                  const overallFormat = formatStopwatch(lap.overallTime);
                  return (
                    <div
                      key={lap.id}
                      className="px-4 py-3 flex items-center justify-between text-sm hover:bg-slate-50 font-mono"
                    >
                      <span className="font-semibold text-slate-700">Vuelta #{lap.id}</span>
                      <span className="font-bold text-emerald-600">
                        +{lapFormat.minutes}:{lapFormat.seconds}.{lapFormat.centiseconds}
                      </span>
                      <span className="text-slate-400 text-xs">
                        Total: {overallFormat.minutes}:{overallFormat.seconds}.{overallFormat.centiseconds}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* 3. HIIT / TABATA INTERVAL TAB */}
      {/* -------------------------------------------------------- */}
      {activeMode === 'hiit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Visual Phase Display */}
          <div
            className={`rounded-2xl p-8 text-center text-white transition-colors duration-300 ${
              hiitPhase === 'prep'
                ? 'bg-amber-600'
                : hiitPhase === 'work'
                ? 'bg-emerald-600'
                : hiitPhase === 'rest'
                ? 'bg-blue-600'
                : 'bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-90 mb-4">
              <span>
                Ronda {hiitCurrentRound} de {hiitConfig.rounds}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4" /> Intervalos Quema Grasa
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider mb-2 font-['Space_Grotesk']">
              {hiitPhase === 'prep' && '¡Prepárate!'}
              {hiitPhase === 'work' && '¡A DARLE! (TRABAJO)'}
              {hiitPhase === 'rest' && 'Descanso / Respira'}
              {hiitPhase === 'finished' && '¡Entrenamiento Completado!'}
            </h2>

            <div className="font-mono text-7xl sm:text-9xl font-black tracking-tight my-4">
              {hiitTimeRemaining}s
            </div>

            <p className="text-sm opacity-80">
              {hiitPhase === 'prep' && 'Ajusta tu posición en la máquina o mancuernas'}
              {hiitPhase === 'work' && 'Máxima intensidad controlada'}
              {hiitPhase === 'rest' && 'Baja pulsaciones y mantente en movimiento'}
              {hiitPhase === 'finished' && '¡Gran quema calórica! Has finalizado todas las rondas.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              id="btn-hiit-toggle"
              onClick={() => {
                if (hiitPhase === 'finished') {
                  startHiit();
                } else {
                  setIsHiitRunning(!isHiitRunning);
                }
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg text-white shadow-md flex items-center gap-3 transition-transform active:scale-95 ${
                isHiitRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isHiitRunning ? (
                <>
                  <Pause className="w-6 h-6" /> Pausar
                </>
              ) : hiitPhase === 'finished' ? (
                <>
                  <RefreshCw className="w-6 h-6" /> Repetir Tabata
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" /> Iniciar Circuito
                </>
              )}
            </button>

            <button
              id="btn-hiit-reset"
              onClick={resetHiit}
              className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Reiniciar Tabata"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Interval Configuration Settings */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Configuración del Circuito</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Rondas</label>
                <div className="flex items-center justify-between">
                  <button
                    disabled={isHiitRunning || hiitConfig.rounds <= 1}
                    onClick={() => setHiitConfig((c) => ({ ...c, rounds: c.rounds - 1 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-900">{hiitConfig.rounds}</span>
                  <button
                    disabled={isHiitRunning}
                    onClick={() => setHiitConfig((c) => ({ ...c, rounds: c.rounds + 1 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Trabajo (seg)</label>
                <div className="flex items-center justify-between">
                  <button
                    disabled={isHiitRunning || hiitConfig.workSeconds <= 5}
                    onClick={() => setHiitConfig((c) => ({ ...c, workSeconds: c.workSeconds - 5 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-900">{hiitConfig.workSeconds}s</span>
                  <button
                    disabled={isHiitRunning}
                    onClick={() => setHiitConfig((c) => ({ ...c, workSeconds: c.workSeconds + 5 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Descanso (seg)</label>
                <div className="flex items-center justify-between">
                  <button
                    disabled={isHiitRunning || hiitConfig.restSeconds <= 5}
                    onClick={() => setHiitConfig((c) => ({ ...c, restSeconds: c.restSeconds - 5 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-900">{hiitConfig.restSeconds}s</span>
                  <button
                    disabled={isHiitRunning}
                    onClick={() => setHiitConfig((c) => ({ ...c, restSeconds: c.restSeconds + 5 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Prep (seg)</label>
                <div className="flex items-center justify-between">
                  <button
                    disabled={isHiitRunning || hiitConfig.prepSeconds <= 3}
                    onClick={() => setHiitConfig((c) => ({ ...c, prepSeconds: c.prepSeconds - 1 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-900">{hiitConfig.prepSeconds}s</span>
                  <button
                    disabled={isHiitRunning}
                    onClick={() => setHiitConfig((c) => ({ ...c, prepSeconds: c.prepSeconds + 1 }))}
                    className="p-1 rounded bg-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
