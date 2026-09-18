import React, { useState, useEffect, useRef } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RoutinesView } from './components/RoutinesView';
import { ApparatusGuideView } from './components/ApparatusGuideView';
import { WeightView } from './components/WeightView';
import { TimerView } from './components/TimerView';
import { ProgressView } from './components/ProgressView';
import { CalorieRecommendView } from './components/CalorieRecommendView';
import { NutritionRecommendationView } from './components/NutritionRecommendationView';
import { GymCoachesView } from './components/GymCoachesView';
import { MemberProfileView } from './components/MemberProfileView';
import { CoachPortalView } from './components/CoachPortalView';
import { InitialAccessPortal } from './components/InitialAccessPortal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { QuickTimerFloater } from './components/QuickTimerFloater';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import {
  getStoredRoutines,
  saveStoredRoutines,
  getStoredWeightLogs,
  saveStoredWeightLogs,
  getStoredWorkoutLogs,
  saveStoredWorkoutLogs,
  getStoredProfile,
  saveStoredProfile,
  getMemberWorkoutLogs,
  saveMemberWorkoutLogs,
  getMemberWeightLogs,
  saveMemberWeightLogs,
} from './utils/storage';
import {
  fetchMembersFromDb,
  saveMemberToDb,
  deleteMemberFromDb,
  fetchCoachesFromDb,
  saveCoachToDb,
  fetchConsultationsFromDb,
  saveConsultationToDb,
  seed20DemoMembers,
} from './utils/firebase';
import { exportGymDataToPDF } from './utils/pdfExport';
import { audioManager } from './utils/audio';
import {
  isMemberPaymentOverdue,
  renewMemberPaymentRecord,
} from './utils/paymentUtils';
import {
  Routine,
  WeightEntry,
  WorkoutSession,
  UserProfile,
  Member,
  GymCoach,
  CoachConsultation,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('routines');

  // Stored application states
  const [routines, setRoutines] = useState<Routine[]>(getStoredRoutines);
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>(getStoredWeightLogs);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSession[]>(getStoredWorkoutLogs);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);

  // Alfa & Omega Gym Database: Members, Coaches & Consultations
  const [members, setMembers] = useState<Member[]>([]);
  const [coaches, setCoaches] = useState<GymCoach[]>([]);
  const [consultations, setConsultations] = useState<CoachConsultation[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Authentication & Access Role: 'member' | 'coach' | 'admin' | null
  const [currentRole, setCurrentRole] = useState<'member' | 'coach' | 'admin' | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [currentCoach, setCurrentCoach] = useState<GymCoach | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Active workout session state
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<Routine | null>(null);

  // Global Quick Rest Timer
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restTotalSeconds, setRestTotalSeconds] = useState(0);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  const restIntervalRef = useRef<any>(null);

  // PDF Exporting state
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Initial Database Load from Firestore / Local Cache
  useEffect(() => {
    async function loadDatabase() {
      try {
        const [loadedMembers, loadedCoaches, loadedConsults] = await Promise.all([
          fetchMembersFromDb(),
          fetchCoachesFromDb(),
          fetchConsultationsFromDb(),
        ]);

        setMembers(loadedMembers);
        setCoaches(loadedCoaches);
        setConsultations(loadedConsults);

        // Check if there is an active session in localStorage
        const savedRole = localStorage.getItem('ao_session_role') as 'member' | 'coach' | 'admin' | null;
        const savedUserId = localStorage.getItem('ao_session_user_id');

        if (savedRole === 'member' && savedUserId) {
          const found = loadedMembers.find((m) => m.id === savedUserId);
          if (found && found.status !== 'inactive' && !isMemberPaymentOverdue(found)) {
            setCurrentRole('member');
            setCurrentMember(found);
            setProfile((prev) => ({
              ...prev,
              name: found.name,
              age: found.age,
              height: found.heightCm,
              currentWeight: found.currentWeight,
              targetWeight: found.targetWeight,
              goal: found.goal,
            }));
            const memberWorkouts = getMemberWorkoutLogs(found.id);
            const memberWeights = getMemberWeightLogs(found.id, found.currentWeight, found.joinedDate);
            setWorkoutLogs(memberWorkouts);
            setWeightLogs(memberWeights);
          } else if (found && isMemberPaymentOverdue(found)) {
            // Payment is overdue, clear session so portal requires settlement
            localStorage.removeItem('ao_session_role');
            localStorage.removeItem('ao_session_user_id');
          }
        } else if (savedRole === 'coach' && savedUserId) {
          const foundCoach = loadedCoaches.find((c) => c.id === savedUserId);
          if (foundCoach) {
            setCurrentRole('coach');
            setCurrentCoach(foundCoach);
            setActiveTab('coach_portal');
          }
        } else if (savedRole === 'admin') {
          setCurrentRole('admin');
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error loading gym database:', err);
      } finally {
        setIsDbLoaded(true);
      }
    }
    loadDatabase();
  }, []);

  // Sync state to storage
  useEffect(() => {
    saveStoredRoutines(routines);
  }, [routines]);

  useEffect(() => {
    if (currentMember) {
      saveMemberWeightLogs(weightLogs, currentMember.id);
    } else if (!currentRole) {
      saveStoredWeightLogs(weightLogs);
    }
  }, [weightLogs, currentMember, currentRole]);

  useEffect(() => {
    if (currentMember) {
      saveMemberWorkoutLogs(workoutLogs, currentMember.id);
    } else if (!currentRole) {
      saveStoredWorkoutLogs(workoutLogs);
    }
  }, [workoutLogs, currentMember, currentRole]);

  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  // Rest Timer countdown effect
  useEffect(() => {
    if (isRestRunning && restSecondsLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current);
            setIsRestRunning(false);
            if (restSoundEnabled) {
              audioManager.playRestComplete();
            }
            return 0;
          }
          if (restSoundEnabled && prev <= 4 && prev > 1) {
            audioManager.playBeep(750, 0.08);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }
    return () => clearInterval(restIntervalRef.current);
  }, [isRestRunning, restSecondsLeft, restSoundEnabled]);

  const handleTriggerRestTimer = (seconds: number) => {
    setRestTotalSeconds(seconds);
    setRestSecondsLeft(seconds);
    setIsRestRunning(true);
    if (restSoundEnabled) {
      audioManager.playBeep(880, 0.1);
    }
  };

  // Login Handlers
  const handleLoginMember = (member: Member) => {
    setCurrentRole('member');
    setCurrentMember(member);
    setCurrentCoach(null);
    setIsAdmin(false);

    localStorage.setItem('ao_session_role', 'member');
    localStorage.setItem('ao_session_user_id', member.id);

    setProfile((prev) => ({
      ...prev,
      name: member.name,
      age: member.age,
      height: member.heightCm,
      currentWeight: member.currentWeight,
      targetWeight: member.targetWeight,
      goal: member.goal,
    }));

    // Member-isolated workouts and weight logs
    const memberWorkouts = getMemberWorkoutLogs(member.id);
    const memberWeights = getMemberWeightLogs(member.id, member.currentWeight, member.joinedDate);
    setWorkoutLogs(memberWorkouts);
    setWeightLogs(memberWeights);

    setActiveTab('profile');
  };

  const handleLoginCoach = (coach: GymCoach) => {
    setCurrentRole('coach');
    setCurrentCoach(coach);
    setCurrentMember(null);
    setIsAdmin(false);

    localStorage.setItem('ao_session_role', 'coach');
    localStorage.setItem('ao_session_user_id', coach.id);

    setActiveTab('coach_portal');
  };

  const handleLoginAdmin = () => {
    setCurrentRole('admin');
    setIsAdmin(true);
    setCurrentMember(null);
    setCurrentCoach(null);

    localStorage.setItem('ao_session_role', 'admin');
    localStorage.removeItem('ao_session_user_id');

    setIsAdminPortalOpen(true);
    setActiveTab('routines');
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentMember(null);
    setCurrentCoach(null);
    setIsAdmin(false);
    setIsAdminPortalOpen(false);

    localStorage.removeItem('ao_session_role');
    localStorage.removeItem('ao_session_user_id');

    setWorkoutLogs([]);
    setWeightLogs([]);
    setActiveTab('routines');
  };

  // Database mutations for Members
  const handleSaveMember = async (memberToSave: Member) => {
    await saveMemberToDb(memberToSave);
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === memberToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = memberToSave;
        return copy;
      }
      return [memberToSave, ...prev];
    });

    if (currentMember && currentMember.id === memberToSave.id) {
      setCurrentMember(memberToSave);
      setProfile((prev) => ({
        ...prev,
        name: memberToSave.name,
        age: memberToSave.age,
        height: memberToSave.heightCm,
        currentWeight: memberToSave.currentWeight,
        targetWeight: memberToSave.targetWeight,
        goal: memberToSave.goal,
      }));
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    await deleteMemberFromDb(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (currentMember && currentMember.id === memberId) {
      handleLogout();
    }
  };

  const handleResetDemoMembers = async () => {
    const updated = await seed20DemoMembers(true);
    setMembers(updated);
  };

  const handleRenewMemberPayment = async (memberToRenew: Member) => {
    const renewed = renewMemberPaymentRecord(memberToRenew, 1);
    await handleSaveMember(renewed);
    handleLoginMember(renewed);
  };

  // Database mutations for Coaches
  const handleSaveCoach = async (coachToSave: GymCoach) => {
    await saveCoachToDb(coachToSave);
    setCoaches((prev) => {
      const idx = prev.findIndex((c) => c.id === coachToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = coachToSave;
        return copy;
      }
      return [...prev, coachToSave];
    });
    if (currentCoach && currentCoach.id === coachToSave.id) {
      setCurrentCoach(coachToSave);
    }
  };

  // Consultations
  const handleAddConsultation = async (consultation: CoachConsultation) => {
    await saveConsultationToDb(consultation);
    setConsultations((prev) => [consultation, ...prev]);
  };

  const handleReplyConsultation = async (consultationId: string, reply: string) => {
    const found = consultations.find((c) => c.id === consultationId);
    if (!found) return;
    const updated: CoachConsultation = {
      ...found,
      reply,
      status: 'answered',
      answeredAt: new Date().toISOString(),
    };
    await saveConsultationToDb(updated);
    setConsultations((prev) => prev.map((c) => (c.id === consultationId ? updated : c)));
  };

  // Workout Session Handlers
  const handleStartWorkout = (routine: Routine) => {
    setActiveWorkoutRoutine(routine);
    setIsWorkoutModalOpen(true);
  };

  const handleFinishWorkout = (session: WorkoutSession) => {
    const sessionWithMember: WorkoutSession = {
      ...session,
      memberId: currentMember?.id || 'guest',
    };
    setWorkoutLogs((prev) => {
      const updated = [sessionWithMember, ...prev];
      if (currentMember) {
        saveMemberWorkoutLogs(updated, currentMember.id);
      } else {
        saveStoredWorkoutLogs(updated);
      }
      return updated;
    });
    setIsWorkoutModalOpen(false);
    setActiveWorkoutRoutine(null);
    setActiveTab('progress');
  };

  const handleCancelWorkout = () => {
    if (window.confirm('¿Seguro que deseas salir del entrenamiento en curso?')) {
      setIsWorkoutModalOpen(false);
      setActiveWorkoutRoutine(null);
    }
  };

  // Weight Handlers
  const handleAddWeightLog = async (entry: Omit<WeightEntry, 'id'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: `w-${Date.now()}`,
      memberId: currentMember?.id || 'guest',
    };
    const updated = [...weightLogs, newEntry];
    setWeightLogs(updated);
    if (currentMember) {
      saveMemberWeightLogs(updated, currentMember.id);
    } else {
      saveStoredWeightLogs(updated);
    }

    setProfile((prev) => ({
      ...prev,
      currentWeight: entry.weight,
    }));

    if (currentMember) {
      const updatedMember: Member = {
        ...currentMember,
        currentWeight: entry.weight,
      };
      await handleSaveMember(updatedMember);
    }
  };

  const handleDeleteWeightLog = (id: string) => {
    const updated = weightLogs.filter((w) => w.id !== id);
    setWeightLogs(updated);
    if (currentMember) {
      saveMemberWeightLogs(updated, currentMember.id);
    } else {
      saveStoredWeightLogs(updated);
    }
    if (updated.length > 0) {
      const latest = updated[updated.length - 1].weight;
      setProfile((prev) => ({ ...prev, currentWeight: latest }));
    }
  };

  // Routines Handlers
  const handleCreateRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [newRoutine, ...prev]);
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyAiRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [newRoutine, ...prev]);
    setActiveTab('routines');
  };

  // PDF Export Handler
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportGymDataToPDF({
        profile: {
          ...profile,
          name: currentMember ? currentMember.name : currentCoach ? currentCoach.name : 'Administrador',
          membershipNumber: currentMember ? currentMember.membershipNumber : currentCoach ? (currentCoach.coachCode || 'COACH') : 'ADMIN',
          membershipType: currentMember ? currentMember.membershipType : 'Oficial Alfa & Omega',
        } as any,
        weightLogs,
        workoutLogs,
        routines,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Hubo un error al generar el PDF. Por favor reintenta.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // IF NOT AUTHENTICATED: Display Initial Access Panel (Panel Inicial de Acceso)
  if (!currentRole) {
    return (
      <InitialAccessPortal
        members={members}
        coaches={coaches}
        onLoginMember={handleLoginMember}
        onLoginCoach={handleLoginCoach}
        onLoginAdmin={handleLoginAdmin}
        onRenewMemberPayment={handleRenewMemberPayment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        hasActiveWorkout={activeWorkoutRoutine !== null}
        onOpenActiveWorkout={() => setIsWorkoutModalOpen(true)}
        restTimerSeconds={restSecondsLeft}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        currentRole={currentRole}
        currentMember={currentMember}
        currentCoach={currentCoach}
        isAdmin={isAdmin}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Dedicated Coach Portal Tab */}
        {activeTab === 'coach_portal' && currentCoach && (
          <CoachPortalView
            coach={currentCoach}
            members={members}
            consultations={consultations}
            onReplyConsultation={handleReplyConsultation}
            onLogout={handleLogout}
            onNavigateToRoutines={() => setActiveTab('routines')}
            onNavigateToApparatus={() => setActiveTab('apparatus')}
          />
        )}

        {/* Member Profile Tab */}
        {activeTab === 'profile' && currentMember && (
          <MemberProfileView
            member={currentMember}
            coaches={coaches}
            weightLogs={weightLogs}
            workoutLogs={workoutLogs}
            onUpdateMember={handleSaveMember}
            onLogout={handleLogout}
            onExportPDF={handleExportPDF}
            onNavigateToCoaches={() => setActiveTab('coaches')}
            onNavigateToNutrition={() => setActiveTab('nutrition')}
            onNavigateToRoutines={() => setActiveTab('routines')}
          />
        )}

        {/* Routines View */}
        {activeTab === 'routines' && (
          <RoutinesView
            routines={routines}
            onStartWorkout={handleStartWorkout}
            onCreateRoutine={handleCreateRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onNavigateToAiGenerator={() => setActiveTab('calorie_recommend')}
            onNavigateToApparatusGuide={() => setActiveTab('apparatus')}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
            defaultWeightKg={profile.currentWeight || currentMember?.currentWeight || 75}
          />
        )}

        {/* Real Gym Coaches View (for members and visitors) */}
        {activeTab === 'coaches' && (
          <GymCoachesView
            coaches={coaches}
            currentMember={currentMember}
            consultations={consultations}
            onAddConsultation={handleAddConsultation}
            onReplyConsultation={handleReplyConsultation}
            onOpenLoginModal={() => {}}
          />
        )}

        {/* Apparatus and Guide View */}
        {activeTab === 'apparatus' && <ApparatusGuideView />}

        {/* Weight and Measurements */}
        {activeTab === 'weight' && (
          <WeightView
            member={currentMember}
            workoutLogs={workoutLogs}
            weightLogs={weightLogs}
            onAddWeightLog={handleAddWeightLog}
            onDeleteWeightLog={handleDeleteWeightLog}
            profile={profile}
            onUpdateProfile={setProfile}
          />
        )}

        {/* Timer View */}
        {activeTab === 'timer' && (
          <TimerView onStartRestFromParent={handleTriggerRestTimer} />
        )}

        {/* Progress View */}
        {activeTab === 'progress' && (
          <ProgressView
            member={currentMember}
            weightLogs={weightLogs}
            workoutLogs={workoutLogs}
            profile={profile}
            onExportPDF={handleExportPDF}
            isExportingPDF={isExportingPDF}
          />
        )}

        {/* Caloric Burn and Recommendations */}
        {activeTab === 'calorie_recommend' && (
          <CalorieRecommendView
            onApplyRoutine={handleApplyAiRoutine}
            currentWeight={profile.currentWeight}
          />
        )}

        {/* Personalized Nutrition Recommendation */}
        {activeTab === 'nutrition' && (
          <NutritionRecommendationView
            currentMember={currentMember}
            members={members}
            coaches={coaches}
            weightLogs={weightLogs}
            workoutLogs={workoutLogs}
            profile={profile}
            currentRole={currentRole}
            onNavigateToRoutines={() => setActiveTab('routines')}
          />
        )}
      </main>

      {/* Floating Rest Timer (active anywhere in the app) */}
      <QuickTimerFloater
        secondsLeft={restSecondsLeft}
        totalSeconds={restTotalSeconds}
        isRunning={isRestRunning}
        onToggle={() => setIsRestRunning(!isRestRunning)}
        onReset={() => {
          setIsRestRunning(false);
          setRestSecondsLeft(restTotalSeconds);
        }}
        onAdd15={() => {
          setRestSecondsLeft((s) => s + 15);
          setRestTotalSeconds((s) => Math.max(s, s + 15));
        }}
        onClose={() => {
          setIsRestRunning(false);
          setRestSecondsLeft(0);
        }}
        soundEnabled={restSoundEnabled}
        onToggleSound={() => setRestSoundEnabled(!restSoundEnabled)}
      />

      {/* Fullscreen Active Workout Modal */}
      {isWorkoutModalOpen && activeWorkoutRoutine && (
        <ActiveWorkoutModal
          routine={activeWorkoutRoutine}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
          onTriggerRestTimer={handleTriggerRestTimer}
        />
      )}

      {/* Android & PWA Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Administrator Database & Passwords Management Portal */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        members={members}
        coaches={coaches}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
        onSaveCoach={handleSaveCoach}
        onResetDemoMembers={handleResetDemoMembers}
        onSelectMemberToView={(member) => {
          handleLoginMember(member);
          setIsAdminPortalOpen(false);
        }}
        onLogoutAdmin={handleLogout}
      />
    </div>
  );
}
