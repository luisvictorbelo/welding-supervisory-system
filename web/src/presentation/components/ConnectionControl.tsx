import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, Loader2, WifiOff } from 'lucide-react'

interface ConnectionControlProps {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    onConnect: () => void
    onDisconnect: () => void
}

export function ConnectionControl({ status, onConnect, onDisconnect }: ConnectionControlProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    icon: <Wifi className='w-4 h-4' />,
                    label: 'ONLINE',
                    variant: 'default' as const,
                    badgeClass: 'bg-green-500'
                };
            case 'connecting':
                return {
                    icon: <Loader2 className='w-4 h-4 animate-spin' />,
                    label: 'CONECTANDO...',
                    variant: 'secondary' as const,
                    badgeClass: 'bg-yellow-500'
                };
            case 'error':
                return {
                    icon: <WifiOff className='w-4 h-4' />,
                    label: 'OFFLINE',
                    variant: 'outline' as const,
                    badgeClass: 'bg-gray-500'
                };
            default:
                return {
                    icon: <WifiOff className='w-4 h-4' />,
                    label: 'OFFLINE',
                    variant: 'outline' as const,
                    badgeClass: 'bg-gray-500'
                }
        }

    };

    const config = getStatusConfig();

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                    <span>Conexão</span>
                    <Badge variant={config.variant} className={config.badgeClass}>
                        {config.icon}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex gap-2'>
                    {status === 'connected' ? (
                        <Button onClick={onDisconnect} variant="destructive" className='w-full'>
                            Desconectar
                        </Button>
                    ) : (
                        <Button
                            onClick={onConnect}
                            disabled={status === 'connecting'}
                            className='w-full'
                        >
                            {status === 'connecting' ? (
                                <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    Conectando...
                                </>
                            ) : (
                                'Iniciar Comunicação'
                            )} 
                        </Button>
                    )}
                </div>
                <div className='mt-4 text-sm text-muted-foreground'>
                    <p>Servidor: ws://localhost:8080</p>
                </div>
            </CardContent>
        </Card>
    );
}