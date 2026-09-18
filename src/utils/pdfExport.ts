import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WeightEntry, WorkoutSession, Routine, UserProfile } from '../types';

export function exportGymDataToPDF(options: {
  profile: UserProfile;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  routines: Routine[];
}) {
  const { profile, weightLogs, workoutLogs, routines } = options;
  const JsPdfConstructor = typeof jsPDF === 'function' ? jsPDF : (jsPDF as any).default || (jsPDF as any).jsPDF;
  const doc = new JsPdfConstructor({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable as any).default || ((d: any, opts: any) => (d as any).autoTable(opts));

  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const accentColor: [number, number, number] = [220, 38, 38]; // crimson red (Alfa & Omega Gym brand)
  const lightGray: [number, number, number] = [241, 245, 249]; // slate-100
  const textDark: [number, number, number] = [15, 23, 42]; // slate-900

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ALFA & OMEGA GYM', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Informe Oficial de Rendimiento en Gimnasio y Evolución Corporal', 14, 26);

  // Date of Generation on right
  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(`Fecha: ${todayStr}`, 196, 18, { align: 'right' });
  doc.text('Objetivo: Quema de Grasa & Rendimiento', 196, 26, { align: 'right' });

  // Accent line
  doc.setFillColor(...accentColor);
  doc.rect(0, 38, 210, 2.5, 'F');

  // 2. Athlete Profile & Summary Metrics Box
  let currentY = 47;
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, currentY, 182, 34, 3, 3, 'F');

  // Metrics calculation
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight : profile.initialWeight;
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : profile.currentWeight;
  const weightDiff = Number((latestWeight - initialWeight).toFixed(1));
  const diffSign = weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`;
  const totalVolumeAll = workoutLogs.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalCaloriesAll = workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Atleta: ${profile.name || 'Usuario'}`, 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Estatura: ${profile.heightCm} cm   |   Meta de Peso: ${profile.targetWeight} kg`, 20, currentY + 16);

  // Stats in boxes
  const statBoxY = currentY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  // Stat 1: Current Weight
  doc.setTextColor(...primaryColor);
  doc.text(`Peso Actual: ${latestWeight} kg`, 20, statBoxY + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text(`Cambio neto: ${diffSign} kg`, 20, statBoxY + 11);

  // Stat 2: Sessions completed
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Sesiones: ${workoutLogs.length} entrenos`, 80, statBoxY + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Total quemado: ~${totalCaloriesAll.toLocaleString()} kcal`, 80, statBoxY + 11);

  // Stat 3: Volume lifted
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Volumen Total: ${totalVolumeAll.toLocaleString()} kg`, 140, statBoxY + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Promedio: ${workoutLogs.length ? Math.round(totalVolumeAll / workoutLogs.length) : 0} kg/sesión`, 140, statBoxY + 11);

  currentY += 42;

  // 3. Section Title: Historial de Peso Corporal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text('1. Historial y Evolución del Peso Corporal', 14, currentY);

  const weightTableRows = weightLogs.map((entry, index) => {
    let diffText = '-';
    if (index > 0) {
      const diff = (entry.weight - weightLogs[index - 1].weight).toFixed(1);
      diffText = Number(diff) > 0 ? `+${diff} kg` : `${diff} kg`;
    }
    return [
      entry.date,
      `${entry.weight} kg`,
      diffText,
      entry.bodyFatPercentage ? `${entry.bodyFatPercentage}%` : 'N/D',
      entry.waistCm ? `${entry.waistCm} cm` : 'N/D',
      entry.notes || 'Progreso continuo'
    ];
  });

  runAutoTable(doc, {
    startY: currentY + 4,
    head: [['Fecha', 'Peso Registrado', 'Variación', '% Grasa Corp.', 'Cintura', 'Notas / Sensaciones']],
    body: weightTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // 4. Section Title: Historial de Entrenamientos
  currentY = ((doc as any).lastAutoTable?.finalY || currentY + 40) + 12;

  // Check if we need page break
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text('2. Registro de Sesiones en Gimnasio', 14, currentY);

  const workoutTableRows = workoutLogs.map((session) => {
    const dateFormatted = new Date(session.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const exerciseNames = session.exercises.map(e => e.name).slice(0, 3).join(', ');
    const moreSuffix = session.exercises.length > 3 ? ` (+${session.exercises.length - 3} más)` : '';

    return [
      dateFormatted,
      session.routineName,
      `${session.durationMinutes} min`,
      `${session.caloriesBurned} kcal`,
      `${session.totalVolumeKg.toLocaleString()} kg`,
      exerciseNames + moreSuffix
    ];
  });

  runAutoTable(doc, {
    startY: currentY + 4,
    head: [['Fecha', 'Rutina Ejecutada', 'Duración', 'Gasto Calórico', 'Volumen Levantado', 'Ejercicios Principales']],
    body: workoutTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85], // slate-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Section 3: Rutinas Activas
  currentY = ((doc as any).lastAutoTable?.finalY || currentY + 40) + 12;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text('3. Catálogo de Rutinas Activas', 14, currentY);

  const routinesTableRows = routines.map((r) => [
    r.name,
    r.goal,
    r.difficulty,
    `${r.durationMinutes} min`,
    `~${r.estimatedCalories} kcal`,
    `${r.exercises.length} ejercicios (${r.exercises.map(e => e.exerciseName).slice(0, 2).join(', ')}...)`
  ]);

  runAutoTable(doc, {
    startY: currentY + 4,
    head: [['Nombre de Rutina', 'Objetivo', 'Nivel', 'Tiempo Est.', 'Calorías Est.', 'Estructura']],
    body: routinesTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Alfa & Omega Gym - Reporte oficial generado para motivación y seguimiento continuo de entrenamiento y rendimiento físico.',
      14,
      288
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 288, { align: 'right' });
  }

  // Download trigger
  const fileDate = new Date().toISOString().split('T')[0];
  doc.save(`Alfa_Omega_Gym_Reporte_${fileDate}.pdf`);
}
