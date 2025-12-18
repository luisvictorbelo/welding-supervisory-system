import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Telemetry } from '../../domain/entities/Telemetry';
import { format } from 'date-fns';

interface ReportData {
  telemetry: Telemetry[];
  alarms: Array<{ type: string; timestamp: number; acknowledged: boolean }>;
}

export class PDFReportService {
  static generate(data: ReportData): void {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.text('Relatório de Supervisório - SCADA', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(Date.now(), 'dd/MM/yyyy HH:mm:ss')}`, 15, yPos);
    yPos += 10;

    // Statistics
    const stats = this.calculateStatistics(data.telemetry);
    
    doc.setFontSize(14);
    doc.text('Estatísticas', 15, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Variável', 'Média', 'RMS', 'Pico']],
      body: [
        ['Tensão (V)', stats.voltage.avg.toFixed(2), stats.voltage.rms.toFixed(2), stats.voltage.pk.toFixed(2)],
        ['Corrente (A)', stats.current.avg.toFixed(2), stats.current.rms.toFixed(2), stats.current.pk.toFixed(2)],
        ['RPM', stats.rpm.toFixed(0), '-', '-'],
        ['Vazão (L/min)', stats.flow.toFixed(2), '-', '-'],
        ['Temperatura (°C)', stats.temperature.toFixed(1), '-', '-']
      ]
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Relay States
    doc.setFontSize(14);
    doc.text('Estados dos Relés', 15, yPos);
    yPos += 8;

    const lastRelayStates = data.telemetry[data.telemetry.length - 1]?.relays || [];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Relé', 'Estado']],
      body: lastRelayStates.map((state, idx) => [
        `Relé ${idx + 1}`,
        state ? 'LIGADO' : 'DESLIGADO'
      ])
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Alarms
    doc.setFontSize(14);
    doc.text('Alarmes Registrados', 15, yPos);
    yPos += 8;

    if (data.alarms.length === 0) {
      doc.setFontSize(10);
      doc.text('Nenhum alarme registrado', 15, yPos);
    } else {
      autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Timestamp', 'Status']],
        body: data.alarms.map(alarm => [
          this.getAlarmLabel(alarm.type),
          format(alarm.timestamp, 'dd/MM/yyyy HH:mm:ss'),
          alarm.acknowledged ? 'ACK' : 'ATIVO'
        ])
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Pass/Fail
    const hasAlarms = data.alarms.some(a => !a.acknowledged);
    const result = hasAlarms ? 'REPROVADO' : 'APROVADO';
    const resultColor = hasAlarms ? '#EF4444' : '#10B981';

    doc.setFontSize(16);
    doc.setTextColor(resultColor);
    doc.text(`Resultado: ${result}`, 15, yPos);

    // Save
    doc.save(`relatorio_${Date.now()}.pdf`);
  }

  private static calculateStatistics(data: Telemetry[]) {
    if (data.length === 0) {
      return {
        voltage: { avg: 0, rms: 0, pk: 0 },
        current: { avg: 0, rms: 0, pk: 0 },
        rpm: 0,
        flow: 0,
        temperature: 0
      };
    }

    const sum = data.reduce(
      (acc, d) => ({
        voltage: {
          avg: acc.voltage.avg + d.voltage.avg,
          rms: acc.voltage.rms + d.voltage.rms,
          pk: Math.max(acc.voltage.pk, d.voltage.pk)
        },
        current: {
          avg: acc.current.avg + d.current.avg,
          rms: acc.current.rms + d.current.rms,
          pk: Math.max(acc.current.pk, d.current.pk)
        },
        rpm: acc.rpm + d.rpm,
        flow: acc.flow + d.flow,
        temperature: acc.temperature + d.temperature
      }),
      {
        voltage: { avg: 0, rms: 0, pk: 0 },
        current: { avg: 0, rms: 0, pk: 0 },
        rpm: 0,
        flow: 0,
        temperature: 0
      }
    );

    const count = data.length;

    return {
      voltage: {
        avg: sum.voltage.avg / count,
        rms: sum.voltage.rms / count,
        pk: sum.voltage.pk
      },
      current: {
        avg: sum.current.avg / count,
        rms: sum.current.rms / count,
        pk: sum.current.pk
      },
      rpm: sum.rpm / count,
      flow: sum.flow / count,
      temperature: sum.temperature / count
    };
  }

  private static getAlarmLabel(type: string): string {
    const labels: Record<string, string> = {
      overVoltage: 'Sobretensão',
      overCurrent: 'Sobrecorrente',
      lowFlow: 'Baixa Vazão',
      overTemp: 'Temperatura Alta',
      commFail: 'Falha de Comunicação'
    };
    return labels[type] || type;
  }
}