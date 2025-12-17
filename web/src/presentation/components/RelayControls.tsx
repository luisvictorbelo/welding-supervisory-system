import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface RelayControlsProps {
    states: boolean[];
    onToggle: (index: number) => void;
    disabled?: boolean;
}

export function RelayControls({ states, onToggle, disabled = false }: RelayControlsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Controle de Relés</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {states.map((state, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${state ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                <Label htmlFor={`relay-${index}`} className="font-medium">
                                    Relé {index + 1}
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={state ? 'default' : 'outline'}>
                                    {state ? 'LIGADO' : 'DESLIGADO'}
                                </Badge>
                                <Switch 
                                    id={`relay-${index}`}
                                    checked={state}
                                    onCheckedChange={() => onToggle(index)}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}