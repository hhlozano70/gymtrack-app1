import React, { useState, useMemo } from 'react';
import { Member, WeightEntry, WorkoutSession, UserProfile, GymCoach } from '../types';
import { calculatePersonalizedNutrition, generateNutritionWhatsAppText, NutritionAssessment } from '../utils/nutritionEngine';
import { createWhatsAppShareUrl } from '../utils/whatsappReport';
import { getMemberWorkoutLogs, getMemberWeightLogs } from '../utils/storage';
import {
  Utensils,
  Flame,
  Scale,
  Activity,
  Droplets,
  Share2,
  Sparkles,
  Info,
  Clock,
  Apple,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  User,
  Send,
  Bot,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NutritionRecommendationViewProps {
  currentMember: Member | null;
  members: Member[];
  coaches: GymCoach[];
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  profile: UserProfile;
  currentRole: 'member' | 'coach' | 'admin' | null;
  onNavigateToRoutines?: () => void;
}

export const NutritionRecommendationView: React.FC<NutritionRecommendationViewProps> = ({
  currentMember,
  members,
  coaches,
  weightLogs,
  workoutLogs,
  profile,
  currentRole,
  onNavigateToRoutines,
}) => {
  // If coach or admin, allow selecting which member to analyze
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentMember?.id || members[0]?.id || '');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [plannedDaysPerWeek, setPlannedDaysPerWeek] = useState<number>(4);

  // Interactive custom adjustment
  const [activeMealCategory, setActiveMealCategory] = useState<'all' | 'desayuno' | 'comida' | 'merienda_pre' | 'cena'>('all');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // AI Nutritionist Chat / Quick Consult state
  const [userQuery, setUserQuery] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string }>>([
    {
      q: '¿Cuánta agua debo tomar en el gimnasio y cuándo tomar proteína?',
      a: '¡Hola! Te recomiendo consumir 500-700 ml de agua en sorbos pequeños durante tu sesión. La proteína es más efectiva repartida en 3-4 tomas al día de 25-35g cada una, con una toma clave dentro de los 90 minutos posteriores al entrenamiento junto con carbohidratos para recargar glucógeno.',
      time: 'Hoy',
    },
  ]);

  // Target member
  const effectiveMember = useMemo(() => {
    if (currentRole === 'member' && currentMember) {
      return currentMember;
    }
    return members.find((m) => m.id === selectedMemberId) || currentMember || members[0] || null;
  }, [currentRole, currentMember, members, selectedMemberId]);

  // Load member-isolated workout and weight logs so each member has their authentic logs
  const memberWorkouts = useMemo(() => {
    if (currentRole === 'member') return workoutLogs;
    if (!effectiveMember) return [];
    return getMemberWorkoutLogs(effectiveMember.id);
  }, [currentRole, workoutLogs, effectiveMember]);

  const memberWeights = useMemo(() => {
    if (currentRole === 'member') return weightLogs;
    if (!effectiveMember) return [];
    return getMemberWeightLogs(effectiveMember.id, effectiveMember.currentWeight, effectiveMember.joinedDate);
  }, [currentRole, weightLogs, effectiveMember]);

  const assessment: NutritionAssessment = useMemo(() => {
    return calculatePersonalizedNutrition({
      member: effectiveMember,
      profile,
      weightLogs: memberWeights,
      workoutLogs: memberWorkouts,
      overrideGender: selectedGender,
      plannedDaysPerWeek,
    });
  }, [effectiveMember, profile, memberWeights, memberWorkouts, selectedGender, plannedDaysPerWeek]);

  const handleSendWhatsApp = () => {
    const text = generateNutritionWhatsAppText(assessment);
    const phone = effectiveMember?.phone || '';
    const url = createWhatsAppShareUrl(text, phone);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPlan = async () => {
    try {
      const text = generateNutritionWhatsAppText(assessment);
      await navigator.clipboard.writeText(text);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleAskNutritionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAskingAi) return;

    const queryToSend = userQuery.trim();
    setUserQuery('');
    setIsAskingAi(true);

    try {
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachType: 'nutrition',
          messages: [{ role: 'user', content: queryToSend }],
          userContext: {
            memberName: assessment.memberName,
            currentWeight: assessment.currentWeight,
            goal: assessment.goal,
            targetCalories: assessment.targetDailyCalories,
            level: assessment.activityLabel,
          },
        }),
      });

      const data = await res.json();
      setAiAnswers((prev) => [
        ...prev,
        {
          q: queryToSend,
          a: data.reply || 'Recuerda mantener constancia con tus requerimientos de proteína e hidratación diaria.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('AI chat error:', err);
      setAiAnswers((prev) => [
        ...prev,
        {
          q: queryToSend,
          a: 'Para tu objetivo de ' + assessment.goal + ', mantén un aporte de ' + assessment.macros.protein.grams + 'g de proteína al día y asegúrate de consumir carbohidratos complejos 1.5 horas antes de entrenar en Alfa & Omega Gym.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAskingAi(false);
    }
  };

  const filteredMeals = activeMealCategory === 'all'
    ? assessment.suggestedMeals
    : assessment.suggestedMeals.filter((m) => m.category === activeMealCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 uppercase tracking-wider">
              Alfa &amp; Omega Fitness Nutrition
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Ciencia y Dietética Deportiva
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-1">
            Recomendación Nutricional &amp; Macros por Persona
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Ajuste dinámico calculado con base en la <strong className="text-slate-700">báscula, sesiones registradas en el gimnasio</strong> y la meta física de cada socio.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleCopyPlan}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedWhatsApp ? '¡Copiado!' : 'Copiar Plan'}</span>
          </button>

          <button
            id="btn-whatsapp-nutrition-share"
            onClick={handleSendWhatsApp}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar a WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Member Selector Bar (visible for coaches/admins or quick profile switch) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
            <User className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Socio Seleccionado para Análisis
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                {assessment.memberName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {effectiveMember?.branch || 'León'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Member Dropdown if multiple members */}
          {(currentRole === 'coach' || currentRole === 'admin' || members.length > 1) && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Cambiar Socio:</span>
              <select
                value={effectiveMember?.id || ''}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.branch} - {m.currentWeight}kg)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Biological Sex Toggle (Affects Mifflin-St Jeor equation) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGender === 'male'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hombre
            </button>
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGender === 'female'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mujer
            </button>
          </div>
        </div>
      </div>

      {/* New User Adaption Plan Banner (shown when user has 0 previous workout sessions) */}
      {assessment.isNewUserWithoutSessions && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-300/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                ⭐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Plan de Inicio y Adaptación para Nuevo Socio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    0 Sesiones Previas
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Como eres un nuevo socio en Alfa &amp; Omega Gym y aún no cuentas con sesiones anteriores registradas, tus calorías y macronutrientes se calculan en base a tu objetivo (<strong>{assessment.goal}</strong>) y a los <strong>días planeados para entrenar</strong>. Al registrar tus rutinas, tus estadísticas se recalibrarán en tiempo real.
                </p>
              </div>
            </div>

            {onNavigateToRoutines && (
              <button
                onClick={onNavigateToRoutines}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto active:scale-95"
              >
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Registrar Primer Entrenamiento</span>
              </button>
            )}
          </div>

          {/* Interactive Planned Training Frequency Selector */}
          <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                ¿Cuántos días por semana planeas entrenar en Alfa &amp; Omega Gym?
              </span>
              <span className="text-[11px] text-slate-500">
                Selecciona tu frecuencia para ajustar tu gasto calórico proyectado:
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { days: 2, label: '2 días', desc: '1.32x' },
                { days: 3, label: '3 días', desc: '1.48x' },
                { days: 4, label: '4 días (Recomendado)', desc: '1.48x' },
                { days: 5, label: '5 días', desc: '1.60x' },
                { days: 6, label: '6 días (Atleta)', desc: '1.72x' },
              ].map((item) => (
                <button
                  key={item.days}
                  onClick={() => setPlannedDaysPerWeek(item.days)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    plannedDaysPerWeek === item.days
                      ? 'bg-slate-900 text-white shadow-xs scale-105'
                      : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History & Progress Trend Alert Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-sm transition-all ${
          assessment.trend === 'rapid_loss'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : assessment.trend === 'plateau'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : assessment.trend === 'optimal_loss'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-indigo-50 border-indigo-200 text-indigo-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                assessment.trend === 'rapid_loss'
                  ? 'bg-rose-600 text-white'
                  : assessment.trend === 'plateau'
                  ? 'bg-amber-600 text-white'
                  : assessment.trend === 'optimal_loss'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {assessment.trend === 'rapid_loss' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : assessment.trend === 'plateau' ? (
                <TrendingDown className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {assessment.trendHeadline}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/80 border border-current">
                  Meta: {assessment.goal}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed opacity-90">
                {assessment.trendAdvice}
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-current text-right self-end sm:self-auto font-mono text-xs">
            <span className="text-[10px] font-bold uppercase block opacity-70">Ajuste Aplicado</span>
            <span className="text-base font-black">
              {assessment.calorieDelta > 0 ? `+${assessment.calorieDelta}` : assessment.calorieDelta} kcal
            </span>
          </div>
        </div>
      </div>

      {/* 3 Key Metabolic Targets Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: TMB */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">TMB (Gasto en Reposo)</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {assessment.bmr.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kcal/día</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Energía mínima vital que quema tu organismo para respirar y latir.
          </p>
        </div>

        {/* Card 2: TDEE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">TDEE (Gasto Total + Gym)</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-indigo-600 font-mono">
              {assessment.tdee.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kcal/día</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {assessment.isNewUserWithoutSessions ? (
              <span>
                Multiplicador <strong>{assessment.activityLevelFactor}x</strong> (nuevo socio, {assessment.plannedDaysPerWeek} días/sem proyectados).
              </span>
            ) : (
              <span>
                Multiplicador <strong>{assessment.activityLevelFactor}x</strong> con {assessment.workoutsInHistory} entrenamientos registrados.
              </span>
            )}
          </p>
        </div>

        {/* Card 3: Target Daily Calories */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-bold uppercase tracking-wider text-amber-400">Calorías Diarias Objetivo</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {assessment.targetDailyCalories.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-300">kcal recomendadas</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            {assessment.calorieDelta < 0 ? 'Déficit controlado para quemar grasa magra.' : 'Superávit limpio para hipertrofia.'}
          </p>
        </div>
      </div>

      {/* Macronutrient Distribution Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-red-600" />
              <span>Distribución de Macronutrientes por Peso Corporal</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculado para el peso de {assessment.currentWeight} kg con enfoque en conservación y desarrollo muscular.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              {assessment.waterLiters}L Agua / día
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {assessment.fiberGrams}g Fibra / día
            </span>
          </div>
        </div>

        {/* 3 Macro Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Protein */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between text-xs text-rose-900 font-bold mb-1">
              <span>Proteína (Blindaje Muscular)</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-950 font-mono">
                {assessment.macros.protein.percentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-rose-700 font-mono">
                {assessment.macros.protein.grams}
              </span>
              <span className="text-sm font-bold text-rose-900">gramos</span>
            </div>
            <div className="text-xs text-rose-800 mt-2 space-y-1">
              <p>• <strong>{assessment.macros.protein.perKg} g/kg</strong> de peso corporal</p>
              <p>• ~{assessment.macros.protein.kcal} kcal (4 kcal/g)</p>
              <p className="text-[11px] text-rose-700 pt-1">Pollo, res magra, atún, huevos, claras, proteína en polvo.</p>
            </div>
          </div>

          {/* Carbs */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
              <span>Carbohidratos (Energía en el Gym)</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-mono">
                {assessment.macros.carbs.percentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-amber-700 font-mono">
                {assessment.macros.carbs.grams}
              </span>
              <span className="text-sm font-bold text-amber-900">gramos</span>
            </div>
            <div className="text-xs text-amber-800 mt-2 space-y-1">
              <p>• <strong>{assessment.macros.carbs.perKg} g/kg</strong> de peso corporal</p>
              <p>• ~{assessment.macros.carbs.kcal} kcal (4 kcal/g)</p>
              <p className="text-[11px] text-amber-700 pt-1">Avena, arroz integral o blanco, papa, camote, tortillas de maíz, frutas.</p>
            </div>
          </div>

          {/* Healthy Fats */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
              <span>Grasas Saludables (Hormonas &amp; Articulaciones)</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-950 font-mono">
                {assessment.macros.fats.percentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-emerald-700 font-mono">
                {assessment.macros.fats.grams}
              </span>
              <span className="text-sm font-bold text-emerald-900">gramos</span>
            </div>
            <div className="text-xs text-emerald-800 mt-2 space-y-1">
              <p>• <strong>{assessment.macros.fats.perKg} g/kg</strong> de peso corporal</p>
              <p>• ~{assessment.macros.fats.kcal} kcal (9 kcal/g)</p>
              <p className="text-[11px] text-emerald-700 pt-1">Aguacate, aceite de oliva virgen, nueces, almendras, yemas de huevo.</p>
            </div>
          </div>
        </div>

        {/* Visual Macro Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-slate-600 font-semibold">
            <span>Composición Calórica Total ({assessment.targetDailyCalories} kcal)</span>
            <span className="font-mono font-bold">100% Cubierto</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
            <div
              style={{ width: `${assessment.macros.protein.percentage}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Proteína: ${assessment.macros.protein.percentage}%`}
            />
            <div
              style={{ width: `${assessment.macros.carbs.percentage}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Carbohidratos: ${assessment.macros.carbs.percentage}%`}
            />
            <div
              style={{ width: `${assessment.macros.fats.percentage}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Grasas: ${assessment.macros.fats.percentage}%`}
            />
          </div>
        </div>
      </div>

      {/* Peri-Workout Timing Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Dumbbell className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-black text-slate-900">
            Nutrición Peri-Entrenamiento en Alfa &amp; Omega Gym
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>1. Pre-Entrenamiento</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {assessment.periWorkout.preWorkout}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Droplets className="w-4 h-4 text-amber-600" />
              <span>2. Intra-Entrenamiento</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {assessment.periWorkout.intraWorkout}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Post-Entrenamiento</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {assessment.periWorkout.postWorkout}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Daily Fitness Meals (Mexican Fitness Cuisine) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Apple className="w-5 h-5 text-red-600" />
              <span>Menú Sugerido de Comidas Prácticas &amp; Altas en Proteína</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alimentos frescos, accesibles y nutritivos sincronizados con tus horarios y metas.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveMealCategory('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMealCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveMealCategory('desayuno')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMealCategory === 'desayuno' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Desayuno
            </button>
            <button
              onClick={() => setActiveMealCategory('comida')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMealCategory === 'comida' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comida
            </button>
            <button
              onClick={() => setActiveMealCategory('merienda_pre')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMealCategory === 'merienda_pre' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pre-Entreno
            </button>
            <button
              onClick={() => setActiveMealCategory('cena')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeMealCategory === 'cena' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cena
            </button>
          </div>
        </div>

        {/* Meal cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-red-600 tracking-wider block">
                      {meal.name}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{meal.title}</h4>
                  </div>
                </div>

                <div className="text-right font-mono text-xs shrink-0">
                  <span className="font-black text-slate-900 text-sm">~{meal.approxKcal} kcal</span>
                  <span className="block text-[11px] text-rose-700 font-bold">
                    {meal.approxProteinGrams}g proteína
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {meal.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Horario sugerido: {meal.timing}
                </span>
                <span className="font-mono text-slate-600">
                  C: {meal.approxCarbsGrams}g | G: {meal.approxFatGrams}g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Sports Nutritionist Q&A (Dra. Sofía Méndez) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-white">
                  Consultorio Nutricional Deportivo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30">
                  Dra. Sofía Méndez
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Especialista en recomposición corporal y nutrición peri-entrenamiento en Alfa &amp; Omega Gym.
              </p>
            </div>
          </div>
        </div>

        {/* Q&A Thread */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {aiAnswers.map((item, idx) => (
            <div key={idx} className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 text-slate-200 self-end">
                <span className="font-bold text-red-400 block mb-1">Tu Consulta:</span>
                <p>"{item.q}"</p>
              </div>
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-center justify-between text-[11px] text-red-400 font-bold mb-1">
                  <span>Dra. Sofía Méndez (Nutrición Deportiva):</span>
                  <span className="text-slate-500 font-mono">{item.time}</span>
                </div>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Question Input Form */}
        <form onSubmit={handleAskNutritionist} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregunta sobre suplementos, qué comer si entrenas temprano, cómo evitar antojos..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={isAskingAi || !userQuery.trim()}
            className="px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-red-900/30"
          >
            <Send className="w-4 h-4" />
            <span>{isAskingAi ? 'Consultando...' : 'Consultar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
