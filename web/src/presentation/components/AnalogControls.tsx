import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface AnalogControlsProps {
  values: number[];
  onChange: (index: number, value: number) => void;
  disabled?: boolean;
}

const ANALOG_CONFIGS = [
  { label: 'Canal 1', unit: '%', min: 0, max: 100 },
  { label: 'Canal 2', unit: '%', min: 0, max: 100 },
  { label: 'Canal 3', unit: '%', min: 0, max: 100 },
  { label: 'Canal 4', unit: '%', min: 0, max: 100 },
  { label: 'Canal 5', unit: '%', min: 0, max: 100 }
]

export function AnalogControls({ values, onChange, disabled = false }: AnalogControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controles Analógicos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {values.map((value, index) => {
            const config = ANALOG_CONFIGS[index];

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">{config.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const clamped = Math.max(config.min, Math.min(config.max, val));
                        onChange(index, clamped);
                      }}
                      className="w-20 h-8 text-right"
                      disabled={disabled}
                      min={config.min}
                      max={config.max}
                    />
                    <span className="text-sm text-muted-foreground w-8">{config.unit}</span>
                  </div>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(vals: any) => onChange(index, vals[0])}
                  min={config.min}
                  max={config.max}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{config.min}</span>
                  <span>{config.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}