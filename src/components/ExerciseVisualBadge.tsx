import React, { useState } from 'react';
import { Eye, Dumbbell, Play } from 'lucide-react';
import { getExerciseMedia } from '../data/exerciseMedia';
import { ExerciseVisualModal } from './ExerciseVisualModal';

interface ExerciseVisualBadgeProps {
  exerciseName: string;
  variant?: 'compact' | 'full' | 'button-only';
  className?: string;
}

export const ExerciseVisualBadge: React.FC<ExerciseVisualBadgeProps> = ({
  exerciseName = '',
  variant = 'compact',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialView, setInitialView] = useState<'gif' | 'apparatus'>('gif');
  const media = getExerciseMedia(exerciseName || '');
  const apparatusName = media?.apparatus?.name || 'Aparato de Gimnasio';
  const apparatusShortName = apparatusName.split('(')[0]?.trim() || apparatusName;

  const handleOpen = (view: 'gif' | 'apparatus', e: React.MouseEvent) => {
    e.stopPropagation();
    setInitialView(view);
    setIsModalOpen(true);
  };

  if (variant === 'button-only') {
    return (
      <>
        <button
          type="button"
          onClick={(e) => handleOpen('gif', e)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-all cursor-pointer ${className}`}
          title="Ver GIF y foto de máquina"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Ver GIF & Máquina</span>
        </button>

        <ExerciseVisualModal
          exerciseName={exerciseName || ''}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialView={initialView}
        />
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs ${className}`}>
          <div className="flex items-center gap-2.5">
            {/* Mini GIF Thumbnail */}
            <div
              onClick={(e) => handleOpen('gif', e)}
              className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 cursor-pointer group"
              title="Click para ver GIF en grande"
            >
              <img
                src={media?.gifUrl || ''}
                alt={exerciseName || 'Ejercicio'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white/90 drop-shadow" />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Aparato en el gimnasio:
              </span>
              <button
                type="button"
                onClick={(e) => handleOpen('apparatus', e)}
                className="text-left font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Dumbbell className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{apparatusName}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={(e) => handleOpen('gif', e)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>GIF</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleOpen('apparatus', e)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Foto Máquina</span>
            </button>
          </div>
        </div>

        <ExerciseVisualModal
          exerciseName={exerciseName || ''}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialView={initialView}
        />
      </>
    );
  }

  // Compact variant (default)
  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {/* GIF Preview Pill */}
        <button
          type="button"
          onClick={(e) => handleOpen('gif', e)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
          title="Ver animación GIF del ejercicio"
        >
          <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
          <span>GIF</span>
        </button>

        {/* Apparatus Photo Pill */}
        <button
          type="button"
          onClick={(e) => handleOpen('apparatus', e)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
          title={`Ver foto del aparato: ${apparatusName}`}
        >
          <Dumbbell className="w-2.5 h-2.5 text-emerald-400" />
          <span className="truncate max-w-[130px]">{apparatusShortName}</span>
        </button>
      </div>

      <ExerciseVisualModal
        exerciseName={exerciseName || ''}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView={initialView}
      />
    </>
  );
};
