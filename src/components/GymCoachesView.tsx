import React, { useState } from 'react';
import { GymCoach, Member, CoachConsultation } from '../types';
import {
  Award,
  Clock,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Send,
  HelpCircle,
  ChevronRight,
  UserCheck,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface GymCoachesViewProps {
  coaches: GymCoach[];
  currentMember: Member | null;
  consultations: CoachConsultation[];
  onSendConsultation: (subject: string, message: string, coachId: string) => Promise<void>;
  onSelectAssignedCoach: (coachId: string, coachName: string) => Promise<void>;
}

export const GymCoachesView: React.FC<GymCoachesViewProps> = ({
  coaches,
  currentMember,
  consultations,
  onSendConsultation,
  onSelectAssignedCoach
}) => {
  const [selectedCoachForConsultation, setSelectedCoachForConsultation] = useState<GymCoach | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const memberConsultations = currentMember
    ? consultations.filter((c) => c.memberId === currentMember.id)
    : [];

  const handleOpenConsultation = (coach: GymCoach) => {
    setSelectedCoachForConsultation(coach);
    setSubject('');
    setMessage('');
    setSuccessNotice(null);
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoachForConsultation || !subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSendConsultation(subject, message, selectedCoachForConsultation.id);
      setSuccessNotice(`¡Tu consulta ha sido enviada a ${selectedCoachForConsultation.name}! Te responderá en sala o por la app.`);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSelectedCoachForConsultation(null);
        setSuccessNotice(null);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
            <AlfaOmegaLogo size="lg" variant="icon" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Space_Grotesk']">
                STAFF DE COACHES · <span className="text-red-500">ALFA &amp; OMEGA</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Presenciales
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Conoce a nuestros entrenadores oficiales en sala. Como socio de Alfa &amp; Omega Gym tienes derecho a asesoría de técnica en aparatos, ajuste de cargas y resolución de dudas de entrenamiento.
            </p>
          </div>
        </div>

        {currentMember && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-center sm:text-right shrink-0 w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-medium block">Tu Entrenador Asignado:</span>
            <span className="text-sm font-bold text-red-400 block mt-0.5">
              {currentMember.assignedCoachName || 'Sin asignar'}
            </span>
            <span className="text-[10px] text-slate-400">
              Membresía: <strong className="text-white font-mono">{currentMember.membershipNumber}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Grid of Gym Coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coaches.map((coach) => {
          const isAssigned = currentMember?.assignedCoachId === coach.id;

          return (
            <div
              key={coach.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between ${
                isAssigned ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Card Top: Photo & Main Info */}
                <div className="p-5 flex gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={coach.avatarUrl}
                      alt={coach.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <span
                      className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        coach.available ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      title={coach.available ? 'Disponible en sala' : 'En descanso'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          {coach.name}
                        </h3>
                        <p className="text-xs font-medium text-red-600 mt-0.5">
                          {coach.title}
                        </p>
                      </div>

                      {isAssigned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0">
                          <UserCheck className="w-3 h-3" />
                          Tu Coach
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Especialidad: <span className="text-slate-900">{coach.specialty}</span>
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{coach.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="px-5 pb-4 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{coach.bio}"
                  </p>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {coach.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1"
                      >
                        <Award className="w-2.5 h-2.5 text-red-500" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {coach.whatsappNumber && (
                    <a
                      href={`https://wa.me/${coach.whatsappNumber}?text=Hola%20Coach%20${encodeURIComponent(coach.name)},%20soy%20socio%20de%20Alfa%20y%20Omega%20Gym`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Enviar WhatsApp al coach"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <a
                    href={`tel:${coach.phone}`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Llamada al gimnasio"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Llamar</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {currentMember && !isAssigned && (
                    <button
                      onClick={() => onSelectAssignedCoach(coach.id, coach.name)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-600 font-semibold transition-colors cursor-pointer"
                    >
                      Elegir como mi coach
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenConsultation(coach)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Hacer Consulta</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consultation Modal / Drawer */}
      {selectedCoachForConsultation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCoachForConsultation.avatarUrl}
                  alt={selectedCoachForConsultation.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Consultar a {selectedCoachForConsultation.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedCoachForConsultation.title} · Alfa &amp; Omega Gym
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCoachForConsultation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {successNotice ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-900">{successNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsultation} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tema o Duda
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dolor lumbar en peso muerto / Ajuste de polea"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Detalla tu duda para el Coach
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explica qué ejercicio estás realizando, sensaciones o ajuste de rutina que requieres..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCoachForConsultation(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Consulta'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Member Consultations History */}
      {memberConsultations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Historial de Consultas con tus Coaches
            </h3>
          </div>

          <div className="space-y-3">
            {memberConsultations.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-800">
                    Coach: <strong className="text-red-600">{item.coachName}</strong>
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">{item.subject}</h4>
                  <p className="text-slate-600 mt-1">{item.message}</p>
                </div>

                {item.reply ? (
                  <div className="mt-2.5 p-3 bg-red-50/70 border border-red-100 rounded-lg text-slate-800">
                    <span className="font-bold text-red-700 block mb-0.5">
                      Respuesta de {item.coachName}:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{item.reply}</p>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendiente de revisión por el coach en su turno
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
