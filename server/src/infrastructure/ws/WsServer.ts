import { WebSocketServer } from "ws";
// import { Telemetry } from "@/domain/TelemetryMock.js";

export class WsServer {
    private wss = new WebSocketServer({ port: 8080 })

    broadcast(data: any) {
        const msg = JSON.stringify(data);
        // console.log(msg);
        this.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(msg)
            }
        })
    }
}