import { Member, WeightEntry, WorkoutSession, UserProfile } from '../types';

export const KCAL_PER_KG_FAT = 7700; // Constante fisiológica: ~7,700 kcal por cada 1 kg de grasa corporal

export interface CalorieWeightEstimation {
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  netWeightLoss: number; // kg perdidos (positivo si bajó de peso)
  totalCaloriesBurned: number; // kcal quemadas en entrenamientos
  estimatedKgLostFromGym: number; // kg estimados quemados directamente por entrenamientos
  totalCaloricEquivalent: number; // kcal totales equivalentes al peso perdido (netWeightLoss * 7700)
  remainingWeightToGoal: number; // kg faltantes para la meta
  remainingCaloriesToGoal: number; // kcal de déficit necesarias para la meta
  estimatedWorkoutsNeeded: number; // sesiones de gym estimadas (a 450 kcal promedio)
  estimatedWeeksToGoal: number; // semanas con déficit diario de 500 kcal (~0.45 kg/semana)
}

/**
 * Calcula la relación detallada de Kcal vs Peso Perdido
 */
export function calculateCalorieWeightRelation(
  initialWeight: number,
  currentWeight: number,
  targetWeight: number,
  workoutLogs: WorkoutSession[],
  avgKcalPerWorkout = 450,
  dailyDeficitKcal = 500
): CalorieWeightEstimation {
  const netWeightLoss = Number((initialWeight - currentWeight).toFixed(2));
  const totalCaloriesBurned = workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  // 7,700 kcal por kg de grasa corporal
  const estimatedKgLostFromGym = Number((totalCaloriesBurned / KCAL_PER_KG_FAT).toFixed(2));
  const totalCaloricEquivalent = Math.max(0, Math.round(netWeightLoss * KCAL_PER_KG_FAT));

  const remainingWeightToGoal = Math.max(0, Number((currentWeight - targetWeight).toFixed(2)));
  const remainingCaloriesToGoal = Math.round(remainingWeightToGoal * KCAL_PER_KG_FAT);

  const workoutsNeeded = avgKcalPerWorkout > 0
    ? Math.ceil(remainingCaloriesToGoal / avgKcalPerWorkout)
    : 0;

  const weeklyDeficit = dailyDeficitKcal * 7;
  const weeksNeeded = weeklyDeficit > 0
    ? Number((remainingCaloriesToGoal / weeklyDeficit).toFixed(1))
    : 0;

  return {
    initialWeight,
    currentWeight,
    targetWeight,
    netWeightLoss,
    totalCaloriesBurned,
    estimatedKgLostFromGym,
    totalCaloricEquivalent,
    remainingWeightToGoal,
    remainingCaloriesToGoal,
    estimatedWorkoutsNeeded: workoutsNeeded,
    estimatedWeeksToGoal: weeksNeeded,
  };
}

export interface GenerateReportParams {
  member?: Member | null;
  profile?: UserProfile;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  avgKcalPerWorkout?: number;
  dailyDeficitKcal?: number;
  customNotes?: string;
}

/**
 * Genera el texto formateado para WhatsApp con formato nativo (*negrita*, emojis, viñetas)
 */
export function generateWhatsAppReportText(params: GenerateReportParams): string {
  const { member, profile, weightLogs, workoutLogs, avgKcalPerWorkout = 450, dailyDeficitKcal = 500, customNotes } = params;

  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : (member?.initialWeight || profile?.initialWeight || 80);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : (member?.currentWeight || profile?.currentWeight || 80);
  const targetWeight = member?.targetWeight || profile?.targetWeight || 75;

  const relation = calculateCalorieWeightRelation(
    initialWeight,
    currentWeight,
    targetWeight,
    workoutLogs,
    avgKcalPerWorkout,
    dailyDeficitKcal
  );

  const memberName = member?.name || profile?.name || 'Socio Alfa & Omega';
  const branch = member?.branch || 'León';
  const membershipNum = member?.membershipNumber ? ` · No. Socio: ${member.membershipNumber}` : '';
  const dateStr = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Recent weights (last 3 entries)
  const recentWeights = [...sortedWeights].reverse().slice(0, 4);

  // Recent workouts (last 3 sessions)
  const sortedWorkouts = [...workoutLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentWorkouts = sortedWorkouts.slice(0, 3);

  let message = `🏋️‍♂️ *ALFA & OMEGA GYM - REPORTE DE EVOLUCIÓN* 🏋️‍♂️\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Socio:* ${memberName}${membershipNum}\n`;
  message += `📍 *Sucursal:* ${branch}\n`;
  message += `📅 *Fecha del reporte:* ${dateStr}\n\n`;

  message += `⚖️ *ESTADO DEL PESO CORPORAL*\n`;
  message += `• *Peso Inicial:* ${initialWeight} kg\n`;
  message += `• *Peso Actual:* ${currentWeight} kg\n`;
  message += `• *Meta Objetivo:* ${targetWeight} kg\n`;
  if (relation.netWeightLoss > 0) {
    message += `• *Progreso:* -${relation.netWeightLoss} kg de peso perdido 🎉\n`;
  } else if (relation.netWeightLoss === 0) {
    message += `• *Progreso:* Manteniendo peso base (${currentWeight} kg)\n`;
  } else {
    message += `• *Progreso:* +${Math.abs(relation.netWeightLoss)} kg (fase de volumen/aumento)\n`;
  }
  message += `\n`;

  message += `🔥 *ESTIMADO DE RELACIÓN KCAL VS PESO PERDIDO*\n`;
  message += `(1 kg de grasa corporal ≈ 7,700 kcal de déficit metabólico)\n`;
  if (workoutLogs.length > 0) {
    message += `• *Gasto calórico en el Gym:* ~${relation.totalCaloriesBurned.toLocaleString()} kcal acumuladas en ${workoutLogs.length} entrenamientos\n`;
    message += `• *Grasa quemada directamente por ejercicio:* ~${relation.estimatedKgLostFromGym} kg\n`;
  } else {
    message += `• *Gasto calórico en el Gym:* ⭐ *Nuevo Socio* (0 sesiones anteriores registradas)\n`;
    message += `• *Fase de Inicio:* Tus calorías quemadas y grasa reducida comenzarán a medirse con tu primera rutina.\n`;
  }
  if (relation.netWeightLoss > 0) {
    message += `• *Déficit corporal total alcanzado:* ~${relation.totalCaloricEquivalent.toLocaleString()} kcal equivalentes\n`;
  }
  if (relation.remainingWeightToGoal > 0) {
    message += `• *Faltante para la Meta:* ${relation.remainingWeightToGoal} kg (~${relation.remainingCaloriesToGoal.toLocaleString()} kcal de déficit)\n`;
    message += `• *Proyección:* ~${relation.estimatedWorkoutsNeeded} entrenamientos en el gym (~${relation.estimatedWeeksToGoal} semanas con déficit de ${dailyDeficitKcal} kcal/día)\n`;
  } else {
    message += `• *¡Meta alcanzada o superada! Felicitaciones por tu disciplina!*\n`;
  }
  message += `\n`;

  if (recentWeights.length > 0) {
    message += `📊 *ÚLTIMOS PESAJES REGISTRADOS*\n`;
    recentWeights.forEach((w) => {
      const extra = w.bodyFatPercentage ? ` (${w.bodyFatPercentage}% grasa)` : '';
      message += `• ${w.date}: *${w.weight} kg*${extra}\n`;
    });
    message += `\n`;
  }

  if (recentWorkouts.length > 0) {
    message += `💪 *ÚLTIMAS SESIONES DE GIMNASIO*\n`;
    recentWorkouts.forEach((w) => {
      const dateOnly = w.date.includes('T') ? w.date.split('T')[0] : w.date;
      message += `• ${dateOnly}: *${w.routineName}* (~${w.caloriesBurned || 0} kcal, ${w.durationMinutes || 45} min)\n`;
    });
    message += `\n`;
  } else {
    message += `💪 *SESIONES DE GIMNASIO*\n`;
    message += `• ⭐ *Nuevo Socio:* Aún no tienes sesiones anteriores registradas. ¡Te esperamos en tu primer entrenamiento en Alfa & Omega Gym!\n\n`;
  }

  if (customNotes && customNotes.trim()) {
    message += `📝 *NOTAS ADICIONALES DEL ENTRENADOR / SOCIO*\n`;
    message += `"${customNotes.trim()}"\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Generado en Alfa & Omega Gym. La constancia supera el talento._ 🦾`;

  return message;
}

/**
 * Crea la URL oficial de WhatsApp con o sin número de teléfono
 */
export function createWhatsAppShareUrl(text: string, phone?: string): string {
  const cleanText = encodeURIComponent(text);
  if (phone && phone.trim()) {
    // Normalizar teléfono: eliminar espacios, guiones y paréntesis
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    // Si empieza sin + y tiene 10 dígitos (México), anteponer 52
    if (!cleanPhone.startsWith('+') && cleanPhone.length === 10) {
      cleanPhone = `52${cleanPhone}`;
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${cleanText}`;
  }
  return `https://api.whatsapp.com/send?text=${cleanText}`;
}
