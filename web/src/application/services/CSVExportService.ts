import type { Telemetry } from '@/domain/entities/Telemetry';
import { format } from 'date-fns';

export class CSVExportService {
  static export(data: Telemetry[], filename?: string): void {
    const headers = [
      'Timestamp',
      'Voltage_Avg', 'Voltage_RMS', 'Voltage_PK',
      'Current_Avg', 'Current_RMS', 'Current_PK',
      'RPM', 'Flow', 'Temperature',
      'Mode',
      'Relay_1', 'Relay_2', 'Relay_3', 'Relay_4', 'Relay_5',
      'Alarm_OverVoltage', 'Alarm_OverCurrent', 'Alarm_LowFlow',
      'Alarm_OverTemp', 'Alarm_CommFail'
    ];

    const rows = data.map(d => [
      format(d.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS'),
      d.voltage.avg.toFixed(2),
      d.voltage.rms.toFixed(2),
      d.voltage.pk.toFixed(2),
      d.current.avg.toFixed(2),
      d.current.rms.toFixed(2),
      d.current.pk.toFixed(2),
      d.rpm.toFixed(0),
      d.flow.toFixed(2),
      d.temperature.toFixed(1),
      d.mode,
      ...d.relays.map(r => r.toString()),
      d.alarm.overVoltage ? '1' : '0',
      d.alarm.overCurrent ? '1' : '0',
      d.alarm.lowFlow ? '1' : '0',
      d.alarm.overTemp ? '1' : '0',
      d.alarm.commFail ? '1' : '0'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `telemetry_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}