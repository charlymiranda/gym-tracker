import { create } from 'zustand';

interface WorkoutState {
  activeSessionId: string | null;
  activeRestTimerSeconds: number | null;
  restTimerEndTimestamp: number | null;
  
  setActiveSession: (id: string | null) => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeSessionId: null,
  activeRestTimerSeconds: null,
  restTimerEndTimestamp: null,

  setActiveSession: (id) => set({ activeSessionId: id }),
  
  startRestTimer: (seconds) => set({ 
    activeRestTimerSeconds: seconds,
    restTimerEndTimestamp: Date.now() + (seconds * 1000)
  }),
  
  clearRestTimer: () => set({
    activeRestTimerSeconds: null,
    restTimerEndTimestamp: null
  })
}));
