import { Member, WeightEntry, WorkoutSession, UserProfile } from '../types';

export interface MacroSplit {
  grams: number;
  kcal: number;
  percentage: number;
  perKg: number;
}

export interface MealOption {
  id: string;
  name: string;
  category: 'desayuno' | 'comida' | 'merienda_pre' | 'cena' | 'snack';
  title: string;
  description: string;
  approxKcal: number;
  approxProteinGrams: number;
  approxCarbsGrams: number;
  approxFatGrams: number;
  timing: string;
  icon: string;
}

export type ProgressTrend = 'optimal_loss' | 'rapid_loss' | 'plateau' | 'healthy_gain' | 'maintenance' | 'starting';

export interface NutritionAssessment {
  // Member baseline
  memberName: string;
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  currentWeight: number;
  initialWeight: number;
  targetWeight: number;
  goal: string;
  allergiesOrNotes?: string;

  // New user status
  isNewUserWithoutSessions: boolean;
  plannedDaysPerWeek: number;

  // Metabolic calculations
  bmr: number; // Basal Metabolic Rate (kcal)
  activityLevelFactor: number;
  activityLabel: string;
  tdee: number; // Total Daily Energy Expenditure (kcal)
  targetDailyCalories: number; // Caloric target adjusted to goal & progress
  calorieDelta: number; // Deficit or Surplus (-450, +300, etc.)

  // Historical progress evaluation
  trend: ProgressTrend;
  trendHeadline: string;
  trendAdvice: string;
  recentWeightChangeKg: number;
  daysAnalyzed: number;
  workoutsInHistory: number;
  avgKcalBurnedPerWorkout: number;

  // Macros breakdown
  macros: {
    protein: MacroSplit;
    carbs: MacroSplit;
    fats: MacroSplit;
  };
  fiberGrams: number;
  waterLiters: number;

  // Peri-workout guidelines
  periWorkout: {
    preWorkout: string;
    postWorkout: string;
    intraWorkout: string;
  };

  // Sample meal recommendations
  suggestedMeals: MealOption[];
}

/**
 * Calcula la Tasa Metabólica Basal (Mifflin-St Jeor)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' = 'male'
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Analiza el historial real de pesajes y entrenamientos de la persona
 */
export function calculatePersonalizedNutrition(params: {
  member?: Member | null;
  profile?: UserProfile;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  overrideGender?: 'male' | 'female';
  plannedDaysPerWeek?: number;
}): NutritionAssessment {
  const { member, profile, weightLogs, workoutLogs, overrideGender, plannedDaysPerWeek = 4 } = params;

  // 1. Identify gender (or infer from member data)
  const inferredGender: 'male' | 'female' =
    overrideGender ||
    (member?.gender === 'Mujer' || profile?.gender === 'Mujer' ? 'female' : 'male');

  const memberName = member?.name || profile?.name || 'Socio Alfa & Omega';
  const age = member?.age || 27;
  const heightCm = member?.heightCm || profile?.heightCm || 172;

  // Chronological weight logs
  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : (member?.initialWeight || profile?.initialWeight || 80);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : (member?.currentWeight || profile?.currentWeight || 80);
  const targetWeight = member?.targetWeight || profile?.targetWeight || 75;
  const goal = member?.goal || profile?.goal || 'Quema de Grasa';
  const allergiesOrNotes = member?.medicalNotes;

  // Check if this is a new user without previous sessions
  const workoutsInHistory = workoutLogs.length;
  const isNewUserWithoutSessions = workoutsInHistory === 0;

  // 2. Evaluate historical weight trends (last 2-4 entries)
  let trend: ProgressTrend = 'starting';
  let trendHeadline = 'Comenzando Plan Nutricional';
  let trendAdvice = 'Registra tus pesajes semanales y entrenamientos para ajustar tus calorías con precisión.';
  let recentWeightChangeKg = sortedWeights.length >= 2 ? Number((currentWeight - initialWeight).toFixed(1)) : 0;
  let daysAnalyzed = sortedWeights.length >= 2 ? 14 : 0;

  if (isNewUserWithoutSessions) {
    trend = 'starting';
    trendHeadline = '⭐ Nuevo Socio: Plan de Adaptación Nutricional';
    trendAdvice = `¡Bienvenido a Alfa & Omega Gym! Al ser nuevo socio y no tener sesiones anteriores registradas, tu plan se calcula para tu meta de "${goal}" con una frecuencia proyectada de ${plannedDaysPerWeek} días por semana. Conforme comiences a registrar tus rutinas en el gimnasio, tus macros y gasto diario se calibrarán automáticamente.`;
  } else if (sortedWeights.length >= 2) {
    const recentSub = sortedWeights.slice(-4);
    const firstRecent = recentSub[0];
    const lastRecent = recentSub[recentSub.length - 1];
    const daysDiff = Math.max(
      1,
      Math.round(
        (new Date(lastRecent.date).getTime() - new Date(firstRecent.date).getTime()) /
          (1000 * 3600 * 24)
      )
    );
    daysAnalyzed = daysDiff;
    const changeInPeriod = Number((lastRecent.weight - firstRecent.weight).toFixed(2));
    const weeklyRate = Number(((changeInPeriod / daysDiff) * 7).toFixed(2));

    const isWeightLossGoal = goal.toLowerCase().includes('grasa') || goal.toLowerCase().includes('peso') || goal.toLowerCase().includes('definición');
    const isHypertrophyGoal = goal.toLowerCase().includes('muscul') || goal.toLowerCase().includes('hipertrofia') || goal.toLowerCase().includes('volumen');

    if (isWeightLossGoal) {
      if (weeklyRate < -1.2) {
        trend = 'rapid_loss';
        trendHeadline = '⚠️ Pérdida Acelerada de Peso (-' + Math.abs(weeklyRate) + ' kg/semana)';
        trendAdvice = 'Estás bajando a un ritmo mayor a 1.2 kg por semana. Existe riesgo de catabolismo (pérdida de masa muscular) y caída del gasto metabólico. Se ajustan +200 kcal y se incrementa la proteína para blindar tus músculos.';
      } else if (weeklyRate >= -0.15 && daysDiff >= 12) {
        trend = 'plateau';
        trendHeadline = '🛑 Meseta / Estancamiento Detectado (' + changeInPeriod + ' kg en ' + daysDiff + ' días)';
        trendAdvice = 'Tu peso no ha variado en los últimos registros. Tu cuerpo se adaptó a las calorías actuales. Recomendamos un déficit de -150 kcal adicionales o realizar un día de "Refeed" con carbohidratos limpios para reactivar tu leptina.';
      } else if (weeklyRate < -0.2 && weeklyRate >= -1.0) {
        trend = 'optimal_loss';
        trendHeadline = '⭐ Ritmo Óptimo de Quema de Grasa (' + weeklyRate + ' kg/semana)';
        trendAdvice = '¡Excelente respuesta metabólica! Tu tasa de pérdida se ubica en el rango ideal de 0.4 a 0.8 kg semanales. Máxima quema de grasa protegiendo el tejido contráctil muscular.';
      } else {
        trend = 'optimal_loss';
        trendHeadline = 'Evolución Positiva';
        trendAdvice = 'Mantén la constancia en el plan. Tus comidas están sincronizadas con tu actividad física.';
      }
    } else if (isHypertrophyGoal) {
      if (weeklyRate > 0.6) {
        trend = 'plateau';
        trendHeadline = 'Aumento Rápido (+ ' + weeklyRate + ' kg/semana)';
        trendAdvice = 'Estás subiendo más de 0.5 kg por semana, lo cual podría acumular grasa innecesaria. Ajustamos a un superávit moderado de +250 kcal para masa muscular limpia.';
      } else if (weeklyRate >= 0.1 && weeklyRate <= 0.4) {
        trend = 'healthy_gain';
        trendHeadline = '💪 Ganancia Muscular Magra Sostenida';
        trendAdvice = '¡Gran progreso! Estás ganando peso al ritmo perfecto de hipertrofia controlada con sobrecarga progresiva en el gimnasio.';
      } else {
        trend = 'maintenance';
        trendHeadline = 'Fase de Construcción';
        trendAdvice = 'Incrementamos un superávit estratégico para estimular la síntesis de nuevas fibras musculares.';
      }
    } else {
      trend = 'maintenance';
      trendHeadline = 'Recomposición Corporal & Mantenimiento';
      trendAdvice = 'Buscamos intercambiar grasa por músculo magro con calorías de mantenimiento e ingesta alta de proteína.';
    }
  }

  // 3. Activity Level from Workout Sessions or Planned Frequency for New Users
  const avgKcalBurnedPerWorkout = workoutsInHistory > 0
    ? Math.round(workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 400), 0) / workoutsInHistory)
    : 450;

  let activityLevelFactor = 1.48; // default moderate
  let activityLabel = 'Entrenamiento Regular Alfa & Omega (3-4 días/sem)';

  if (isNewUserWithoutSessions) {
    // New users without previous sessions: calculate based on target planned frequency
    if (plannedDaysPerWeek <= 2) {
      activityLevelFactor = 1.32;
      activityLabel = 'Adaptación Inicial Suave (1-2 días/sem proyectados)';
    } else if (plannedDaysPerWeek <= 4) {
      activityLevelFactor = 1.48;
      activityLabel = 'Frecuencia Recomendada Alfa & Omega (3-4 días/sem proyectados)';
    } else if (plannedDaysPerWeek === 5) {
      activityLevelFactor = 1.60;
      activityLabel = 'Frecuencia Intensa (5 días/sem proyectados)';
    } else {
      activityLevelFactor = 1.72;
      activityLabel = 'Alto Rendimiento / Atleta (6 días/sem proyectados)';
    }
  } else {
    // Existing users with actual session history
    if (workoutsInHistory >= 15) {
      activityLevelFactor = 1.65;
      activityLabel = 'Atleta Frecuente (4-6 días/sem - Historial comprobado)';
    } else if (workoutsInHistory >= 4) {
      activityLevelFactor = 1.48;
      activityLabel = 'Entrenamiento Regular (3-4 días/sem - Historial comprobado)';
    } else {
      activityLevelFactor = 1.40;
      activityLabel = 'Fase de Arranque (Registrando primeras sesiones)';
    }
  }

  // 4. BMR and TDEE
  const bmr = calculateBMR(currentWeight, heightCm, age, inferredGender);
  const tdee = Math.round(bmr * activityLevelFactor);

  // 5. Target Daily Calories
  let targetDailyCalories = tdee;
  let calorieDelta = 0;

  const isWeightLoss = goal.toLowerCase().includes('grasa') || goal.toLowerCase().includes('peso') || goal.toLowerCase().includes('definición');
  const isMuscleGain = goal.toLowerCase().includes('muscul') || goal.toLowerCase().includes('hipertrofia') || goal.toLowerCase().includes('volumen');

  if (isWeightLoss) {
    // Normal deficit 20%
    let deficit = 450;
    if (trend === 'rapid_loss') {
      deficit = 250; // soften deficit to preserve muscle
    } else if (trend === 'plateau') {
      deficit = 550; // deepen deficit slightly
    }
    calorieDelta = -deficit;
    targetDailyCalories = Math.max(bmr, tdee - deficit); // Never lower than basal safely
  } else if (isMuscleGain) {
    let surplus = 350;
    if (trend === 'plateau') surplus = 200; // if gained too fast
    calorieDelta = surplus;
    targetDailyCalories = tdee + surplus;
  } else {
    // Recomp: close to maintenance
    calorieDelta = 0;
    targetDailyCalories = tdee;
  }

  // 6. Macronutrient distribution based on current body mass
  // Protein: 1.8 to 2.2 g per kg (in deficit or hypertrophy, high protein preserves LBM)
  let proteinPerKg = 2.0;
  if (isWeightLoss) proteinPerKg = 2.2;
  if (isMuscleGain) proteinPerKg = 2.0;
  if (trend === 'rapid_loss') proteinPerKg = 2.3;

  const proteinGrams = Math.round(currentWeight * proteinPerKg);
  const proteinKcal = proteinGrams * 4;

  // Fats: 0.85 to 1.0 g per kg (healthy hormones, at least 22% of total calories)
  let fatPerKg = 0.9;
  let fatsGrams = Math.round(currentWeight * fatPerKg);
  let fatsKcal = fatsGrams * 9;

  // Guard: Fats should not be less than 20% of total calories
  if (fatsKcal < targetDailyCalories * 0.20) {
    fatsKcal = Math.round(targetDailyCalories * 0.22);
    fatsGrams = Math.round(fatsKcal / 9);
    fatPerKg = Number((fatsGrams / currentWeight).toFixed(2));
  }

  // Carbs: The remainder of daily calories
  let carbsKcal = Math.max(300, targetDailyCalories - proteinKcal - fatsKcal);
  let carbsGrams = Math.round(carbsKcal / 4);
  let carbsPerKg = Number((carbsGrams / currentWeight).toFixed(2));

  // Actual percentages
  const finalTotalKcal = proteinKcal + carbsKcal + fatsKcal;
  const proteinPercent = Math.round((proteinKcal / finalTotalKcal) * 100);
  const carbsPercent = Math.round((carbsKcal / finalTotalKcal) * 100);
  const fatsPercent = 100 - proteinPercent - carbsPercent;

  // Fiber: ~14g per 1000 kcal
  const fiberGrams = Math.round((targetDailyCalories / 1000) * 14);

  // Water: 35 ml per kg + 500ml for workout
  const waterLiters = Number(((currentWeight * 0.038) + 0.6).toFixed(1));

  // 7. Peri-workout guidelines tailored for Alfa & Omega Gym
  const periWorkout = {
    preWorkout: '1 a 2 horas antes de entrenar en el gym: consume 25-35g de carbohidratos de asimilación media (ej. avena o fruta) con 20g de proteína magra (claras, yogur griego o atún). Evita grasas pesadas para digestión rápida.',
    postWorkout: 'Dentro de los 90 minutos posteriores al entrenamiento: 30-40g de proteína de alto valor biológico (pollo, res magra, batido de whey) + 40-50g de carbohidratos (arroz, papa o camote) para frenar el catabolismo y reponer el glucógeno gastado.',
    intraWorkout: 'Durante tu rutina en el gym: mantén un sorbo de agua cada 10-15 minutos (~500 a 700 ml durante la sesión completa). Si tu rutina excede 60 minutos con series pesadas, añade una pizca de sal marina o electrolitos.',
  };

  // 8. Practical Mexican Fitness Meal Options
  const suggestedMeals: MealOption[] = [
    {
      id: 'm1',
      category: 'desayuno',
      name: 'Desayuno Anabólico',
      title: 'Huevos al Gusto con Espinacas y Frijoles de la Olla',
      description: '3 huevos enteros + 2 claras con espinacas y jitomate, 1/2 taza de frijoles de la olla y 2 tortillas de maíz nixtamalizadas.',
      approxKcal: Math.round(targetDailyCalories * 0.28),
      approxProteinGrams: Math.round(proteinGrams * 0.28),
      approxCarbsGrams: Math.round(carbsGrams * 0.25),
      approxFatGrams: Math.round(fatsGrams * 0.32),
      timing: '07:30 - 09:00 AM',
      icon: '🍳',
    },
    {
      id: 'm2',
      category: 'comida',
      name: 'Comida Principal',
      title: 'Pechuga Asada al Carbón con Arroz Integral y Aguacate',
      description: '160g de pechuga de pollo a la plancha, 1 taza de arroz blanco o integral cocido, 1/3 de aguacate hass y ensalada verde abundante con limón y sal marina.',
      approxKcal: Math.round(targetDailyCalories * 0.35),
      approxProteinGrams: Math.round(proteinGrams * 0.38),
      approxCarbsGrams: Math.round(carbsGrams * 0.38),
      approxFatGrams: Math.round(fatsGrams * 0.30),
      timing: '01:30 - 03:00 PM',
      icon: '🍗',
    },
    {
      id: 'm3',
      category: 'merienda_pre',
      name: 'Pre-Entreno / Merienda',
      title: 'Bowl de Avena con Plátano y Proteína o Crema de Cacahuate',
      description: '50g de hojuelas de avena hidratadas con agua o leche deslactosada, 1/2 plátano en rodajas y 1 scoop de proteína en polvo (o 1 cdta de crema de cacahuate natural).',
      approxKcal: Math.round(targetDailyCalories * 0.17),
      approxProteinGrams: Math.round(proteinGrams * 0.16),
      approxCarbsGrams: Math.round(carbsGrams * 0.22),
      approxFatGrams: Math.round(fatsGrams * 0.15),
      timing: '1.5 hrs antes de entrenar en el gym',
      icon: '🍌',
    },
    {
      id: 'm4',
      category: 'cena',
      name: 'Cena Ligera & Reconstructora',
      title: 'Tacos de Bistec Magro o Atún Sellado con Nopales Asados',
      description: '140g de carne magra o atún a la plancha sobre 3 nopales asados y 1 tortilla, pico de gallo y rebanadas de calabacita asada.',
      approxKcal: Math.round(targetDailyCalories * 0.20),
      approxProteinGrams: Math.round(proteinGrams * 0.18),
      approxCarbsGrams: Math.round(carbsGrams * 0.15),
      approxFatGrams: Math.round(fatsGrams * 0.23),
      timing: '08:00 - 09:30 PM',
      icon: '🥩',
    },
  ];

  return {
    memberName,
    gender: inferredGender,
    age,
    heightCm,
    currentWeight,
    initialWeight,
    targetWeight,
    goal,
    allergiesOrNotes,

    isNewUserWithoutSessions,
    plannedDaysPerWeek,

    bmr,
    activityLevelFactor,
    activityLabel,
    tdee,
    targetDailyCalories,
    calorieDelta,

    trend,
    trendHeadline,
    trendAdvice,
    recentWeightChangeKg,
    daysAnalyzed,
    workoutsInHistory,
    avgKcalBurnedPerWorkout,

    macros: {
      protein: {
        grams: proteinGrams,
        kcal: proteinKcal,
        percentage: proteinPercent,
        perKg: proteinPerKg,
      },
      carbs: {
        grams: carbsGrams,
        kcal: carbsKcal,
        percentage: carbsPercent,
        perKg: carbsPerKg,
      },
      fats: {
        grams: fatsGrams,
        kcal: fatsKcal,
        percentage: fatsPercent,
        perKg: fatPerKg,
      },
    },
    fiberGrams,
    waterLiters,

    periWorkout,
    suggestedMeals,
  };
}

/**
 * Genera el texto del plan de nutrición para compartir por WhatsApp
 */
export function generateNutritionWhatsAppText(assessment: NutritionAssessment): string {
  const dateStr = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let text = `🥗 *ALFA & OMEGA GYM - PLAN NUTRICIONAL PERSONALIZADO* 🥗\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Socio:* ${assessment.memberName}\n`;
  text += `🎯 *Objetivo:* ${assessment.goal}\n`;
  if (assessment.isNewUserWithoutSessions) {
    text += `⭐ *Fase:* Socio Nuevo / Plan de Adaptación (${assessment.plannedDaysPerWeek} días/sem planeados)\n`;
  }
  text += `📅 *Fecha:* ${dateStr}\n`;
  text += `⚖️ *Peso Actual:* ${assessment.currentWeight} kg | *Meta:* ${assessment.targetWeight} kg\n\n`;

  text += `📊 *DIAGNÓSTICO METABÓLICO*\n`;
  text += `• *Tasa Metabólica Basal (TMB):* ${assessment.bmr} kcal/día\n`;
  text += `• *Gasto Diario Total (TDEE):* ${assessment.tdee} kcal/día (${assessment.activityLabel})\n`;
  text += `• *Calorías Objetivo:* *${assessment.targetDailyCalories} kcal/día* (${assessment.calorieDelta > 0 ? `+${assessment.calorieDelta} kcal superávit` : `${assessment.calorieDelta} kcal déficit`})\n`;
  text += `• *Estado según tu historial:* ${assessment.trendHeadline}\n`;
  if (assessment.isNewUserWithoutSessions) {
    text += `• *Nota de Inicio:* Sin sesiones previas aún. Tus calorías y macros se recalibrarán en tiempo real al registrar tus entrenamientos.\n`;
  }
  text += `\n`;

  text += `🍗 *DISTRIBUCIÓN DE MACRONUTRIENTES*\n`;
  text += `• *Proteína:* *${assessment.macros.protein.grams} g* (${assessment.macros.protein.perKg} g/kg · ${assessment.macros.protein.percentage}%)\n`;
  text += `• *Carbohidratos:* *${assessment.macros.carbs.grams} g* (${assessment.macros.carbs.perKg} g/kg · ${assessment.macros.carbs.percentage}%)\n`;
  text += `• *Grasas Saludables:* *${assessment.macros.fats.grams} g* (${assessment.macros.fats.perKg} g/kg · ${assessment.macros.fats.percentage}%)\n`;
  text += `• *Fibra:* ${assessment.fiberGrams} g diarios\n`;
  text += `• *Agua Recomendada:* ${assessment.waterLiters} Litros / día 💧\n\n`;

  text += `⚡ *NUTRICIÓN EN EL GIMNASIO*\n`;
  text += `• *Pre-Entreno (1-2h antes):* ${assessment.periWorkout.preWorkout}\n`;
  text += `• *Post-Entreno (dentro de 90m):* ${assessment.periWorkout.postWorkout}\n\n`;

  text += `🍽️ *EJEMPLO DE DISTRIBUCIÓN DIARIA*\n`;
  assessment.suggestedMeals.forEach((meal) => {
    text += `• *${meal.name}* (~${meal.approxKcal} kcal, ${meal.approxProteinGrams}g proteína):\n  _${meal.title}_\n`;
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Elaborado en Alfa & Omega Gym con asesoría de la Dra. Sofía Méndez. ¡La disciplina en la cocina potencia tus resultados en el gym!_ 🦾`;

  return text;
}
