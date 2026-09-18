import React, { useState } from 'react';
import { Flame, Sparkles, Dumbbell, Clock, Target, ArrowRight, ShieldAlert, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { RecommendedRoutine, Routine } from '../types';
import { ExerciseVisualBadge } from './ExerciseVisualBadge';

interface CalorieRecommendViewProps {
  onApplyRoutine: (routine: Routine) => void;
  currentWeight: number;
}

export const CalorieRecommendView: React.FC<CalorieRecommendViewProps> = ({
  onApplyRoutine,
  currentWeight,
}) => {
  const [targetCalories, setTargetCalories] = useState<number>(450);
  const [goal, setGoal] = useState<string>('Quema de grasa acelerada y definición');
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [equipment, setEquipment] = useState<string>('Gimnasio completo (mancuernas, barras, poleas y cardio)');
  const [injuries, setInjuries] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendedRoutine | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/recommend-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories,
          goal,
          level,
          durationMinutes,
          equipment,
          injuries: injuries.trim() || 'Sin lesiones',
          userWeight: currentWeight,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el generador de rutinas.');
      }

      const data = await response.json();
      if (data.routine) {
        setRecommendation(data.routine);
      } else {
        throw new Error('Respuesta inesperada del servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No se pudo generar la recomendación en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertAndApply = () => {
    if (!recommendation) return;

    const newRoutine: Routine = {
      id: `ai-routine-${Date.now()}`,
      name: recommendation.title,
      description: `${recommendation.goal} - Diseñada para un gasto calórico estimado de ${recommendation.targetCalories} kcal.`,
      difficulty: level,
      estimatedCalories: recommendation.targetCalories,
      durationMinutes: recommendation.estimatedDurationMinutes,
      goal: 'Quema de Grasa',
      isCustom: true,
      exercises: recommendation.exercises.map((ex, i) => ({
        exerciseId: `ai-ex-${i}`,
        exerciseName: ex.name,
        muscleGroup: ex.category || 'Full Body',
        targetSets: ex.sets,
        targetReps: ex.reps,
        suggestedRestSeconds: ex.restSeconds || 45,
        notes: ex.techniqueTip,
        sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
          id: `ai-s-${i}-${sIdx}`,
          setNumber: sIdx + 1,
          weight: 0,
          reps: parseInt(ex.reps.split('-')[0]) || 12,
          completed: false,
        })),
      })),
    };

    onApplyRoutine(newRoutine);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Generador Inteligente de Ejercicios por Déficit Calórico</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
          Recomendación de Ejercicios para Quema de Calorías & Pérdida de Peso
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Calcula y estructura los mejores tipos de ejercicios según tu meta de calorías, nivel y tiempo disponible en el gimnasio.
        </p>
      </div>

      {/* Form Controls Card */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
      >
        {/* Calorie Target Slider & Quick Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Objetivo de Gasto Calórico de la Sesión</span>
            </label>
            <span className="text-xl font-extrabold text-emerald-600 font-mono">
              {targetCalories} <span className="text-xs font-semibold text-slate-500">kcal</span>
            </span>
          </div>

          <input
            type="range"
            min="200"
            max="850"
            step="25"
            value={targetCalories}
            onChange={(e) => setTargetCalories(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>200 kcal (Ligero)</span>
            <span>450 kcal (Estándar)</span>
            <span>650 kcal (Avanzado)</span>
            <span>850 kcal (Extremo)</span>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { val: 300, label: '300 kcal (Recuperación activa)' },
              { val: 450, label: '450 kcal (Déficit óptimo)' },
              { val: 600, label: '600 kcal (Quema intensa)' },
              { val: 750, label: '750 kcal (Maratón metabólico)' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setTargetCalories(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  targetCalories === p.val
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal & Fitness Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Enfoque de Pérdida de Peso
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-emerald-500 bg-white"
            >
              <option value="Quema de grasa acelerada y definición">
                Quema de grasa acelerada y definición
              </option>
              <option value="Déficit preservando masa muscular y fuerza">
                Déficit preservando masa muscular y fuerza
              </option>
              <option value="Acondicionamiento metabólico con descansos cortos">
                Acondicionamiento metabólico con descansos cortos
              </option>
              <option value="Baja de peso para principiantes sin impacto articular">
                Baja de peso para principiantes (sin impacto articular)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Nivel de Condición Física
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    level === lvl
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration & Equipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Tiempo Disponible (minutos)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 75].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    durationMinutes === m
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Equipamiento Disponible
            </label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-emerald-500 bg-white"
            >
              <option value="Gimnasio completo (mancuernas, barras, poleas y cardio)">
                Gimnasio completo (mancuernas, barras, poleas y cardio)
              </option>
              <option value="Sólo mancuernas y banco">Sólo mancuernas y banco</option>
              <option value="Máquinas guiadas y poleas (bajo riesgo articular)">
                Máquinas guiadas y poleas (bajo impacto)
              </option>
              <option value="Peso corporal y cardio HIIT">Peso corporal y cardio HIIT</option>
            </select>
          </div>
        </div>

        {/* Considerations / Injuries */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
            Limitaciones o molestias (opcional)
          </label>
          <input
            type="text"
            placeholder="ej. Evitar impacto en rodilla derecha, molestia en hombro al presionar..."
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-emerald-500"
          />
        </div>

        <button
          id="btn-generate-routine"
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Calculando combinación óptima de ejercicios...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Generar Rutina Personalizada para {targetCalories} kcal</span>
            </>
          )}
        </button>
      </form>

      {/* Error display */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Recommended Routine Result Card */}
      {recommendation && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Title & Action to add to routines */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Recomendación Personalizada Lista</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
                {recommendation.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                  <Flame className="w-3.5 h-3.5" /> ~{recommendation.targetCalories} kcal estimadas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {recommendation.estimatedDurationMinutes} minutos
                </span>
                <span>• Nivel {level}</span>
              </div>
            </div>

            <button
              id="btn-apply-ai-routine"
              onClick={handleConvertAndApply}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span>Cargar en Mis Rutinas</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Warmup tip */}
          {recommendation.warmup && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                <Zap className="w-4 h-4 text-amber-600" /> Calentamiento Activo Obligatorio:
              </span>
              <p>{recommendation.warmup}</p>
            </div>
          )}

          {/* Exercises list with calories and technique */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs text-slate-400">
              Estructura de Ejercicios Multiarticulares & Quema Calórica
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {recommendation.exercises.map((ex, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {ex.name}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {ex.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-slate-800">
                        {ex.sets} series x {ex.reps}
                      </span>
                      <span className="text-slate-400">| Descanso: {ex.restSeconds}s</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ~{ex.estimatedCaloriesBurned} kcal
                      </span>
                    </div>
                  </div>

                  {ex.techniqueTip && (
                    <p className="text-xs text-slate-500 pl-8 leading-relaxed">
                      <span className="font-semibold text-slate-700">Técnica clave:</span> {ex.techniqueTip}
                    </p>
                  )}

                  {/* Visual Guide: GIF and Gym Machine Photo */}
                  <div className="pl-8 pt-1">
                    <ExerciseVisualBadge exerciseName={ex.name} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Advice & Cooldown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {recommendation.nutritionAdvice && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  Estrategia Nutricional para este Déficit:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {recommendation.nutritionAdvice}
                </p>
              </div>
            )}

            {recommendation.cooldown && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Vuelta a la Calma & Estiramiento:</span>
                <p className="text-slate-600 leading-relaxed">{recommendation.cooldown}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
