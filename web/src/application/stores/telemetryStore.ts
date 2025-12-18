// src/application/stores/telemetryStore.ts
import { create } from 'zustand';
import type { Telemetry, CalibrationData } from '../../domain/entities/Telemetry';

interface TelemetryState {
  // Connection
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // Current data
  currentData: Telemetry | null;
  
  // Historical data (para gráficos) - LIMITADO
  voltageHistory: Array<{ timestamp: number; avg: number; rms: number; pk: number }>;
  currentHistory: Array<{ timestamp: number; avg: number; rms: number; pk: number }>;
  rpmFlowHistory: Array<{ timestamp: number; rpm: number; flow: number }>;
  
  // Recording
  isRecording: boolean;
  recordedData: Telemetry[];
  
  // Calibration
  calibration: CalibrationData;
  isCalibrating: boolean;
  
  // Alarms
  activeAlarms: string[];
  alarmHistory: Array<{ type: string; timestamp: number; acknowledged: boolean }>;
  
  // Performance tracking
  lastCleanup: number;
  
  // Actions
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  updateTelemetry: (data: Telemetry) => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  acknowledgeAlarms: () => void;
  updateCalibration: (calibration: Partial<CalibrationData>) => void;
  setCalibrating: (isCalibrating: boolean) => void;
  clearHistory: () => void;
  forceCleanup: () => void;
}

// CONFIGURAÇÕES CRÍTICAS DE MEMÓRIA
const MAX_HISTORY_POINTS = 300; // 5 min a 1Hz (antes era ilimitado!)
const MAX_RECORDED_POINTS = 10000; // Limite de gravação (10k amostras)
const MAX_ALARM_HISTORY = 50; // Máximo de alarmes no histórico
const CLEANUP_INTERVAL = 60000; // Cleanup a cada 60s

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  // Initial state
  isConnected: false,
  connectionStatus: 'disconnected',
  currentData: null,
  voltageHistory: [],
  currentHistory: [],
  rpmFlowHistory: [],
  isRecording: false,
  recordedData: [],
  calibration: {
    current: { offset: 0, gain: 1 },
    voltage: { offset: 0, gain: 1 }
  },
  isCalibrating: false,
  activeAlarms: [],
  alarmHistory: [],
  lastCleanup: Date.now(),

  // Actions
  setConnectionStatus: (status) => {
    set({
      connectionStatus: status,
      isConnected: status === 'connected'
    });
  },

  updateTelemetry: (data) => {
    const state = get();
    
    // Apply calibration
    const calibratedData = applyCalibration(data, state.calibration);
    
    // Update histories com LIMITE RÍGIDO
    const newVoltageHistory = [
      ...state.voltageHistory,
      {
        timestamp: calibratedData.timestamp,
        avg: calibratedData.voltage.avg,
        rms: calibratedData.voltage.rms,
        pk: calibratedData.voltage.pk
      }
    ].slice(-MAX_HISTORY_POINTS); // CRÍTICO: Remove dados antigos

    const newCurrentHistory = [
      ...state.currentHistory,
      {
        timestamp: calibratedData.timestamp,
        avg: calibratedData.current.avg,
        rms: calibratedData.current.rms,
        pk: calibratedData.current.pk
      }
    ].slice(-MAX_HISTORY_POINTS);

    const newRpmFlowHistory = [
      ...state.rpmFlowHistory,
      {
        timestamp: calibratedData.timestamp,
        rpm: calibratedData.rpm,
        flow: calibratedData.flow
      }
    ].slice(-MAX_HISTORY_POINTS);

    // Check alarms
    const newAlarms: string[] = [];
    let newAlarmHistory = [...state.alarmHistory];

    Object.entries(calibratedData.alarm).forEach(([key, value]) => {
      if (value) {
        newAlarms.push(key);
        
        // Add to history if not already present recently
        const recentAlarm = state.alarmHistory
          .slice(-10)
          .find(a => a.type === key && !a.acknowledged);
        
        if (!recentAlarm) {
          newAlarmHistory.push({
            type: key,
            timestamp: calibratedData.timestamp,
            acknowledged: false
          });
        }
      }
    });

    // Limitar histórico de alarmes
    newAlarmHistory = newAlarmHistory.slice(-MAX_ALARM_HISTORY);

    // Recording com LIMITE
    let newRecordedData = state.recordedData;
    if (state.isRecording) {
      if (newRecordedData.length < MAX_RECORDED_POINTS) {
        newRecordedData = [...newRecordedData, calibratedData];
      } else {
        console.warn(`[Store] Limite de gravação atingido (${MAX_RECORDED_POINTS} amostras)`);
      }
    }

    // Cleanup periódico forçado
    const now = Date.now();
    if (now - state.lastCleanup > CLEANUP_INTERVAL) {
      console.log('[Store] Executando cleanup periódico');
      newAlarmHistory = newAlarmHistory.filter(a => 
        now - a.timestamp < 3600000 || !a.acknowledged // Mantém últimas 1h ou não-ACK
      );
    }

    set({
      currentData: calibratedData,
      voltageHistory: newVoltageHistory,
      currentHistory: newCurrentHistory,
      rpmFlowHistory: newRpmFlowHistory,
      activeAlarms: newAlarms,
      alarmHistory: newAlarmHistory,
      recordedData: newRecordedData,
      lastCleanup: now - state.lastCleanup > CLEANUP_INTERVAL ? now : state.lastCleanup
    });
  },

  startRecording: () => {
    set({ isRecording: true, recordedData: [] });
  },

  stopRecording: () => {
    set({ isRecording: false });
  },

  clearRecording: () => {
    set({ recordedData: [] });
    // Force garbage collection hint
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      (globalThis as any).gc();
    }
  },

  acknowledgeAlarms: () => {
    const state = get();
    const updatedHistory = state.alarmHistory.map(alarm => ({
      ...alarm,
      acknowledged: true
    }));

    set({
      activeAlarms: [],
      alarmHistory: updatedHistory
    });
  },

  updateCalibration: (calibration) => {
    set((state) => ({
      calibration: {
        current: {
          ...state.calibration.current,
          ...calibration.current
        },
        voltage: {
          ...state.calibration.voltage,
          ...calibration.voltage
        }
      }
    }));
  },

  setCalibrating: (isCalibrating) => {
    set({ isCalibrating });
  },

  clearHistory: () => {
    set({
      voltageHistory: [],
      currentHistory: [],
      rpmFlowHistory: []
    });
  },

  forceCleanup: () => {
    const state = get();
    const now = Date.now();
    
    // Manter apenas últimos 2 minutos de dados
    const twoMinutesAgo = now - 120000;
    
    set({
      voltageHistory: state.voltageHistory.filter(d => d.timestamp > twoMinutesAgo),
      currentHistory: state.currentHistory.filter(d => d.timestamp > twoMinutesAgo),
      rpmFlowHistory: state.rpmFlowHistory.filter(d => d.timestamp > twoMinutesAgo),
      alarmHistory: state.alarmHistory.filter(a => 
        a.timestamp > twoMinutesAgo || !a.acknowledged
      ),
      lastCleanup: now
    });

    console.log('[Store] Cleanup forçado executado');
  }
}));

// Helper function to apply calibration
function applyCalibration(data: Telemetry, calibration: CalibrationData): Telemetry {
  return {
    ...data,
    voltage: {
      avg: (data.voltage.avg - calibration.voltage.offset) * calibration.voltage.gain,
      rms: (data.voltage.rms - calibration.voltage.offset) * calibration.voltage.gain,
      pk: (data.voltage.pk - calibration.voltage.offset) * calibration.voltage.gain
    },
    current: {
      avg: (data.current.avg - calibration.current.offset) * calibration.current.gain,
      rms: (data.current.rms - calibration.current.offset) * calibration.current.gain,
      pk: (data.current.pk - calibration.current.offset) * calibration.current.gain
    }
  };
}