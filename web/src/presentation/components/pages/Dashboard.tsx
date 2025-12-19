import { useEffect, useRef, useState } from 'react';
import { WebSocketAdapter } from '@/infrastructure/websocket/WebSocketAdapter';
import { useTelemetryStore } from '@/application/stores/telemetryStore';
import { CSVExportService } from '@/application/services/CSVExportService';
import { PDFReportService } from '@/application/services/PDFReportService';
import { ConnectionControl } from '@/presentation/components/ConnectionControl';
import { RelayControls } from '@/presentation/components/RelayControls';
import { AnalogControls } from '@/presentation/components/AnalogControls';
import { GaugePanel } from '@/presentation/components/GaugePanel';
import { RealtimeCharts } from '@/presentation/components/RealtimeCharts';
import { AlarmPanel } from '@/presentation/components/AlarmPanel';
import { RecordingControls } from '@/presentation/components/RecordingControls';
// import { CalibrationDialog } from '@/presentation/components/CalibrationDialog';
// import { PerformanceMonitor } from '@/presentation/components/PerformanceMonitor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MAX_POINTS = 10;

export default function Dashboard() {
  const wsRef = useRef<WebSocketAdapter | null>(null);
  const [relayStates, setRelayStates] = useState([false, false, false, false, false]);
  const [analogValues, setAnalogValues] = useState([0, 0, 0, 0, 0]);

  const voltageBufferRef = useRef<
  Array<{ timestamp: number; avg: number; rms: number; pk: number }>
  >([]);

  const eletricCurrentBufferRef = useRef<
  Array<{ timestamp: number; avg: number; rms: number; pk: number }>
  >([]);

  const rpmBufferRef = useRef<
  Array<{ timestamp: number; rpm: number; flow: number }>
  >([]);

  const [voltageData, setVoltageData] = useState<typeof voltageBufferRef.current>([]);
  const [eletricCurrentData, setEletricCurrentData] = useState<typeof eletricCurrentBufferRef.current>([]);
  const [rpmData, setRpmData] = useState<typeof rpmBufferRef.current>([]);

  const {
    connectionStatus,
    // currentData,
    // voltageHistory,
    // currentHistory,
    // rpmFlowHistory,
    isRecording,
    recordedData,
    activeAlarms,
    alarmHistory,
    // calibration,
    // setConnectionStatus,
    // updateTelemetry,
    startRecording,
    stopRecording,
    clearRecording,
    acknowledgeAlarms,
    // updateCalibration
  } = useTelemetryStore();

  const updateTelemetry = useTelemetryStore(s => s.updateTelemetry);
  const setConnectionStatus = useTelemetryStore(s => s.setConnectionStatus);
  const currentData = useTelemetryStore(s => s.currentData);

  useEffect(() => {
    const ws = new WebSocketAdapter({ url: 'ws://localhost:8080' });

    wsRef.current = ws

    ws.onStatusChange(setConnectionStatus);

    ws.onData(updateTelemetry);

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!currentData) return

    voltageBufferRef.current.push({
      timestamp: currentData.timestamp,
      avg: currentData.voltage.avg,
      rms: currentData.voltage.rms,
      pk: currentData.voltage.pk,
    });

    eletricCurrentBufferRef.current.push({
      timestamp: currentData.timestamp,
      avg: currentData.current.avg,
      rms: currentData.current.rms,
      pk: currentData.current.pk,
    });

    rpmBufferRef.current.push({
      timestamp: currentData.timestamp,
      rpm: currentData.rpm,
      flow: currentData.flow,
    });
    
    if (eletricCurrentBufferRef.current.length > MAX_POINTS) {
      eletricCurrentBufferRef.current.shift();
    }

    if (voltageBufferRef.current.length > MAX_POINTS) {
      voltageBufferRef.current.shift();
    }

    if (rpmBufferRef.current.length > MAX_POINTS) {
      rpmBufferRef.current.shift();
    }

    setVoltageData([...voltageBufferRef.current]);
    setEletricCurrentData([...eletricCurrentBufferRef.current]);
    setRpmData([...rpmBufferRef.current]);
  }, [currentData]);

  const handleConnect = async () => {
    try {
      await wsRef.current?.connect();
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  const handleDisconnect = () => {
    wsRef.current?.disconnect();
  };

  const handleRelayToggle = (index: number) => {
    const newStates = [...relayStates];
    newStates[index] = !newStates[index];
    setRelayStates(newStates);

    wsRef.current?.send({
      type: 'relay',
      relay: { id: index, state: newStates[index] }
    });
  };

  const handleAnalogChange = (index: number, value: number) => {
    const newValues = [...analogValues];
    newValues[index] = value;
    setAnalogValues(newValues);

    wsRef.current?.send({
      type: 'analog',
      analog: { id: index, value }
    });
  };

  const handleExportCSV = () => {
    CSVExportService.export(recordedData);
  };

  const handleGeneratePDF = () => {
    PDFReportService.generate({
      telemetry: recordedData,
      alarms: alarmHistory
    });
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Supervisório SCADA</h1>
              <p className="text-sm text-slate-600 mt-1">
                Sistema de Monitoramento e Controle Industrial
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentData && (
                <Badge variant="outline" className="text-sm">
                  Modo: {currentData.mode}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  useTelemetryStore.getState().forceCleanup();
                }}
              >
                Limpar Histórico
              </Button>
              {/* <CalibrationDialog
                currentCalibration={calibration}
                onApplyCalibration={updateCalibration}
              /> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Connection and Alarms Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ConnectionControl
              status={connectionStatus}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
            <div className="lg:col-span-2">
              <AlarmPanel
                activeAlarms={activeAlarms}
                alarmHistory={alarmHistory}
                onAcknowledge={acknowledgeAlarms}
              />
            </div>
          </div>

          {/* Gauges */}
          <GaugePanel data={currentData} />

          {/* Controls Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RelayControls
              states={relayStates}
              onToggle={handleRelayToggle}
              disabled={!isConnected}
            />
            <AnalogControls
              values={analogValues}
              onChange={handleAnalogChange}
              disabled={!isConnected}
            />
            <RecordingControls
              isRecording={isRecording}
              recordedCount={recordedData.length}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onExportCSV={handleExportCSV}
              onGeneratePDF={handleGeneratePDF}
              onClearRecording={clearRecording}
            />
          </div>

          {/* Charts */}
          <RealtimeCharts
            voltageData={voltageData}
            currentData={eletricCurrentData}
            rpmFlowData={rpmData}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-sm text-center text-slate-600">
            Sistema SCADA v1.0 | {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}