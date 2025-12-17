// src/presentation/components/RecordingControls.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Download, FileText, Trash2 } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  recordedCount: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onExportCSV: () => void;
  onGeneratePDF: () => void;
  onClearRecording: () => void;
}

export function RecordingControls({
  isRecording,
  recordedCount,
  onStartRecording,
  onStopRecording,
  onExportCSV,
  onGeneratePDF,
  onClearRecording
}: RecordingControlsProps) {
  const hasData = recordedCount > 0;
  const formattedCount = recordedCount.toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gravação e Relatórios</span>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              GRAVANDO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Amostras Registradas</p>
              <p className="text-2xl font-bold text-slate-900">{formattedCount}</p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex gap-2">
            {isRecording ? (
              <Button 
                onClick={onStopRecording} 
                variant="destructive" 
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar Gravação
              </Button>
            ) : (
              <Button 
                onClick={onStartRecording} 
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Gravação
              </Button>
            )}
            
            {hasData && !isRecording && (
              <Button 
                onClick={onClearRecording} 
                variant="outline"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Export Controls */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Exportar Dados</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={onExportCSV} 
                disabled={!hasData || isRecording}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                onClick={onGeneratePDF} 
                disabled={!hasData || isRecording}
                variant="outline"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Info Messages */}
          {!hasData && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Inicie a gravação para coletar dados
            </p>
          )}
          {isRecording && (
            <p className="text-sm text-amber-600 text-center py-2 bg-amber-50 rounded">
              ⚠️ Pare a gravação antes de exportar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}