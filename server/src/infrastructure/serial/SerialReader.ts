import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

interface SerialConfig {
    path: string;
    baudRate: number;
    dataBits: 7 | 8;
    stopBits: 1 | 2;
    parity: 'none' | 'even' | 'odd';
}

export class SerialReader {
    private port: SerialPort | null = null;
    private parser: ReadlineParser | null = null;

    constructor(private config: SerialConfig) { }

    async connect(): Promise<void> {
        this.port = new SerialPort({
            path: this.config.path,
            baudRate: this.config.baudRate,
            dataBits: this.config.dataBits,
            stopBits: this.config.stopBits,
            parity: this.config.parity,
        });
        console.log('Porta aberta?', this.port.isOpen)
        
        this.parser = this.port!.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        // Parser para dados delimitados por linha (\n ou \r\n)

        this.port.on('error', (err) => {
            console.error('[SerialPort] Erro:', err.message);
        });
    }

    onData(callback: (data: string) => void): void {
        if (!this.parser) {
            throw new Error('Parser não inicializado. Execute connect() primeiro.');
        }

        this.parser.on('data', callback);
    }

    isConnected(): boolean {
        return this.port?.isOpen ?? false;
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.port) {
                resolve();
                return;
            }

            this.port.close((err) => {
                if (err) {
                    reject(new Error(`Erro ao fechar porta: ${err.message}`));
                } else {
                    this.port = null;
                    this.parser = null;
                    resolve();
                }
            });
        });
    }
}