import { SerialData } from "@/domain/SerialData.js";
import { Telemetry } from "@/domain/Telemetry.js";

export class TelemetryEnricher {
    enrich(raw: SerialData): Telemetry {
        const voltage = raw.V;
        const current = raw.I;

        return {
            voltage: {
                avg: voltage,
                rms: voltage * 1.11,
                pk: voltage * 1.41
            },
            current: {
                avg: current,
                rms: current * 1.11,
                pk: current * 1.57
            },
            rpm: raw.RPM,
            flow: raw.FLOW,
            temperature: raw.TEMP,
            relays: [0, 0, 0, 0, 0],
            mode: raw.mode === 'MIG' ? 'MIG' : 'SMAW',
            alarm: {
                overVoltage: false,
                overCurrent: false,
                lowFlow: false,
                overTemp: false,
                commFail: false,
            },
            timestamp: Date.now()
        }
    }
}