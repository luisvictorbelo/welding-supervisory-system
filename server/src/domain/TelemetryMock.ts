export interface TelemetryMock {
  voltage: {
    avg: number
    rms: number
    pk: number
  }
  current: {
    avg: number
    rms: number
    pk: number
  }
  rpm: number
  flow: number
  temperature: number
  relays: number[]
  mode: 'MIG' | 'SMAW'
  alarm: {
    overVoltage: boolean
    overCurrent: boolean
    lowFlow: boolean
    overTemp: boolean
    commFail: boolean
  }
  timestamp: number
}
