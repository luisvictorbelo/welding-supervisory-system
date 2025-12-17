import { WebSocketServer } from "ws";
import { Telemetry } from "@/domain/Telemetry.js";

export class WsServer {
    private wss = new WebSocketServer({ port: 8080 })

    broadcast(data: Telemetry) {
        const msg = JSON.stringify(data)
        this.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(msg)
            }
        })
    }
}