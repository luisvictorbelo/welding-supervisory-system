// src/presentation/components/GaugePanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Telemetry } from '@/domain/entities/Telemetry';

interface GaugePanelProps {
  data: Telemetry | null;
}

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  thresholds?: {
    warning: number;
    danger: number;
  };
}

function Gauge({ value, max, label, unit, thresholds }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColor = () => {
    if (thresholds) {
      if (percentage >= thresholds.danger) return '#EF4444'; // red
      if (percentage >= thresholds.warning) return '#F59E0B'; // amber
    }
    return '#10B981'; // green
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-linear-to-b from-slate-50 to-white rounded-lg border shadow-sm">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 font-medium">{unit}</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Máx: {max} {unit}
      </div>
    </div>
  );
}

export function GaugePanel({ data }: GaugePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrumentação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Gauge
            value={data?.voltage.rms || 0}
            max={100}
            label="Tensão"
            unit="V"
            thresholds={{ warning: 70, danger: 85 }}
          />
          <Gauge
            value={data?.current.rms || 0}
            max={50}
            label="Corrente"
            unit="A"
            thresholds={{ warning: 70, danger: 85 }}
          />
          <Gauge
            value={data?.rpm || 0}
            max={3000}
            label="RPM"
            unit="rpm"
            thresholds={{ warning: 80, danger: 90 }}
          />
          <Gauge
            value={data?.flow || 0}
            max={100}
            label="Vazão"
            unit="L/min"
            thresholds={{ warning: 20, danger: 15 }} // Low flow is danger
          />
          <Gauge
            value={data?.temperature || 0}
            max={100}
            label="Temperatura"
            unit="°C"
            thresholds={{ warning: 70, danger: 80 }}
          />
        </div>
      </CardContent>
    </Card>
  );
}