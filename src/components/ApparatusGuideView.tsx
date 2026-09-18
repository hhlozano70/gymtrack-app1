import React, { useState } from 'react';
import { Search, Dumbbell, Filter, Eye, Play, ShieldCheck, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { EXERCISE_MEDIA_DATABASE, ExerciseMedia } from '../data/exerciseMedia';
import { ExerciseVisualModal } from './ExerciseVisualModal';

export const ApparatusGuideView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<{
    name: string;
    view: 'gif' | 'apparatus';
  } | null>(null);

  // Active view toggle per card (gif vs apparatus)
  const [activeMediaTab, setActiveMediaTab] = useState<{ [id: string]: 'apparatus' | 'gif' }>({});

  const categories = [
    { id: 'all', label: 'Todos los Aparatos' },
    { id: 'Máquinas Guiadas', label: 'Máquinas Guiadas (Prensa, Smith, etc.)' },
    { id: 'Poleas & Cables', label: 'Torres de Poleas & Cables' },
    { id: 'Peso Libre & Bancos', label: 'Bancos & Peso Libre (Mancuernas)' },
    { id: 'Cardio & Funcional', label: 'Cardio, Remo & Funcional' },
  ];

  const filteredMedia = EXERCISE_MEDIA_DATABASE.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.apparatus.category === selectedCategory;

    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName = item.exerciseName.toLowerCase().includes(query);
    const matchesApparatus = item.apparatus.name.toLowerCase().includes(query);
    const matchesMuscle = item.muscleTarget.toLowerCase().includes(query);
    const matchesAliases = item.apparatus.aliases.some((a) => a.toLowerCase().includes(query));

    return matchesCategory && (matchesName || matchesApparatus || matchesMuscle || matchesAliases);
  });

  const toggleTab = (id: string, tab: 'apparatus' | 'gif') => {
    setActiveMediaTab((prev) => ({ ...prev, [id]: tab }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              Catálogo Visual para el Gimnasio
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Fotos reales & animaciones GIF
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            Guía de Aparatos & Máquinas de Gimnasio
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ¿Ves un ejercicio en tu rutina y no sabes cuál aparato es o cómo se llama en tu gimnasio?
            Explora las fotos de cada máquina, cómo identificarla, cómo regularla y mira el GIF animado
            del movimiento correcto.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por aparato, máquina o músculo (ej. prensa, smith, polea, pecho, sentadilla)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-300 text-sm focus:outline-emerald-500 shadow-xs font-medium placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 p-1"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Tipo:
          </span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-emerald-400 shadow-sm font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong>{filteredMedia.length}</strong> aparatos y ejercicios disponibles
        </span>
        <span className="text-emerald-700 font-medium hidden sm:inline">
          💡 Toca en "Ver GIF" o "Ver Máquina" en cualquier tarjeta para alternar la vista
        </span>
      </div>

      {/* Grid of Apparatus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMedia.map((item) => {
          const currentTab = activeMediaTab[item.id] || 'apparatus';

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Media Container (Photo or GIF) */}
              <div className="relative bg-slate-950 aspect-[16/10] sm:aspect-[16/9] overflow-hidden flex items-center justify-center">
                {currentTab === 'apparatus' ? (
                  <>
                    <img
                      src={item.apparatus.imageUrl}
                      alt={item.apparatus.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Foto del Aparato</span>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={item.gifUrl}
                      alt={`Movimiento de ${item.exerciseName}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-950/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <Play className="w-3 h-3 fill-current animate-pulse" />
                      <span>Movimiento en Bucle (GIF)</span>
                    </div>
                  </>
                )}

                {/* Switch view pill inside card header */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => toggleTab(item.id, 'apparatus')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'apparatus'
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Foto Máquina
                  </button>
                  <button
                    onClick={() => toggleTab(item.id, 'gif')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'gif'
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    GIF Ejercicio
                  </button>
                </div>

                {/* Bottom title overlay */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    {item.apparatus.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold truncate">
                    {currentTab === 'apparatus' ? item.apparatus.name : item.exerciseName}
                  </h3>
                </div>
              </div>

              {/* Card Body Information */}
              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Aliases pill row */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nombres comunes en gimnasios:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.apparatus.aliases.map((al, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                        >
                          {al}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* How to identify visual card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¿Cómo reconocer este aparato?</span>
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.apparatus.visualIdentification}
                    </p>
                  </div>

                  {/* Muscles Target */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700">Músculos:</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium text-[11px]">
                      {item.muscleTarget}
                    </span>
                  </div>

                  {/* Key Adjustment Tip */}
                  <div className="text-xs text-slate-600 flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Ajuste rápido:</strong>{' '}
                      {item.apparatus.howToAdjust[0]}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      setSelectedExerciseModal({
                        name: item.exerciseName,
                        view: currentTab,
                      })
                    }
                    className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Ver detalles completos, GIF & técnica</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Modal Viewer */}
      {selectedExerciseModal && (
        <ExerciseVisualModal
          exerciseName={selectedExerciseModal.name}
          isOpen={true}
          onClose={() => setSelectedExerciseModal(null)}
          initialView={selectedExerciseModal.view}
        />
      )}
    </div>
  );
};
