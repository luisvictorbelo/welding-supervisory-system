import { SerialMock } from "./infrastructure/serial/SerialMock.js";
import { WsServer } from "./infrastructure/ws/WsServer.js";

const ws = new WsServer()
const serial = new SerialMock()

console.log('Supervisório iniciado')

serial.start((data) => {
    console.log('Telemetria recebida:', data)
    ws.broadcast(data)
})