// src/presentation/components/RealtimeCharts.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

// interface ChartDataPoint {
//   timestamp: number;
//   [key: string]: number;
// }

interface RealtimeChartsProps {
  voltageData: Array<{ timestamp: number; avg: number; rms: number; pk: number }>;
  currentData: Array<{ timestamp: number; avg: number; rms: number; pk: number }>;
  rpmFlowData: Array<{ timestamp: number; rpm: number; flow: number }>;
}

export function RealtimeCharts({ voltageData, currentData, rpmFlowData }: RealtimeChartsProps) {
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{formatTime(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Voltage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tensão × Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={voltageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="timreestamp" 
                tickFormatter={formatTime}
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                label={{ value: 'Tensão (V)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#3B82F6" 
                name="Média" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="rms" 
                stroke="#10B981" 
                name="RMS" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="pk" 
                stroke="#EF4444" 
                name="Pico" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Current Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Corrente × Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                label={{ value: 'Corrente (A)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#3B82F6" 
                name="Média" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="rms" 
                stroke="#10B981" 
                name="RMS" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="pk" 
                stroke="#EF4444" 
                name="Pico" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RPM and Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>RPM e Vazão × Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rpmFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                label={{ value: 'RPM', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                label={{ value: 'Vazão (L/min)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="rpm" 
                stroke="#8B5CF6" 
                name="RPM" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="flow" 
                stroke="#F59E0B" 
                name="Vazão" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}