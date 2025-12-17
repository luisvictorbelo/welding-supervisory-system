// src/presentation/components/AlarmPanel.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bell, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface AlarmPanelProps {
  activeAlarms: string[];
  alarmHistory: Array<{
    type: string;
    timestamp: number;
    acknowledged: boolean;
  }>;
  onAcknowledge: () => void;
}

const ALARM_LABELS: Record<string, string> = {
  overVoltage: 'Sobretensão',
  overCurrent: 'Sobrecorrente',
  lowFlow: 'Baixa Vazão',
  overTemp: 'Temperatura Alta',
  commFail: 'Falha de Comunicação'
};

const ALARM_DESCRIPTIONS: Record<string, string> = {
  overVoltage: 'Tensão acima do limite de segurança',
  overCurrent: 'Corrente acima do limite de segurança',
  lowFlow: 'Vazão abaixo do mínimo necessário',
  overTemp: 'Temperatura acima do limite operacional',
  commFail: 'Perda de comunicação com o dispositivo'
};

export function AlarmPanel({ activeAlarms, alarmHistory, onAcknowledge }: AlarmPanelProps) {
  const hasActiveAlarms = activeAlarms.length > 0;
  const recentAlarms = alarmHistory.slice(-10).reverse();

  return (
    <div className="space-y-4">
      {/* Active Alarms Alert */}
      {hasActiveAlarms && (
        <Alert variant="destructive" className="border-2 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 animate-bounce" />
            ALARMES ATIVOS
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              {activeAlarms.map((alarm, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ALARM_LABELS[alarm]}</p>
                    <p className="text-sm opacity-90">{ALARM_DESCRIPTIONS[alarm]}</p>
                  </div>
                </div>
              ))}
              <Button 
                onClick={onAcknowledge} 
                variant="outline" 
                size="sm"
                className="mt-3 w-full bg-white text-red-600 hover:bg-red-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                RECONHECER ALARMES (ACK)
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alarm History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Histórico de Alarmes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlarms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Nenhum alarme registrado</p>
              <p className="text-sm">Sistema operando normalmente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlarms.map((alarm, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alarm.acknowledged
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        alarm.acknowledged ? 'bg-slate-400' : 'bg-red-500 animate-pulse'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {ALARM_LABELS[alarm.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(alarm.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={alarm.acknowledged ? 'outline' : 'destructive'}>
                    {alarm.acknowledged ? 'ACK' : 'ATIVO'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}