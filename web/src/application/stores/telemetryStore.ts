// src/application/stores/telemetryStore.ts
import { create } from 'zustand';
import type { Telemetry, CalibrationData } from '../../domain/entities/Telemetry';

interface TelemetryState {
  // Connection
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // Current data
  currentData: Telemetry | null;
  
  // Historical data (para gráficos)
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
}

const MAX_HISTORY_POINTS = 300; // 5 min a 1Hz

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
    
    // Update histories
    const newVoltageHistory = [
      ...state.voltageHistory,
      {
        timestamp: calibratedData.timestamp,
        avg: calibratedData.voltage.avg,
        rms: calibratedData.voltage.rms,
        pk: calibratedData.voltage.pk
      }
    ].slice(-MAX_HISTORY_POINTS);

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
    const newAlarmHistory = [...state.alarmHistory];

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

    set({
      currentData: calibratedData,
      voltageHistory: newVoltageHistory,
      currentHistory: newCurrentHistory,
      rpmFlowHistory: newRpmFlowHistory,
      activeAlarms: newAlarms,
      alarmHistory: newAlarmHistory,
      recordedData: state.isRecording
        ? [...state.recordedData, calibratedData]
        : state.recordedData
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