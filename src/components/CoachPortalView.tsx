import React, { useState } from 'react';
import { GymCoach, Member, CoachConsultation, Routine } from '../types';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import {
  UserCheck,
  Users,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  LogOut,
  Dumbbell,
  ShieldCheck,
  Activity,
  HeartPulse,
  Eye
} from 'lucide-react';

interface CoachPortalViewProps {
  coach: GymCoach;
  members: Member[];
  consultations: CoachConsultation[];
  onReplyConsultation: (consultationId: string, reply: string) => Promise<void>;
  onLogout: () => void;
  onNavigateToRoutines: () => void;
  onNavigateToApparatus: () => void;
}

export const CoachPortalView: React.FC<CoachPortalViewProps> = ({
  coach,
  members,
  consultations,
  onReplyConsultation,
  onLogout,
  onNavigateToRoutines,
  onNavigateToApparatus,
}) => {
  const [replyTextMap, setReplyTextMap] = useState<{ [id: string]: string }>({});
  const [isSendingReply, setIsSendingReply] = useState<{ [id: string]: boolean }>({});
  const [selectedMemberModal, setSelectedMemberModal] = useState<Member | null>(null);

  // Filter members assigned to this coach
  const myMembers = members.filter(
    (m) => m.assignedCoachId === coach.id || m.assignedCoachName === coach.name
  );

  // Filter consultations for this coach
  const myConsultations = consultations.filter(
    (c) => c.coachId === coach.id || c.coachName === coach.name
  );

  const pendingCount = myConsultations.filter((c) => c.status === 'pending').length;

  const handleSendReply = async (consultationId: string) => {
    const text = replyTextMap[consultationId]?.trim();
    if (!text) return;

    setIsSendingReply((prev) => ({ ...prev, [consultationId]: true }));
    try {
      await onReplyConsultation(consultationId, text);
      setReplyTextMap((prev) => ({ ...prev, [consultationId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingReply((prev) => ({ ...prev, [consultationId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Coach Top Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-750 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={coach.avatarUrl}
              alt={coach.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-red-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk']">
                {coach.name}
              </h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-red-600/20 text-red-300 border border-red-500/30 font-bold">
                {coach.coachCode || 'STAFF'}
              </span>
            </div>

            <p className="text-sm text-red-400 font-bold mt-0.5">{coach.title}</p>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{coach.specialty}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                {coach.schedule}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {coach.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={onNavigateToRoutines}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Dumbbell className="w-3.5 h-3.5 text-red-400" />
            <span>Ver Rutinas del Gym</span>
          </button>

          <button
            onClick={onNavigateToApparatus}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guía de Aparatos</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cerrar sesión de coach"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{myMembers.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Socios Asignados a mi Cargo</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{pendingCount}</span>
            <span className="text-xs text-slate-500 font-semibold">Consultas Pendientes por Responder</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {myConsultations.length - pendingCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Asesorías Completadas</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Consultations, Right = Assigned Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Consultations Mailbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-black text-slate-900">
                Buzón de Consultas de Socios ({myConsultations.length})
              </h2>
            </div>
            {pendingCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                {pendingCount} pendientes
              </span>
            )}
          </div>

          <div className="space-y-4">
            {myConsultations.map((consult) => {
              const isPending = consult.status === 'pending';
              const currentReply = replyTextMap[consult.id] || '';
              const sending = isSendingReply[consult.id];

              return (
                <div
                  key={consult.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 transition-all ${
                    isPending ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{consult.memberName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isPending ? 'Pendiente' : 'Respondida'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-red-600 mt-1">{consult.subject}</h4>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(consult.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    "{consult.message}"
                  </p>

                  {/* Previous Answer if any */}
                  {consult.reply && (
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tu Respuesta Enviada:</span>
                      </div>
                      <p className="leading-relaxed">{consult.reply}</p>
                    </div>
                  )}

                  {/* Response Form */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {consult.reply ? 'Enviar actualización o nuevo consejo:' : 'Responder al socio:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe tu recomendación técnica, corrección de postura o ajuste..."
                        value={currentReply}
                        onChange={(e) =>
                          setReplyTextMap({ ...replyTextMap, [consult.id]: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <button
                        type="button"
                        disabled={!currentReply.trim() || sending}
                        onClick={() => handleSendReply(consult.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{sending ? 'Enviando...' : 'Responder'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {myConsultations.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-xs">
                No tienes consultas registradas por el momento. Los socios pueden enviarte dudas desde la sección "Coaches".
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Assigned Members List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-black text-slate-900">Mis Socios Asignados</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">{myMembers.length} socios</span>
          </div>

          <div className="space-y-3">
            {myMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-red-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                    <span className="text-xs font-mono font-semibold text-red-600">
                      {member.membershipNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedMemberModal(member)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Ficha
                  </button>
                </div>

                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p>
                    Objetivo: <strong className="text-slate-800">{member.goal}</strong>
                  </p>
                  <p>
                    Peso actual:{' '}
                    <strong className="text-slate-800">{member.currentWeight} kg</strong> · Meta:{' '}
                    <strong className="text-slate-800">{member.targetWeight} kg</strong>
                  </p>
                  {member.medicalNotes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/70 p-1.5 rounded-lg">
                      ⚠️ {member.medicalNotes}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {myMembers.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
                No tienes socios asignados en este momento. El administrador puede asignarte socios desde el panel de control.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedMemberModal.name}</h3>
                <span className="font-mono text-xs text-red-600 font-bold">
                  {selectedMemberModal.membershipNumber} · Plan {selectedMemberModal.membershipType}
                </span>
              </div>
              <button
                onClick={() => setSelectedMemberModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Edad:</span>
                  <span className="font-bold text-slate-900">{selectedMemberModal.age} años</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estatura:</span>
                  <span className="font-bold text-slate-900">{selectedMemberModal.heightCm} cm</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Peso Actual:</span>
                  <span className="font-bold text-slate-900">
                    {selectedMemberModal.currentWeight} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Peso Meta:</span>
                  <span className="font-bold text-red-600">
                    {selectedMemberModal.targetWeight} kg
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Objetivo:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  {selectedMemberModal.goal}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Notas Médicas:</span>
                <p className="text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-amber-950">
                  {selectedMemberModal.medicalNotes || 'Sin precauciones registradas.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Contacto:</span>
                <p className="text-slate-600">
                  Tel: {selectedMemberModal.phone || 'N/A'} · Email:{' '}
                  {selectedMemberModal.email || 'N/A'}
                </p>
                {selectedMemberModal.emergencyContact && (
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Emergencia: {selectedMemberModal.emergencyContact}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberModal(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
