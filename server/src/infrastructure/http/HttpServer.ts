import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { Telemetry } from '@/domain/Telemetry.js';

export class HttpServer {
  private app = express();
  private sessions = new Map<string, RecordingSession>();
  private DATA_DIR = path.join(process.cwd(), 'data');

  constructor(private port = 3001) {
    this.app.use(cors());
    this.app.use(express.json());
    this.setupRoutes();
  }

  async start() {
    await fs.mkdir(this.DATA_DIR, { recursive: true });
    this.app.listen(this.port, () => {
      console.log(`[HTTP] API iniciada na porta ${this.port}`);
    });
  }

  record(data: Telemetry) {
    this.sessions.forEach(session => {
      if (session.active) {
        session.data.push(data);
      }
    });
  }

  private setupRoutes() {
    this.app.post('/recording/start', (req, res) => {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ error: 'sessionId é obrigatório' });

      this.sessions.set(sessionId, {
        id: sessionId,
        startTime: Date.now(),
        data: [],
        active: true
      });

      res.json({ success: true });
    });

    this.app.post('/recording/stop', async (req, res) => {
      const session = this.sessions.get(req.body.sessionId);
      if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

      session.active = false;
      session.endTime = Date.now();

      await this.saveSession(session);
      res.json({ success: true });
    });
  }

  private async saveSession(session: RecordingSession) {
    const filePath = path.join(this.DATA_DIR, `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }
}

interface RecordingSession {
  id: string;
  startTime: number;
  endTime?: number;
  data: Telemetry[];
  active: boolean;
}
