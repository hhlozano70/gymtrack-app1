import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Dumbbell,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface StrengthProgressChartProps {
  workoutLogs: WorkoutSession[];
}

export type MetricType = 'maxWeight' | 'estimated1RM' | 'totalVolume';

interface ExerciseDataPoint {
  date: string;
  displayDate: string;
  routineName: string;
  maxWeight: number;
  estimated1RM: number;
  totalVolume: number;
  bestSetReps: number;
  allSets: { weight: number; reps: number; completed: boolean }[];
}

// Calculate Epley 1RM formula: weight * (1 + reps / 30)
export function calculateEpley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export const StrengthProgressChart: React.FC<StrengthProgressChartProps> = ({
  workoutLogs,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('maxWeight');
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');

  // Chronologically sorted sessions
  const chronologicalLogs = useMemo(() => {
    return [...workoutLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [workoutLogs]);

  // Extract all unique exercises with weights recorded
  const exercisesStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        muscleGroup: string;
        history: ExerciseDataPoint[];
        currentPR: number;
        best1RM: number;
        firstWeight: number;
        latestWeight: number;
        totalSessions: number;
      }
    >();

    chronologicalLogs.forEach((session) => {
      const sessionDate = session.date;
      const displayDate = new Date(sessionDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });

      session.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed !== false);
        const validSets = completedSets.length > 0 ? completedSets : ex.sets;
        const weightedSets = validSets.filter((s) => s.weight > 0);

        // If it's a weighted exercise
        if (weightedSets.length > 0) {
          let maxW = 0;
          let best1RM = 0;
          let bestReps = 0;
          let totalVol = 0;

          weightedSets.forEach((s) => {
            if (s.weight > maxW) {
              maxW = s.weight;
              bestReps = s.reps;
            }
            const e1rm = calculateEpley1RM(s.weight, s.reps);
            if (e1rm > best1RM) {
              best1RM = e1rm;
            }
            totalVol += s.weight * (s.reps || 1);
          });

          const dataPoint: ExerciseDataPoint = {
            date: sessionDate,
            displayDate,
            routineName: session.routineName,
            maxWeight: maxW,
            estimated1RM: best1RM,
            totalVolume: totalVol,
            bestSetReps: bestReps,
            allSets: weightedSets,
          };

          if (!map.has(ex.name)) {
            map.set(ex.name, {
              name: ex.name,
              muscleGroup: ex.muscleGroup || 'General',
              history: [dataPoint],
              currentPR: maxW,
              best1RM: best1RM,
              firstWeight: maxW,
              latestWeight: maxW,
              totalSessions: 1,
            });
          } else {
            const existing = map.get(ex.name)!;
            existing.history.push(dataPoint);
            if (maxW > existing.currentPR) {
              existing.currentPR = maxW;
            }
            if (best1RM > existing.best1RM) {
              existing.best1RM = best1RM;
            }
            existing.latestWeight = maxW;
            existing.totalSessions += 1;
          }
        }
      });
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalSessions - a.totalSessions || b.currentPR - a.currentPR
    );
  }, [chronologicalLogs]);

  // Selected exercise for single view
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(() => {
    return exercisesStats.length > 0 ? exercisesStats[0].name : '';
  });

  // Keep selectedExerciseName in sync if exercises change
  const currentExercise = useMemo(() => {
    return (
      exercisesStats.find((e) => e.name === selectedExerciseName) ||
      exercisesStats[0] ||
      null
    );
  }, [exercisesStats, selectedExerciseName]);

  // If no weighted logs exist yet
  if (exercisesStats.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <Dumbbell className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
            Seguimiento de Tendencias de Fuerza
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aún no has registrado cargas en tus ejercicios. En cuanto completes tu primer
            entrenamiento indicando los kilos levantados, aquí verás la curva de progresión, tu récord
            personal (PR) y la estimación de 1RM con gráficos interactivos de Recharts.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progression deltas for the active exercise
  const firstDataPoint = currentExercise?.history[0];
  const lastDataPoint = currentExercise?.history[currentExercise.history.length - 1];
  const netWeightGain =
    lastDataPoint && firstDataPoint
      ? Number((lastDataPoint.maxWeight - firstDataPoint.maxWeight).toFixed(1))
      : 0;
  const net1RMGain =
    lastDataPoint && firstDataPoint
      ? Number((lastDataPoint.estimated1RM - firstDataPoint.estimated1RM).toFixed(1))
      : 0;
  const percentageProgress =
    firstDataPoint && firstDataPoint.maxWeight > 0
      ? Math.round((netWeightGain / firstDataPoint.maxWeight) * 100)
      : 0;

  // Prepare comparison data across top 3-4 exercises
  const comparisonData = useMemo(() => {
    const topExercises = exercisesStats.slice(0, 4);
    // Gather all distinct dates
    const dateMap = new Map<string, { displayDate: string; [key: string]: any }>();

    topExercises.forEach((ex) => {
      ex.history.forEach((pt) => {
        if (!dateMap.has(pt.date)) {
          dateMap.set(pt.date, {
            displayDate: pt.displayDate,
            date: pt.date,
          });
        }
        const entry = dateMap.get(pt.date)!;
        entry[ex.name] =
          selectedMetric === 'maxWeight'
            ? pt.maxWeight
            : selectedMetric === 'estimated1RM'
            ? pt.estimated1RM
            : pt.totalVolume;
      });
    });

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [exercisesStats, selectedMetric]);

  const comparisonColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899'];

  const metricLabels: Record<MetricType, { title: string; unit: string; description: string }> = {
    maxWeight: {
      title: 'Carga Máxima',
      unit: 'kg',
      description: 'El mayor peso levantado en la sesión para este ejercicio.',
    },
    estimated1RM: {
      title: '1RM Estimado (Epley)',
      unit: 'kg',
      description: 'Máxima fuerza teórica para 1 repetición calculada con la fórmula de Epley.',
    },
    totalVolume: {
      title: 'Volumen Acumulado',
      unit: 'kg',
      description: 'Suma de (peso x repeticiones) de todas las series completadas.',
    },
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Recharts Engine
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Tendencias de Carga a lo largo del tiempo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Tendencias de Fuerza en Ejercicios Clave
          </h2>
          <p className="text-xs text-slate-500">
            Analiza tu sobrecarga progresiva y cómo evoluciona tu fuerza en cada ejercicio del gimnasio.
          </p>
        </div>

        {/* View mode toggle (Individual vs Comparativa) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-center">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ejercicio Individual
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'compare'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparar Top Ejercicios
          </button>
        </div>
      </div>

      {/* Exercise Selection Pills (when in single mode) */}
      {viewMode === 'single' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" /> Selecciona un ejercicio para ver su curva:
            </span>
            <span className="font-mono text-[11px]">
              {exercisesStats.length} ejercicios registrados
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {exercisesStats.map((ex) => {
              const isSelected = ex.name === (currentExercise?.name || '');
              return (
                <button
                  key={ex.name}
                  type="button"
                  onClick={() => setSelectedExerciseName(ex.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-emerald-400 shadow-sm font-bold scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  <span>{ex.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-white text-slate-500'
                    }`}
                  >
                    PR {ex.currentPR} kg
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards for the selected exercise */}
      {viewMode === 'single' && currentExercise && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Récord Personal (PR)
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {currentExercise.currentPR} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {currentExercise.muscleGroup}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" /> 1RM Teórico Pico
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              ~{currentExercise.best1RM} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Fórmula de Epley
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Progresión Neta
            </span>
            <div
              className={`text-2xl font-black font-mono ${
                netWeightGain >= 0 ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              {netWeightGain > 0 ? `+${netWeightGain}` : netWeightGain}{' '}
              <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {percentageProgress >= 0 ? `+${percentageProgress}%` : `${percentageProgress}%`} desde inicio
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Sesiones Registradas
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {currentExercise.totalSessions} <span className="text-xs font-semibold text-slate-500">días</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {currentExercise.history.length} tomas de datos
            </p>
          </div>
        </div>
      )}

      {/* Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold self-start">
          <button
            type="button"
            onClick={() => setSelectedMetric('maxWeight')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedMetric === 'maxWeight'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carga Máxima (kg)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('estimated1RM')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedMetric === 'estimated1RM'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1RM Estimado (kg)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('totalVolume')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedMetric === 'totalVolume'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volumen Total (kg)
          </button>
        </div>

        <span className="text-xs text-slate-400 italic">
          {metricLabels[selectedMetric].description}
        </span>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'single' && currentExercise ? (
            <AreaChart
              data={currentExercise.history}
              margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit={` ${metricLabels[selectedMetric].unit}`}
                domain={['dataMin - 2', 'dataMax + 2']}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data: ExerciseDataPoint = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-750 p-3.5 rounded-2xl text-white shadow-xl space-y-2 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {new Date(data.date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            {data.routineName.split(':')[0]}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">Carga máxima:</span>
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              {data.maxWeight} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">1RM Estimado:</span>
                            <span className="font-mono text-indigo-300 font-semibold">
                              ~{data.estimated1RM} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">Volumen acumulado:</span>
                            <span className="font-mono text-slate-300 font-semibold">
                              {data.totalVolume.toLocaleString()} kg
                            </span>
                          </div>
                        </div>

                        {data.allSets.length > 0 && (
                          <div className="pt-1 border-t border-slate-800 text-[11px]">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                              Series registradas:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {data.allSets.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700"
                                >
                                  {s.weight}kg × {s.reps}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Reference line showing current Personal Record */}
              <ReferenceLine
                y={
                  selectedMetric === 'maxWeight'
                    ? currentExercise.currentPR
                    : selectedMetric === 'estimated1RM'
                    ? currentExercise.best1RM
                    : undefined
                }
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Récord: ${
                    selectedMetric === 'maxWeight'
                      ? currentExercise.currentPR
                      : currentExercise.best1RM
                  } kg`,
                  fill: '#059669',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#strengthGradient)"
                activeDot={{
                  r: 6,
                  fill: '#10b981',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          ) : (
            /* Comparison Multi-Line Chart */
            <LineChart
              data={comparisonData}
              margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit={` ${metricLabels[selectedMetric].unit}`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-750 p-3.5 rounded-2xl text-white shadow-xl space-y-2 min-w-[200px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-800 pb-1">
                          Fecha: {label}
                        </span>
                        <div className="space-y-1.5">
                          {payload.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs gap-3"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-300 font-medium truncate max-w-[140px]">
                                  {item.name}
                                </span>
                              </div>
                              <span className="font-bold font-mono text-white">
                                {item.value} {metricLabels[selectedMetric].unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                iconType="circle"
              />

              {exercisesStats.slice(0, 4).map((ex, idx) => (
                <Line
                  key={ex.name}
                  type="monotone"
                  dataKey={ex.name}
                  name={ex.name}
                  stroke={comparisonColors[idx % comparisonColors.length]}
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Pedagogical Guidance on Progressive Overload */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <strong className="text-slate-900 font-bold block">
            Principio de Sobrecarga Progresiva:
          </strong>
          <span>
            Para estimular hipertrofia y quema calórica continua, busca incrementar gradualmente el
            peso o las repeticiones cada 1-2 semanas en tus ejercicios multiarticulares principales.
          </span>
        </div>
      </div>
    </div>
  );
};
