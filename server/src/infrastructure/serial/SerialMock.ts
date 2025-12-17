import { Telemetry } from "../../domain/Telemetry.js";

type Callback = (data: Telemetry) => void

export class SerialMock {
    private timer?: NodeJS.Timeout

    start(onData: Callback) {
        this.timer = setInterval(() => {
            const voltage = 200 + Math.random() * 30
            const current = 100 + Math.random() * 40
            const rpm = 1200 + Math.random() * 500
            const flow = 20 + Math.random() * 5
            const temperature = 60 + Math.random() * 20

            const payload: Telemetry = {
                voltage: {
                    avg: voltage,
                    rms: voltage * 1.02,
                    pk: voltage * 1.05
                },
                current: {
                    avg: current,
                    rms: current * 1.03,
                    pk: current * 1.08
                },
                rpm,
                flow,
                temperature,
                relays: [1, 0, 1, 0, 0],
                mode: Math.random() > 0.5 ? 'MIG' : 'SMAW',
                alarm: {
                    overVoltage: voltage > 250,
                    overCurrent: current > 450,
                    lowFlow: flow < 5,
                    overTemp: temperature > 90,
                    commFail: false
                },
                timestamp: Date.now()
            }

            onData(payload)
        }, 1000)
    }

    stop() {
        if (this.timer) clearInterval(this.timer)
    }
}