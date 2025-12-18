import { WsServer } from "@/infrastructure/ws/WsServer.js"
import { TelemetryEnricher } from "@/application/services/TelemetryEnricher.js";
import { Telemetry } from "@/domain/Telemetry.js";

export class ProcessTelemetryUseCase {
    constructor (
        private enricher: TelemetryEnricher,
    ) {}

    execute(rawData: any): Telemetry | null {
        const rawParsed = JSON.parse(rawData);
        // console.log(rawParsed)
        if (!rawParsed) return null

        const telemetry = this.enricher.enrich(rawParsed)

        return telemetry
    }
}