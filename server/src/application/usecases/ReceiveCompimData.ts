import { Telemetry } from "@/domain/Telemetry.js";
import { SerialReader } from "@/infrastructure/serial/SerialReader.js";
import { WsServer } from "@/infrastructure/ws/WsServer.js";
import { takeCoverage } from "node:v8";
import { TelemetryEnricher } from "../services/TelemetryEnricher.js";
import { ProcessTelemetryUseCase } from "./ProcessTelemetry.js";
import { HttpServer } from "@/infrastructure/http/HttpServer.js";
import { error } from "node:console";

export class ReceiveCompimDataUseCase {
    private serialAdapter: SerialReader;
    private wsServer: WsServer;
    private processTelemetry: ProcessTelemetryUseCase;
    // private http?: HttpServer;

    constructor(processTelemetry: ProcessTelemetryUseCase, wsServer: WsServer) {
        this.serialAdapter = new SerialReader({
            path: 'COM4',
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        })

        this.processTelemetry = processTelemetry;
        this.wsServer = wsServer;
        // this.http = http;
    }

    async execute(): Promise<void> {
        try {
            await this.serialAdapter.connect();
            console.log('[COMPIM] Conectado com sucesso');

            this.serialAdapter.onData((rawData) => {
                console.log('[COMPIM] Dados recebidos:', rawData);

                // Parse dos dados conforme protocolo do COMPIM
                // const parsedData = this.parseCompimData(rawData);

                // Processa os dados (business logic)
                let parsedData = this.processData(rawData);
                if (parsedData) {
                    this.sendData(parsedData);
                    // this.http?.record(parsedData);
                } else {
                    throw error
                }
            });
        } catch (error) {
            console.error('[COMPIM] Erro na conexão:', error);
            throw error;
        }
    }

    // private parseCompimData(raw: string): any {
    //     try {
    //         return JSON.parse(raw);

    //     } catch (error) {
    //         console.warn('[Parser] Falha ao parsear dados:', raw);
    //         return null;
    //     }
    // }

    private processData(data: any): Telemetry | null {
        try {
            return this.processTelemetry.execute(data);
        } catch (err) {
            console.log('Erro ao processar data:', err)
            return null
        }


        // this.wsServer.broadcast(data)
    }

    private sendData(data: Telemetry): void {
        if (!data) return;

        this.wsServer.broadcast(data)
    }

    async cleanup(): Promise<void> {
        await this.serialAdapter.disconnect();
        console.log('[COMPIM] Desconectado');
    }
}