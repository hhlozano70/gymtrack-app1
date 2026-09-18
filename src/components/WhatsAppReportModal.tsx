import React, { useState } from 'react';
import { Member, WeightEntry, WorkoutSession, UserProfile } from '../types';
import { generateWhatsAppReportText, createWhatsAppShareUrl } from '../utils/whatsappReport';
import { X, Share2, Copy, Check, Phone, MessageSquare, ExternalLink, Sparkles, Flame } from 'lucide-react';

interface WhatsAppReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  profile?: UserProfile;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
}

export const WhatsAppReportModal: React.FC<WhatsAppReportModalProps> = ({
  isOpen,
  onClose,
  member,
  profile,
  weightLogs,
  workoutLogs,
}) => {
  const [phone, setPhone] = useState(member?.phone || '');
  const [customNotes, setCustomNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = generateWhatsAppReportText({
    member,
    profile,
    weightLogs,
    workoutLogs,
    customNotes,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendWhatsApp = () => {
    const url = createWhatsAppShareUrl(reportText, phone);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Reporte de Historia para WhatsApp
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Alfa &amp; Omega
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Envía tu evolución física, relación Kcal quemadas vs. peso y registros oficiales.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {/* Options form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Número de WhatsApp (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. 4771234567 o con lada +52"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Si lo dejas vacío, WhatsApp te permitirá elegir cualquier contacto o chat.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Nota personalizada o recomendación del coach:
              </label>
              <input
                type="text"
                placeholder="Ej. ¡Excelente constancia esta semana! Seguimos con déficit."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Se incluirá al final del reporte en WhatsApp.
              </span>
            </div>
          </div>

          {/* Report Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Vista previa del mensaje formateado:
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
              {reportText}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              El reporte incluye el desglose de <strong>Kcal vs Peso perdido</strong> calculado con la constante de <strong>7,700 kcal = 1 kg de grasa</strong>, las últimas fechas de pesaje, rutinas completadas y sucursal oficial.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
