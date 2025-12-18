// const API_BASE_URL = 'http://localhost:3001';

// export class ExportService {
//   static async downloadCSV(sessionId: string): Promise<void> {
//     try {
//       const response = await fetch(`${API_BASE_URL}/recording/${sessionId}/csv`);
      
//       if (!response.ok) {
//         throw new Error('Erro ao baixar CSV');
//       }

//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
      
//       link.href = url;
//       link.download = `${sessionId}.csv`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
      
//       console.log('[Export] CSV baixado com sucesso');
//     } catch (error) {
//       console.error('[Export] Erro ao baixar CSV:', error);
//       throw error;
//     }
//   }

//   static async generatePDF(sessionId: string): Promise<void> {
//     try {
//       const response = await fetch(`${API_BASE_URL}/recording/${sessionId}/stats`);
      
//       if (!response.ok) {
//         throw new Error('Erro ao obter estatísticas');
//       }

//       const data = await response.json();
      
//       // Lazy load jsPDF apenas quando necessário
//       const { default: jsPDF } = await import('jspdf');
//       const { default: autoTable } = await import('jspdf-autotable');
      
//       const doc = new jsPDF();
//       let yPos = 20;

//       // Header
//       doc.setFontSize(18);
//       doc.text('Relatório de Supervisório - SCADA', 15, yPos);
//       yPos += 10;

//       doc.setFontSize(10);
//       doc.text(`Sessão: ${sessionId}`, 15, yPos);
//       yPos += 5;
//       doc.text(`Amostras: ${data.count}`, 15, yPos);
//       yPos += 5;
//       doc.text(`Duração: ${data.duration.toFixed(1)}s`, 15, yPos);
//       yPos += 10;

//       if (data.stats) {
//         doc.setFontSize(14);
//         doc.text('Estatísticas', 15, yPos);
//         yPos += 8;

//         autoTable(doc, {
//           startY: yPos,
//           head: [['Variável', 'Média', 'RMS', 'Pico']],
//           body: [
//             ['Tensão (V)', 
//               data.stats.voltage.avg.toFixed(2), 
//               data.stats.voltage.rms.toFixed(2), 
//               data.stats.voltage.pk.toFixed(2)
//             ],
//             ['Corrente (A)', 
//               data.stats.current.avg.toFixed(2), 
//               data.stats.current.rms.toFixed(2), 
//               data.stats.current.pk.toFixed(2)
//             ]
//           ]
//         });
//       }

//       doc.save(`relatorio_${sessionId}.pdf`);
//       console.log('[Export] PDF gerado com sucesso');
//     } catch (error) {
//       console.error('[Export] Erro ao gerar PDF:', error);
//       throw error;
//     }
//   }

//   static async listSessions(): Promise<any[]> {
//     try {
//       const response = await fetch(`${API_BASE_URL}/recording/list`);
      
//       if (!response.ok) {
//         throw new Error('Erro ao listar sessões');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('[Export] Erro ao listar sessões:', error);
//       return [];
//     }
//   }

//   static async deleteSession(sessionId: string): Promise<void> {
//     try {
//       const response = await fetch(`${API_BASE_URL}/recording/${sessionId}`, {
//         method: 'DELETE'
//       });
      
//       if (!response.ok) {
//         throw new Error('Erro ao remover sessão');
//       }

//       console.log('[Export] Sessão removida com sucesso');
//     } catch (error) {
//       console.error('[Export] Erro ao remover sessão:', error);
//       throw error;
//     }
//   }
// }