import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, HelpCircle, ChevronRight, Maximize2, ShieldCheck, CheckCircle2, Eye } from 'lucide-react';
import { ExerciseMedia, getExerciseMedia } from '../data/exerciseMedia';

interface ExerciseVisualModalProps {
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'gif' | 'apparatus';
}

export const ExerciseVisualModal: React.FC<ExerciseVisualModalProps> = ({
  exerciseName,
  isOpen,
  onClose,
  initialView = 'gif',
}) => {
  const [activeTab, setActiveTab] = useState<'gif' | 'apparatus'>(initialView);
  const [imgError, setImgError] = useState(false);
  const [gifError, setGifError] = useState(false);

  if (!isOpen) return null;

  const media: ExerciseMedia = getExerciseMedia(exerciseName);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
              Guía Visual de Gimnasio
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {exerciseName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: GIF vs Aparato */}
        <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('gif')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gif'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping hidden sm:inline-block" />
            <span>🎬 Ver Movimiento (GIF)</span>
          </button>
          <button
            onClick={() => setActiveTab('apparatus')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'apparatus'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>🏋️‍♂️ Ver Máquina / Aparato (Foto)</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'gif' ? (
            <div className="space-y-4">
              {/* Animated GIF Container */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video sm:aspect-[16/10] flex items-center justify-center">
                {!gifError ? (
                  <img
                    src={media.gifUrl}
                    alt={`Animación de ${exerciseName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setGifError(true)}
                  />
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <Dumbbell className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold">Demostración en video disponible en la guía</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En bucle continuo</span>
                </div>
              </div>

              {/* Muscle Targets */}
              <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Grupos Musculares Trabajados
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                    🎯 Principal: {media.muscleTarget}
                  </span>
                  {media.secondaryMuscles.map((sec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technique Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Técnica & Puntos Clave de Ejecución</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {media.executionTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-850/60 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick switch to apparatus */}
              <button
                onClick={() => setActiveTab('apparatus')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>¿No sabes qué máquina buscar en el gym? Ver foto del aparato</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gym Apparatus Photo */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video sm:aspect-[16/10] flex items-center justify-center">
                {!imgError ? (
                  <img
                    src={media.apparatus.imageUrl}
                    alt={media.apparatus.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <Dumbbell className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold">{media.apparatus.name}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    {media.apparatus.category} • {media.apparatus.difficultyLevel}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold">
                    {media.apparatus.name}
                  </h3>
                </div>
              </div>

              {/* Common Gym Aliases */}
              <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Otros nombres con que la llaman en el gimnasio:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {media.apparatus.aliases.map((al, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs font-mono border border-slate-700"
                    >
                      {al}
                    </span>
                  ))}
                </div>
              </div>

              {/* How to identify it visually */}
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Eye className="w-4 h-4" />
                  <span>¿Cómo reconocer este aparato en tu gimnasio?</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {media.apparatus.visualIdentification}
                </p>
              </div>

              {/* How to adjust step by step */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cómo graduar y ajustar la máquina (Paso a paso)</span>
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {media.apparatus.howToAdjust.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-850/60 p-3 rounded-xl border border-slate-800/60"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch back to GIF */}
              <button
                onClick={() => setActiveTab('gif')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Volver a ver la animación del movimiento (GIF)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
