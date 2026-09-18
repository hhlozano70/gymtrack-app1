import React, { useState, useEffect, useRef } from 'react';
import { Routine, WorkoutSession, WorkoutSet } from '../types';
import { Check, Play, Pause, Plus, Trash2, Timer, Flame, Dumbbell, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExerciseVisualBadge } from './ExerciseVisualBadge';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface ActiveWorkoutModalProps {
  routine: Routine;
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancelWorkout: () => void;
  onTriggerRestTimer: (seconds: number) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  onFinishWorkout,
  onCancelWorkout,
  onTriggerRestTimer,
}) => {
  // Session timer in seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<any>(null);

  // Deep copy exercises so modifications don't mutate original preset
  const [workoutExercises, setWorkoutExercises] = useState(() =>
    routine.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, completed: false })),
    }))
  );

  const [sessionNotes, setSessionNotes] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [finishedSummary, setFinishedSummary] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Compute live volume and calories
  let totalVolumeKg = 0;
  let totalCompletedSets = 0;
  let totalSets = 0;

  workoutExercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalSets++;
      if (set.completed) {
        totalCompletedSets++;
        totalVolumeKg += (set.weight || 0) * (set.reps || 0);
      }
    });
  });

  // Dynamic calorie estimate: base MET * duration + work done
  const estimatedCaloriesBurned = Math.round(
    (elapsedSeconds / 60) * 6.5 + (totalCompletedSets * 8)
  );

  const handleToggleSet = (exIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    const targetSet = updated[exIndex].sets[setIndex];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;
    setWorkoutExercises(updated);

    if (willBeCompleted) {
      // Trigger rest timer
      const restTime = updated[exIndex].suggestedRestSeconds || 60;
      onTriggerRestTimer(restTime);
    }
  };

  const handleUpdateSetWeight = (exIndex: number, setIndex: number, val: number) => {
    const updated = [...workoutExercises];
    updated[exIndex].sets[setIndex].weight = Math.max(0, val);
    setWorkoutExercises(updated);
  };

  const handleUpdateSetReps = (exIndex: number, setIndex: number, val: number) => {
    const updated = [...workoutExercises];
    updated[exIndex].sets[setIndex].reps = Math.max(0, val);
    setWorkoutExercises(updated);
  };

  const handleAddSet = (exIndex: number) => {
    const updated = [...workoutExercises];
    const prevSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    const newSetNumber = updated[exIndex].sets.length + 1;
    updated[exIndex].sets.push({
      id: `s-custom-${Date.now()}-${newSetNumber}`,
      setNumber: newSetNumber,
      weight: prevSet ? prevSet.weight : 20,
      reps: prevSet ? prevSet.reps : 12,
      completed: false,
    });
    setWorkoutExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exIndex].sets.splice(setIndex, 1);
    // Renumber
    updated[exIndex].sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });
    setWorkoutExercises(updated);
  };

  const handleCompleteWorkout = () => {
    setIsTimerRunning(false);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const finalSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      durationMinutes: durationMins,
      caloriesBurned: estimatedCaloriesBurned,
      totalVolumeKg,
      exercises: workoutExercises.map((ex) => ({
        name: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
        })),
      })),
      notes: sessionNotes.trim() || undefined,
    };

    setFinishedSummary(finalSession);
    setShowSummaryModal(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between overflow-y-auto">
      {/* Top sticky workout control bar */}
      <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancelWorkout}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Descartar entrenamiento"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center px-1.5 py-0.5 bg-white rounded-lg shadow-xs">
            <AlfaOmegaLogo size="sm" variant="icon" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Alfa &amp; Omega Gym · En Curso
            </span>
            <h2 className="text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-xs">
              {routine.name}
            </h2>
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-lg sm:text-xl font-extrabold tracking-tight">
              {timeFormatted}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <Flame className="w-4 h-4" />
            <span>~{estimatedCaloriesBurned} kcal</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
            <Dumbbell className="w-4 h-4" />
            <span>{totalVolumeKg.toLocaleString()} kg</span>
          </div>

          <button
            id="btn-finish-workout-top"
            onClick={handleCompleteWorkout}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Main exercises list */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Progress pill bar */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span>
            Series completadas:{' '}
            <strong className="text-emerald-400 font-mono">
              {totalCompletedSets} / {totalSets}
            </strong>
          </span>
          <div className="w-32 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="font-mono text-slate-400">
            {totalSets > 0 ? Math.round((totalCompletedSets / totalSets) * 100) : 0}%
          </span>
        </div>

        {/* Exercise cards */}
        {workoutExercises.map((ex, exIdx) => (
          <div
            key={ex.exerciseId}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md text-white space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold">{ex.exerciseName}</h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {ex.muscleGroup}
                  </span>
                </div>
                {ex.notes && <p className="text-xs text-slate-400 mt-0.5">{ex.notes}</p>}
              </div>

              <span className="text-xs text-emerald-400 font-medium font-mono">
                Descanso sugerido: {ex.suggestedRestSeconds}s
              </span>
            </div>

            {/* Visual Guide: Animated GIF & Gym Apparatus Photo */}
            <ExerciseVisualBadge
              exerciseName={ex.exerciseName}
              variant="full"
              className="bg-slate-950/70 border-slate-800"
            />

            {/* Sets list */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <span className="col-span-2 sm:col-span-1 text-center">Serie</span>
                <span className="col-span-4 sm:col-span-4 text-center">Peso (kg)</span>
                <span className="col-span-4 sm:col-span-4 text-center">Reps</span>
                <span className="col-span-2 sm:col-span-3 text-center">Hecho</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${
                    set.completed
                      ? 'bg-emerald-950/40 border border-emerald-800/60'
                      : 'bg-slate-800/60 border border-slate-800'
                  }`}
                >
                  <span className="col-span-2 sm:col-span-1 font-mono font-bold text-center text-sm text-slate-300">
                    #{set.setNumber}
                  </span>

                  {/* Weight input */}
                  <div className="col-span-4 sm:col-span-4 flex items-center justify-center">
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) =>
                        handleUpdateSetWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-emerald-500"
                    />
                  </div>

                  {/* Reps input */}
                  <div className="col-span-4 sm:col-span-4 flex items-center justify-center">
                    <input
                      type="number"
                      step="1"
                      value={set.reps}
                      onChange={(e) =>
                        handleUpdateSetReps(exIdx, setIdx, parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-emerald-500"
                    />
                  </div>

                  {/* Complete check button */}
                  <div className="col-span-2 sm:col-span-3 flex items-center justify-center gap-2">
                    <button
                      id={`btn-complete-set-${exIdx}-${setIdx}`}
                      onClick={() => handleToggleSet(exIdx, setIdx)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all ${
                        set.completed
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                      title="Marcar serie completada"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>

                    {ex.sets.length > 1 && (
                      <button
                        onClick={() => handleRemoveSet(exIdx, setIdx)}
                        className="hidden sm:inline-block p-1 text-slate-500 hover:text-rose-400"
                        title="Eliminar serie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddSet(exIdx)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-dashed border-slate-700 hover:border-slate-500 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Serie a {ex.exerciseName}</span>
            </button>
          </div>
        ))}

        {/* Workout Session Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">
            Notas de la Sesión / Sensaciones
          </label>
          <textarea
            rows={2}
            placeholder="ej. Increíble congestión en pierna, descansos de 45s muy exigentes pero efectivos..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-emerald-500"
          />
        </div>

        {/* Big Complete Workout button */}
        <div className="pt-4 pb-12 text-center">
          <button
            id="btn-complete-workout-bottom"
            onClick={handleCompleteWorkout}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-transform active:scale-98 cursor-pointer"
          >
            Terminar y Guardar Entrenamiento
          </button>
        </div>
      </div>

      {/* Finished Workout Summary Modal */}
      {showSummaryModal && finishedSummary && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                ¡Gran Trabajo Atleta!
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] mt-1">
                Entrenamiento Registrado
              </h3>
              <p className="text-xs text-slate-400 mt-1">{finishedSummary.routineName}</p>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Duración</span>
                <span className="text-lg font-bold text-white">
                  {finishedSummary.durationMinutes} min
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Calorías</span>
                <span className="text-lg font-bold text-amber-400">
                  ~{finishedSummary.caloriesBurned} kcal
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Volumen</span>
                <span className="text-lg font-bold text-indigo-400">
                  {finishedSummary.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tus datos han sido sincronizados con el historial y ya forman parte de tus gráficos de
              progreso.
            </p>

            <button
              id="btn-close-summary"
              onClick={() => {
                setShowSummaryModal(false);
                onFinishWorkout(finishedSummary);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
            >
              Continuar al Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
