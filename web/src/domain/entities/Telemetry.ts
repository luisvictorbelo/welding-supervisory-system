export interface Telemetry {
  voltage: {
    avg: number;
    rms: number;
    pk: number;
  };
  current: {
    avg: number;
    rms: number;
    pk: number;
  };
  rpm: number;
  flow: number;
  temperature: number;
  relays: number[];
  mode: 'MIG' | 'SMAW';
  alarm: {
    overVoltage: boolean;
    overCurrent: boolean;
    lowFlow: boolean;
    overTemp: boolean;
    commFail: boolean;
  };
  timestamp: number;
}

export interface CalibrationData {
  current: {
    offset: number; // IZERO
    gain: number;   // K_I
  };
  voltage: {
    offset: number;
    gain: number;   // K_V
  };
}

export interface CommandMessage {
  type: 'relay' | 'analog' | 'calibration';
  relay?: { id: number; state: boolean };
  analog?: { id: number; value: number };
  calibration?: Partial<CalibrationData>;
}

export const ALARM_THRESHOLDS = {
  voltage: { max: 100 },
  current: { max: 50 },
  flow: { min: 10 },
  temperature: { max: 80 },
  commTimeout: 5000 // ms
} as const;