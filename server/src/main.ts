// import { SerialMock } from "./infrastructure/serial/SerialMock.js";
// import { SerialReader } from "@/infrastructure/serial/SerialReader.js"
import { TelemetryEnricher } from "./application/services/TelemetryEnricher.js";
import { ProcessTelemetryUseCase } from "./application/usecases/ProcessTelemetry.js";
import { ReceiveCompimDataUseCase } from "./application/usecases/ReceiveCompimData.js";
import { HttpServer } from "./infrastructure/http/HttpServer.js";
import { WsServer } from "./infrastructure/ws/WsServer.js";

const wsServer = new WsServer();
// const httpServer = new HttpServer();
// await httpServer.start();

console.log(wsServer);

const enricher = new TelemetryEnricher();
const processor = new ProcessTelemetryUseCase(enricher);

const serial = new ReceiveCompimDataUseCase(processor, wsServer);

console.log('Supervisório iniciado')

async function main() {
    try {
        serial.execute()
    } catch (error) {
        console.error('[Fatal]', error);
    }
}

main();
