import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title: string;
  filename: string;
  elementId?: string;
  data?: any;
}

export async function exportToPDF(options: PDFExportOptions) {
  const { title, filename, elementId, data } = options;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    if (elementId) {
      // Export from DOM element
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if image fits on current page
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      }
    } else if (data) {
      // Generate PDF from data
      await generatePDFFromData(pdf, data, pageWidth, pageHeight, margin);
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

async function generatePDFFromData(pdf: jsPDF, data: any, pageWidth: number, pageHeight: number, margin: number) {
  let yPosition = margin + 20;
  
  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Export different data types
  if (data.type === 'employees') {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Liste des Employés', margin, yPosition);
    yPosition += 15;

    data.employees.forEach((employee: any) => {
      checkNewPage(30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(`${employee.prenom} ${employee.nom}`, margin, yPosition, pageWidth - margin * 2);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`Poste: ${employee.poste}`, margin, yPosition, pageWidth - margin * 2);
      yPosition = addText(`Salaire/jour: ${employee.salaireParJour.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
      yPosition = addText(`Jours travaillés: ${employee.joursTravailles}`, margin, yPosition, pageWidth - margin * 2);
      yPosition = addText(`Absences: ${employee.absences}`, margin, yPosition, pageWidth - margin * 2);
      yPosition = addText(`Avances: ${employee.avance.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
      
      const salaireBase = employee.joursTravailles * employee.salaireParJour;
      const deductions = (employee.absences * employee.salaireParJour) + employee.avance;
      const salaireNet = salaireBase - deductions;
      
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(`Salaire net: ${salaireNet.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
      yPosition += 10;
    });
  } else if (data.type === 'recettes') {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recettes', margin, yPosition);
    yPosition += 15;

    const totalRecettes = data.recettes.reduce((sum: number, r: any) => sum + r.total, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText(`Total des recettes: ${totalRecettes.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
    yPosition += 10;

    data.recettes.forEach((recette: any) => {
      checkNewPage(40);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(`Date: ${new Date(recette.date).toLocaleDateString('fr-FR')}`, margin, yPosition, pageWidth - margin * 2);
      yPosition = addText(`Total: ${recette.total.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText('Articles:', margin, yPosition, pageWidth - margin * 2);
      
      recette.items.forEach((item: any) => {
        yPosition = addText(`- ${item.article}: ${item.quantite} x ${item.prixUnitaire.toFixed(2)} TND = ${(item.quantite * item.prixUnitaire).toFixed(2)} TND`, margin + 10, yPosition, pageWidth - margin * 2 - 10);
      });
      yPosition += 10;
    });
  } else if (data.type === 'depenses') {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dépenses', margin, yPosition);
    yPosition += 15;

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText(`Salaires total: ${data.stats.salairesTotal.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
    yPosition = addText(`Achats total: ${data.stats.achatsTotal.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
    yPosition = addText(`Maintenance total: ${data.stats.maintenanceTotal.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
    yPosition = addText(`Total dépenses: ${data.stats.total.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
    yPosition += 15;

    // Employee details
    if (data.employees && data.employees.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Détail des salaires:', margin, yPosition, pageWidth - margin * 2);
      yPosition += 5;

      data.employees.forEach((employee: any) => {
        checkNewPage(25);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const salaireBase = employee.joursTravailles * employee.salaireParJour;
        const deductions = (employee.absences * employee.salaireParJour) + employee.avance;
        const salaireNet = salaireBase - deductions;
        
        yPosition = addText(`${employee.prenom} ${employee.nom} (${employee.poste}): ${salaireNet.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
      });
      yPosition += 10;
    }

    // Maintenance details
    if (data.maintenances && data.maintenances.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Maintenances:', margin, yPosition, pageWidth - margin * 2);
      yPosition += 5;

      data.maintenances.forEach((maintenance: any) => {
        checkNewPage(30);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addText(`${new Date(maintenance.date).toLocaleDateString('fr-FR')} - ${maintenance.service}`, margin, yPosition, pageWidth - margin * 2);
        yPosition = addText(`Description: ${maintenance.description}`, margin, yPosition, pageWidth - margin * 2);
        yPosition = addText(`Montant: ${maintenance.montant.toFixed(2)} TND`, margin, yPosition, pageWidth - margin * 2);
        yPosition += 5;
      });
    }
  }
}

export function exportElementToPDF(elementId: string, title: string, filename: string) {
  return exportToPDF({ title, filename, elementId });
}

export function exportDataToPDF(data: any, title: string, filename: string) {
  return exportToPDF({ title, filename, data });
}
