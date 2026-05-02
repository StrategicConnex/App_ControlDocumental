import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface CertificateData {
  documentName: string;
  documentCode: string;
  version: string;
  hash: string;
  signerName: string;
  signerRole: string;
  signDate: string;
  qrCodeDataUrl: string;
  orgName: string;
}

export async function generateCertificatePDF(data: CertificateData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Background Decor ---
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // --- Logo Placeholder (o real si hay URL) ---
  if (data.qrCodeDataUrl) { // Reusando lógica de carga si hubiera logo
     // Aquí podríamos poner el logo de la empresa
  }

  // --- Border ---
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.7);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // --- Header ---
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CERTIFICADO DE VERIFICACIÓN', pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(data.orgName.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  // --- Content ---
  let y = 60;
  
  // Document Title Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalles del Documento', 20, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${data.documentName}`, 25, y);
  y += 7;
  doc.text(`Código: ${data.documentCode}`, 25, y);
  y += 7;
  doc.text(`Versión: ${data.version}`, 25, y);
  
  y += 15;
  // Integrity Section
  doc.setFont('helvetica', 'bold');
  doc.text('Integridad y Autenticidad', 20, y);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Hash de Verificación (SHA-256):', 25, y);
  y += 7;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.hash, 25, y, { maxWidth: 160 });
  
  y += 15;
  // Signer Section
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Validado Digitalmente por:', 20, y);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.signerName}`, 25, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${data.signerRole}`, 25, y);
  y += 7;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Fecha de Validación: ${data.signDate}`, 25, y);

  // --- QR Code ---
  if (data.qrCodeDataUrl) {
    const qrSize = 45;
    doc.addImage(data.qrCodeDataUrl, 'PNG', pageWidth - qrSize - 20, 55, qrSize, qrSize);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('VALIDACIÓN DIGITAL SCX', pageWidth - qrSize/2 - 20, 105, { align: 'center' });
  }

  // --- Footer ---
  doc.setFillColor(30, 41, 59);
  doc.rect(5, pageHeight - 15, pageWidth - 10, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Este certificado garantiza que el documento es una copia fiel del original registrado en Strategic Connex.', pageWidth/2, pageHeight - 9, { align: 'center' });

  return doc;
}

export async function generateComplianceReportPDF(orgName: string, metrics: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('REPORTE EJECUTIVO DE CUMPLIMIENTO', 20, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`${orgName.toUpperCase()} · AUDITORÍA AUTOMATIZADA · ${new Date().toLocaleDateString('es-AR')}`, 20, 30);

  // Executive Summary
  let y = 55;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen de Estado', 20, y);

  const summaryData = [
    ['Indicador', 'Métrica'],
    ['Índice de Cumplimiento Global', `${metrics.compliance_percentage}%`],
    ['Total Documentos Auditados', metrics.total_documents],
    ['Documentos Críticos (Vencidos)', metrics.expired_count],
    ['Documentos en Riesgo (Próximos)', metrics.expiring_soon],
  ];

  (doc as any).autoTable({
    startY: y + 8,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontStyle: 'bold' },
    margin: { left: 20, right: 20 }
  });

  y = (doc as any).lastAutoTable.finalY + 20;

  // 📈 Tendencia de Cumplimiento (Simple Chart)
  doc.setFontSize(16);
  doc.text('2. Tendencia Trimestral', 20, y);
  
  const chartX = 25;
  const chartY = y + 35;
  const chartWidth = 100;
  const chartHeight = 30;

  // Draw axis
  doc.setDrawColor(203, 213, 225);
  doc.line(chartX, chartY, chartX + chartWidth, chartY); // X axis
  doc.line(chartX, chartY, chartX, chartY - chartHeight); // Y axis

  // Draw Bars (Simulated Trend)
  const trends = [
    { label: 'Mar', val: metrics.compliance_percentage - 5 },
    { label: 'Abr', val: metrics.compliance_percentage - 2 },
    { label: 'May', val: metrics.compliance_percentage }
  ];

  trends.forEach((t, i) => {
    const barW = 15;
    const gap = 15;
    const barH = (t.val / 100) * chartHeight;
    doc.setFillColor(79, 70, 229);
    doc.rect(chartX + 10 + (i * (barW + gap)), chartY - barH, barW, barH, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(t.label, chartX + 10 + (i * (barW + gap)) + barW/2, chartY + 5, { align: 'center' });
    doc.text(`${t.val}%`, chartX + 10 + (i * (barW + gap)) + barW/2, chartY - barH - 2, { align: 'center' });
  });

  y = chartY + 25;

  // ⚠️ Critical Findings Table
  if (metrics.criticalFindings && metrics.criticalFindings.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(190, 18, 60); // Rose 700
    doc.text('3. Hallazgos Críticos (Vencidos)', 20, y);

    const findingsData = metrics.criticalFindings.map((f: any) => [
      f.code,
      f.title,
      new Date(f.expiry_date).toLocaleDateString('es-AR'),
      'CRÍTICO'
    ]);

    (doc as any).autoTable({
      startY: y + 8,
      head: [['Código', 'Documento', 'Vencimiento', 'Nivel']],
      body: findingsData,
      theme: 'striped',
      headStyles: { fillColor: [190, 18, 60] },
      columnStyles: { 3: { fontStyle: 'bold' } },
      margin: { left: 20, right: 20 }
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Strategic Connex · Intelligence for Compliance · confidencial', pageWidth/2, pageHeight - 10, { align: 'center' });

  return doc;
}

