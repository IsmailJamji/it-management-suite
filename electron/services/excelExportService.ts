import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { database } from '../database/database';

// Translation mappings for Excel exports
const excelTranslations = {
  fr: {
    // IT Assets
    'itAssets.title': 'Rapport de Gestion des Équipements IT',
    'itAssets.subtitle': 'Généré le {date} - Total des équipements: {count}',
    'itAssets.id': 'ID',
    'itAssets.deviceType': 'Type d\'équipement',
    'itAssets.ownerName': 'Propriétaire',
    'itAssets.department': 'Département',
    'itAssets.zone': 'Zone/Emplacement',
    'itAssets.serialNumber': 'Numéro de série',
    'itAssets.model': 'Modèle',
    'itAssets.brand': 'Marque',
    'itAssets.date': 'Date d\'équipement',
    'itAssets.ram': 'RAM (GB)',
    'itAssets.disk': 'Stockage (GB)',
    'itAssets.processor': 'Processeur',
    'itAssets.os': 'Système d\'exploitation',
    'itAssets.peripheralType': 'Type de périphérique',
    'itAssets.connectionType': 'Type de connexion',
    'itAssets.status': 'Statut',
    'itAssets.remarque': 'Remarque',
    'itAssets.posteActivite': 'Poste/Activité',
    'itAssets.company': 'Entreprise',
    'itAssets.createdAt': 'Créé le',
    
    // Telecom Assets
    'telecomAssets.title': 'Rapport de Gestion des Équipements Télécom',
    'telecomAssets.subtitle': 'Généré le {date} - Total des équipements: {count}',
    'telecomAssets.id': 'ID',
    'telecomAssets.provider': 'Fournisseur',
    'telecomAssets.simNumber': 'Numéro SIM',
    'telecomAssets.simOwner': 'Propriétaire SIM',
    'telecomAssets.subscriptionType': 'Type d\'abonnement',
    'telecomAssets.phoneNumber': 'Numéro de téléphone',
    'telecomAssets.phoneName': 'Nom du téléphone',
    'telecomAssets.ram': 'RAM (GB)',
    'telecomAssets.storage': 'Stockage (GB)',
    'telecomAssets.imei': 'IMEI',
    'telecomAssets.dataPlan': 'Forfait données',
    'telecomAssets.pinCode': 'Code PIN',
    'telecomAssets.pukCode': 'Code PUK',
    'telecomAssets.zone': 'Zone/Emplacement',
    'telecomAssets.department': 'Département',
    'telecomAssets.company': 'Entreprise',
    'telecomAssets.posteActivite': 'Poste/Activité',
    'telecomAssets.remarque': 'Remarque',
    'telecomAssets.status': 'Statut',
    'telecomAssets.date': 'Date d\'ajout',
    'telecomAssets.createdAt': 'Créé le',
    
    // Tasks
    'tasks.title': 'Rapport de Gestion des Tâches',
    'tasks.subtitle': 'Généré le {date} - Total des tâches: {count}',
    'tasks.id': 'ID',
    'tasks.taskTitle': 'Titre de la tâche',
    'tasks.description': 'Description',
    'tasks.status': 'Statut',
    'tasks.priority': 'Priorité',
    'tasks.projectName': 'Projet',
    'tasks.assignedUserName': 'Assigné à',
    'tasks.createdByName': 'Créé par',
    'tasks.progressPercentage': 'Progression %',
    'tasks.dueDate': 'Date d\'échéance',
    'tasks.createdAt': 'Créé le',
    
    // Projects
    'projects.title': 'Rapport de Gestion des Projets',
    'projects.subtitle': 'Généré le {date} - Total des projets: {count}',
    'projects.id': 'ID',
    'projects.name': 'Nom du projet',
    'projects.description': 'Description',
    'projects.status': 'Statut',
    'projects.priority': 'Priorité',
    'projects.managerName': 'Gestionnaire',
    'projects.budget': 'Budget',
    'projects.startDate': 'Date de début',
    'projects.endDate': 'Date de fin',
    'projects.createdAt': 'Créé le',
    
    // Common
    'common.generatedOn': 'Généré le',
    'common.totalRecords': 'Total des enregistrements',
    'common.columnStatistics': 'Statistiques des colonnes',
    'common.sum': 'Somme',
    'common.average': 'Moyenne',
    'common.minimum': 'Minimum',
    'common.maximum': 'Maximum'
  },
  es: {
    // IT Assets
    'itAssets.title': 'Reporte de Gestión de Equipos IT',
    'itAssets.subtitle': 'Generado el {date} - Total de equipos: {count}',
    'itAssets.id': 'ID',
    'itAssets.deviceType': 'Tipo de equipo',
    'itAssets.ownerName': 'Propietario',
    'itAssets.department': 'Departamento',
    'itAssets.zone': 'Zona/Ubicación',
    'itAssets.serialNumber': 'Número de serie',
    'itAssets.model': 'Modelo',
    'itAssets.brand': 'Marca',
    'itAssets.date': 'Fecha de equipo',
    'itAssets.ram': 'RAM (GB)',
    'itAssets.disk': 'Almacenamiento (GB)',
    'itAssets.processor': 'Procesador',
    'itAssets.os': 'Sistema operativo',
    'itAssets.peripheralType': 'Tipo de periférico',
    'itAssets.connectionType': 'Tipo de conexión',
    'itAssets.status': 'Estado',
    'itAssets.remarque': 'Observación',
    'itAssets.posteActivite': 'Puesto/Actividad',
    'itAssets.company': 'Empresa',
    'itAssets.createdAt': 'Creado el',
    
    // Telecom Assets
    'telecomAssets.title': 'Reporte de Gestión de Equipos Telecom',
    'telecomAssets.subtitle': 'Generado el {date} - Total de equipos: {count}',
    'telecomAssets.id': 'ID',
    'telecomAssets.provider': 'Proveedor',
    'telecomAssets.simNumber': 'Número SIM',
    'telecomAssets.simOwner': 'Propietario SIM',
    'telecomAssets.subscriptionType': 'Tipo de suscripción',
    'telecomAssets.phoneNumber': 'Número de teléfono',
    'telecomAssets.phoneName': 'Nombre del teléfono',
    'telecomAssets.ram': 'RAM (GB)',
    'telecomAssets.storage': 'Almacenamiento (GB)',
    'telecomAssets.imei': 'IMEI',
    'telecomAssets.dataPlan': 'Plan de datos',
    'telecomAssets.pinCode': 'Código PIN',
    'telecomAssets.pukCode': 'Código PUK',
    'telecomAssets.zone': 'Zona/Ubicación',
    'telecomAssets.department': 'Departamento',
    'telecomAssets.company': 'Empresa',
    'telecomAssets.posteActivite': 'Puesto/Actividad',
    'telecomAssets.remarque': 'Observación',
    'telecomAssets.status': 'Estado',
    'telecomAssets.date': 'Fecha de adición',
    'telecomAssets.createdAt': 'Creado el',
    
    // Tasks
    'tasks.title': 'Reporte de Gestión de Tareas',
    'tasks.subtitle': 'Generado el {date} - Total de tareas: {count}',
    'tasks.id': 'ID',
    'tasks.taskTitle': 'Título de la tarea',
    'tasks.description': 'Descripción',
    'tasks.status': 'Estado',
    'tasks.priority': 'Prioridad',
    'tasks.projectName': 'Proyecto',
    'tasks.assignedUserName': 'Asignado a',
    'tasks.createdByName': 'Creado por',
    'tasks.progressPercentage': 'Progreso %',
    'tasks.dueDate': 'Fecha de vencimiento',
    'tasks.createdAt': 'Creado el',
    
    // Projects
    'projects.title': 'Reporte de Gestión de Proyectos',
    'projects.subtitle': 'Generado el {date} - Total de proyectos: {count}',
    'projects.id': 'ID',
    'projects.name': 'Nombre del proyecto',
    'projects.description': 'Descripción',
    'projects.status': 'Estado',
    'projects.priority': 'Prioridad',
    'projects.managerName': 'Gerente',
    'projects.budget': 'Presupuesto',
    'projects.startDate': 'Fecha de inicio',
    'projects.endDate': 'Fecha de fin',
    'projects.createdAt': 'Creado el',
    
    // Common
    'common.generatedOn': 'Generado el',
    'common.totalRecords': 'Total de registros',
    'common.columnStatistics': 'Estadísticas de columnas',
    'common.sum': 'Suma',
    'common.average': 'Promedio',
    'common.minimum': 'Mínimo',
    'common.maximum': 'Máximo'
  },
  en: {
    // IT Assets
    'itAssets.title': 'IT Assets Management Report',
    'itAssets.subtitle': 'Generated on {date} - Total Assets: {count}',
    'itAssets.id': 'ID',
    'itAssets.deviceType': 'Device Type',
    'itAssets.ownerName': 'Owner',
    'itAssets.department': 'Department',
    'itAssets.zone': 'Zone/Location',
    'itAssets.serialNumber': 'Serial Number',
    'itAssets.model': 'Model',
    'itAssets.brand': 'Brand',
    'itAssets.date': 'Asset Date',
    'itAssets.ram': 'RAM (GB)',
    'itAssets.disk': 'Storage (GB)',
    'itAssets.processor': 'Processor',
    'itAssets.os': 'Operating System',
    'itAssets.peripheralType': 'Peripheral Type',
    'itAssets.connectionType': 'Connection Type',
    'itAssets.status': 'Status',
    'itAssets.remarque': 'Notes',
    'itAssets.posteActivite': 'Position/Activity',
    'itAssets.company': 'Company',
    'itAssets.createdAt': 'Created At',
    
    // Telecom Assets
    'telecomAssets.title': 'Telecom Assets Management Report',
    'telecomAssets.subtitle': 'Generated on {date} - Total Assets: {count}',
    'telecomAssets.id': 'ID',
    'telecomAssets.provider': 'Provider',
    'telecomAssets.simNumber': 'SIM Number',
    'telecomAssets.simOwner': 'SIM Owner',
    'telecomAssets.subscriptionType': 'Subscription Type',
    'telecomAssets.phoneNumber': 'Phone Number',
    'telecomAssets.phoneName': 'Phone Name',
    'telecomAssets.ram': 'RAM (GB)',
    'telecomAssets.storage': 'Storage (GB)',
    'telecomAssets.imei': 'IMEI',
    'telecomAssets.dataPlan': 'Data Plan',
    'telecomAssets.pinCode': 'PIN Code',
    'telecomAssets.pukCode': 'PUK Code',
    'telecomAssets.zone': 'Zone/Location',
    'telecomAssets.department': 'Department',
    'telecomAssets.company': 'Company',
    'telecomAssets.posteActivite': 'Position/Activity',
    'telecomAssets.remarque': 'Notes',
    'telecomAssets.status': 'Status',
    'telecomAssets.date': 'Date Added',
    'telecomAssets.createdAt': 'Created At',
    
    // Tasks
    'tasks.title': 'Task Management Report',
    'tasks.subtitle': 'Generated on {date} - Total Tasks: {count}',
    'tasks.id': 'ID',
    'tasks.taskTitle': 'Task Title',
    'tasks.description': 'Description',
    'tasks.status': 'Status',
    'tasks.priority': 'Priority',
    'tasks.projectName': 'Project',
    'tasks.assignedUserName': 'Assigned To',
    'tasks.createdByName': 'Created By',
    'tasks.progressPercentage': 'Progress %',
    'tasks.dueDate': 'Due Date',
    'tasks.createdAt': 'Created At',
    
    // Projects
    'projects.title': 'Project Management Report',
    'projects.subtitle': 'Generated on {date} - Total Projects: {count}',
    'projects.id': 'ID',
    'projects.name': 'Project Name',
    'projects.description': 'Description',
    'projects.status': 'Status',
    'projects.priority': 'Priority',
    'projects.managerName': 'Manager',
    'projects.budget': 'Budget',
    'projects.startDate': 'Start Date',
    'projects.endDate': 'End Date',
    'projects.createdAt': 'Created At',
    
    // Common
    'common.generatedOn': 'Generated on',
    'common.totalRecords': 'Total Records',
    'common.columnStatistics': 'Column Statistics',
    'common.sum': 'Sum',
    'common.average': 'Average',
    'common.minimum': 'Minimum',
    'common.maximum': 'Maximum'
  }
};

export interface ExcelExportOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: {
    key: string;
    header: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
    format?: string;
  }[];
  theme?: 'modern' | 'corporate' | 'colorful' | 'minimal';
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export class ExcelExportService {

  private createStyledWorkbook(options: ExcelExportOptions) {
    const wb = XLSX.utils.book_new();

    // Create main data sheet with proper data structure
    const dataWithHeaders = [
      [options.title],
      options.subtitle ? [options.subtitle] : [],
      [], // Empty row for spacing
      options.columns.map(col => col.header), // Headers
      ...options.data.map(row => 
        options.columns.map(col => {
          const value = row[col.key];
          // Format values based on type
          if (col.type === 'currency' && typeof value === 'number') {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else if (col.type === 'percentage' && typeof value === 'number') {
            return `${(value * 100).toFixed(2)}%`;
          } else if (col.type === 'date' && value) {
            return new Date(value).toLocaleDateString();
          }
          return value;
        })
      )
    ];

    const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);

    // Set column widths
    const colWidths = options.columns.map(col => ({ wch: col.width || 15 }));
    ws['!cols'] = colWidths;

    // Add summary sheet if requested
    if (options.includeSummary) {
      const summaryWs = this.createSummarySheet(options);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    return wb;
  }

  private async createStyledWorkbookWithExcelJS(options: ExcelExportOptions, language: string = 'fr'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const colors = this.getThemeColors(options.theme || 'modern');

    // Create main data sheet
    const worksheet = workbook.addWorksheet('Data');

    // Add title
    const titleRow = worksheet.addRow([options.title]);
    titleRow.height = 30;
    titleRow.getCell(1).font = { 
      bold: true, 
      size: 18, 
      color: { argb: 'FF' + colors.text } 
    };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + colors.primary }
    };
    titleRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    worksheet.mergeCells(1, 1, 1, options.columns.length);

    // Add subtitle
    if (options.subtitle) {
      const subtitleRow = worksheet.addRow([options.subtitle]);
      subtitleRow.height = 25;
      subtitleRow.getCell(1).font = { 
        italic: true, 
        size: 12, 
        color: { argb: 'FF' + colors.text } 
      };
      subtitleRow.getCell(1).alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      worksheet.mergeCells(2, 1, 2, options.columns.length);
    }

    // Add empty row for spacing
    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow(options.columns.map(col => col.header));
    headerRow.height = 25;
    headerRow.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + colors.secondary }
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF' + colors.text } },
        left: { style: 'thin', color: { argb: 'FF' + colors.text } },
        bottom: { style: 'thin', color: { argb: 'FF' + colors.text } },
        right: { style: 'thin', color: { argb: 'FF' + colors.text } }
      };
    });

    // Add data rows
    options.data.forEach((row, rowIndex) => {
      const dataRow = worksheet.addRow(
        options.columns.map(col => {
          const value = row[col.key];
          if (col.type === 'currency' && typeof value === 'number') {
            return value; // Return number for proper formatting
          } else if (col.type === 'percentage' && typeof value === 'number') {
            return value / 100; // Convert to decimal for Excel
          } else if (col.type === 'date' && value) {
            return new Date(value);
          }
          return value;
        })
      );
      
      dataRow.height = 20;
      dataRow.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
        const col = options.columns[colNumber - 1];
        
        // Font and alignment
        cell.font = { 
          color: { argb: 'FF' + colors.text } 
        };
        cell.alignment = { 
          horizontal: col.type === 'number' ? 'right' : 'left', 
          vertical: 'middle' 
        };
        
        // Background color (alternating rows)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + (rowIndex % 2 === 0 ? 'FFFFFF' : colors.background) }
        };
        
        // Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
        
        // Number formatting
        if (col.type === 'currency' && typeof cell.value === 'number') {
          cell.numFmt = '"$"#,##0.00';
        } else if (col.type === 'percentage' && typeof cell.value === 'number') {
          cell.numFmt = '0.00%';
        } else if (col.type === 'date' && cell.value instanceof Date) {
          cell.numFmt = 'mm/dd/yyyy';
        }
      });
    });

    // Set column widths
    options.columns.forEach((col, index) => {
      worksheet.getColumn(index + 1).width = col.width || 15;
    });

    // Add summary sheet if requested
    if (options.includeSummary) {
      const summarySheet = workbook.addWorksheet('Summary');
      this.createSummarySheetWithExcelJS(summarySheet, options, colors, language);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private getThemeColors(theme: string) {
    const themes = {
      modern: {
        primary: '2E63FF',
        secondary: '6B9DFF',
        accent: '4ECDC4',
        background: 'F8F9FA',
        text: '2C3E50',
        success: '27AE60',
        warning: 'F39C12',
        danger: 'E74C3C',
        info: '3498DB'
      },
      corporate: {
        primary: '2C3E50',
        secondary: '34495E',
        accent: '3498DB',
        background: 'FFFFFF',
        text: '2C3E50',
        success: '27AE60',
        warning: 'F39C12',
        danger: 'E74C3C',
        info: '3498DB'
      },
      colorful: {
        primary: 'E91E63',
        secondary: '9C27B0',
        accent: 'FF9800',
        background: 'FFF3E0',
        text: '3E2723',
        success: '4CAF50',
        warning: 'FF9800',
        danger: 'F44336',
        info: '2196F3'
      },
      minimal: {
        primary: '000000',
        secondary: '666666',
        accent: '999999',
        background: 'FFFFFF',
        text: '000000',
        success: '4CAF50',
        warning: 'FF9800',
        danger: 'F44336',
        info: '2196F3'
      }
    };
    return themes[theme as keyof typeof themes] || themes.modern;
  }

  private createSummarySheetWithExcelJS(worksheet: ExcelJS.Worksheet, options: ExcelExportOptions, colors: any, language: string = 'fr') {
    const t = excelTranslations[language as keyof typeof excelTranslations] || excelTranslations.fr;
    
    // Title
    const titleRow = worksheet.addRow([t['common.columnStatistics']]);
    titleRow.height = 30;
    titleRow.getCell(1).font = { 
      bold: true, 
      size: 16, 
      color: { argb: 'FF' + colors.text } 
    };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + colors.primary }
    };
    titleRow.getCell(1).alignment = { horizontal: 'center' };
    worksheet.mergeCells(1, 1, 1, 4);

    // Generated date
    const dateRow = worksheet.addRow([t['common.generatedOn'], new Date().toLocaleString()]);
    dateRow.getCell(1).font = { bold: true };
    dateRow.getCell(2).font = { italic: true };

    // Total records
    const recordsRow = worksheet.addRow([t['common.totalRecords'], options.data.length]);
    recordsRow.getCell(1).font = { bold: true };

    // Empty row
    worksheet.addRow([]);

    // Column statistics
    const statsRow = worksheet.addRow(['Column Statistics', '', '', '']);
    statsRow.getCell(1).font = { bold: true, size: 14 };
    statsRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + colors.secondary }
    };
    statsRow.getCell(1).font.color = { argb: 'FFFFFFFF' };

    let row = 6;
    options.columns.forEach((col, index) => {
      if (col.type === 'number') {
        const values = options.data.map(row => row[col.key]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          const statRow = worksheet.addRow([
            col.header,
            `Sum: ${sum.toLocaleString()}`,
            `Avg: ${avg.toFixed(2)}`,
            `Min: ${min} | Max: ${max}`
          ]);
          
          statRow.getCell(1).font = { bold: true };
          statRow.eachCell((cell: ExcelJS.Cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
            };
          });
        }
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 30;
  }

  private createSummarySheet(options: ExcelExportOptions) {
    const summaryData = [
      ['Summary Report', '', '', ''],
      ['Generated on', new Date().toLocaleString(), '', ''],
      ['Total Records', options.data.length, '', ''],
      ['', '', '', ''],
      ['Column Statistics', '', '', ''],
    ];

    // Add column statistics
    let row = 5;
    options.columns.forEach((col, index) => {
      if (col.type === 'number') {
        const values = options.data.map(row => row[col.key]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          summaryData.push([
            col.header,
            `Sum: ${sum.toLocaleString()}`,
            `Avg: ${avg.toFixed(2)}`,
            `Min: ${min} | Max: ${max}`
          ]);
        }
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }];
    return ws;
  }

  async exportITAssets(format: string = 'xlsx', theme: string = 'modern', language: string = 'fr'): Promise<Buffer> {
    try {
      console.log('Starting IT Assets export...');
      console.log('Database instance:', database);
      
      if (!database) {
        throw new Error('Database not initialized');
      }
      
      const assets = await database.getAllITAssets();
      console.log('IT Assets retrieved:', assets.length, 'assets');
      console.log('Sample asset:', assets[0]);
      
      const t = excelTranslations[language as keyof typeof excelTranslations] || excelTranslations.fr;
      const currentDate = new Date().toLocaleDateString();
      
      const options: ExcelExportOptions = {
        title: t['itAssets.title'],
        subtitle: t['itAssets.subtitle'].replace('{date}', currentDate).replace('{count}', assets.length.toString()),
        data: assets,
        columns: [
          { key: 'id', header: t['itAssets.id'], width: 8, type: 'number' },
          { key: 'device_type', header: t['itAssets.deviceType'], width: 15, type: 'text' },
          { key: 'owner_name', header: t['itAssets.ownerName'], width: 20, type: 'text' },
          { key: 'department', header: t['itAssets.department'], width: 15, type: 'text' },
          { key: 'zone', header: t['itAssets.zone'], width: 16, type: 'text' },
          { key: 'serial_number', header: t['itAssets.serialNumber'], width: 18, type: 'text' },
          { key: 'model', header: t['itAssets.model'], width: 20, type: 'text' },
          { key: 'brand', header: t['itAssets.brand'], width: 15, type: 'text' },
          { key: 'date', header: t['itAssets.date'], width: 15, type: 'date' },
          { key: 'ram_gb', header: t['itAssets.ram'], width: 12, type: 'number' },
          { key: 'disk_gb', header: t['itAssets.disk'], width: 12, type: 'number' },
          { key: 'processor', header: t['itAssets.processor'], width: 25, type: 'text' },
          { key: 'os', header: t['itAssets.os'], width: 20, type: 'text' },
          { key: 'peripheral_type', header: t['itAssets.peripheralType'], width: 18, type: 'text' },
          { key: 'connection_type', header: t['itAssets.connectionType'], width: 18, type: 'text' },
          { key: 'status', header: t['itAssets.status'], width: 12, type: 'text' },
          { key: 'remarque', header: t['itAssets.remarque'], width: 25, type: 'text' },
          { key: 'poste_activite', header: t['itAssets.posteActivite'], width: 18, type: 'text' },
          { key: 'company', header: t['itAssets.company'], width: 18, type: 'text' },
          { key: 'created_at', header: t['itAssets.createdAt'], width: 20, type: 'date' }
        ],
        theme: theme as any,
        includeSummary: true
      };

      console.log('Creating styled workbook with ExcelJS...');
      const buffer = await this.createStyledWorkbookWithExcelJS(options, language);
      console.log('ExcelJS buffer created, size:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error in exportITAssets:', error);
      throw new Error(`Failed to export IT assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportTelecomAssets(format: string = 'xlsx', theme: string = 'modern', language: string = 'fr'): Promise<Buffer> {
    try {
      console.log('Starting Telecom Assets export...');
      console.log('Database instance:', database);
      
      if (!database) {
        throw new Error('Database not initialized');
      }
      
      const assets = await database.getAllTelecomAssets();
      console.log('Telecom Assets retrieved:', assets.length, 'assets');
      console.log('Sample asset:', assets[0]);
      
      const t = excelTranslations[language as keyof typeof excelTranslations] || excelTranslations.fr;
      const currentDate = new Date().toLocaleDateString();
      
      const options: ExcelExportOptions = {
        title: t['telecomAssets.title'],
        subtitle: t['telecomAssets.subtitle'].replace('{date}', currentDate).replace('{count}', assets.length.toString()),
        data: assets,
        columns: [
          { key: 'id', header: t['telecomAssets.id'], width: 8, type: 'number' },
          { key: 'provider', header: t['telecomAssets.provider'], width: 15, type: 'text' },
          { key: 'sim_number', header: t['telecomAssets.simNumber'], width: 18, type: 'text' },
          { key: 'sim_owner', header: t['telecomAssets.simOwner'], width: 20, type: 'text' },
          { key: 'subscription_type', header: t['telecomAssets.subscriptionType'], width: 20, type: 'text' },
          { key: 'phone_number', header: t['telecomAssets.phoneNumber'], width: 15, type: 'text' },
          { key: 'phone_name', header: t['telecomAssets.phoneName'], width: 20, type: 'text' },
          { key: 'ram_gb', header: t['telecomAssets.ram'], width: 12, type: 'number' },
          { key: 'storage_gb', header: t['telecomAssets.storage'], width: 12, type: 'number' },
          { key: 'imei', header: t['telecomAssets.imei'], width: 18, type: 'text' },
          { key: 'data_plan', header: t['telecomAssets.dataPlan'], width: 15, type: 'text' },
          { key: 'pin_code', header: t['telecomAssets.pinCode'], width: 12, type: 'text' },
          { key: 'puk_code', header: t['telecomAssets.pukCode'], width: 12, type: 'text' },
          { key: 'zone', header: t['telecomAssets.zone'], width: 16, type: 'text' },
          { key: 'department', header: t['telecomAssets.department'], width: 15, type: 'text' },
          { key: 'company', header: t['telecomAssets.company'], width: 18, type: 'text' },
          { key: 'poste_activite', header: t['telecomAssets.posteActivite'], width: 18, type: 'text' },
          { key: 'remarque', header: t['telecomAssets.remarque'], width: 25, type: 'text' },
          { key: 'status', header: t['telecomAssets.status'], width: 12, type: 'text' },
          { key: 'date', header: t['telecomAssets.date'], width: 15, type: 'date' },
          { key: 'created_at', header: t['telecomAssets.createdAt'], width: 20, type: 'date' }
        ],
        theme: theme as any,
        includeSummary: true
      };

      console.log('Creating styled workbook with ExcelJS...');
      const buffer = await this.createStyledWorkbookWithExcelJS(options, language);
      console.log('ExcelJS buffer created, size:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error in exportTelecomAssets:', error);
      throw new Error(`Failed to export telecom assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportTasks(format: string = 'xlsx', theme: string = 'modern', language: string = 'fr'): Promise<Buffer> {
    const tasks = await database.getAllTasks();
    
    const t = excelTranslations[language as keyof typeof excelTranslations] || excelTranslations.fr;
    const currentDate = new Date().toLocaleDateString();
    
    const options: ExcelExportOptions = {
      title: t['tasks.title'],
      subtitle: t['tasks.subtitle'].replace('{date}', currentDate).replace('{count}', tasks.length.toString()),
      data: tasks,
      columns: [
        { key: 'id', header: t['tasks.id'], width: 8, type: 'number' },
        { key: 'title', header: t['tasks.taskTitle'], width: 30, type: 'text' },
        { key: 'description', header: t['tasks.description'], width: 40, type: 'text' },
        { key: 'status', header: t['tasks.status'], width: 15, type: 'text' },
        { key: 'priority', header: t['tasks.priority'], width: 12, type: 'text' },
        { key: 'project_name', header: t['tasks.projectName'], width: 20, type: 'text' },
        { key: 'assigned_user_name', header: t['tasks.assignedUserName'], width: 20, type: 'text' },
        { key: 'created_by_name', header: t['tasks.createdByName'], width: 20, type: 'text' },
        { key: 'progress_percentage', header: t['tasks.progressPercentage'], width: 12, type: 'percentage' },
        { key: 'due_date', header: t['tasks.dueDate'], width: 15, type: 'date' },
        { key: 'created_at', header: t['tasks.createdAt'], width: 20, type: 'date' }
      ],
      theme: theme as any,
      includeSummary: true
    };

    const wb = this.createStyledWorkbook(options);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportProjects(format: string = 'xlsx', theme: string = 'modern', language: string = 'fr'): Promise<Buffer> {
    const projects = await database.getAllProjects();
    
    const t = excelTranslations[language as keyof typeof excelTranslations] || excelTranslations.fr;
    const currentDate = new Date().toLocaleDateString();
    
    const options: ExcelExportOptions = {
      title: t['projects.title'],
      subtitle: t['projects.subtitle'].replace('{date}', currentDate).replace('{count}', projects.length.toString()),
      data: projects,
      columns: [
        { key: 'id', header: t['projects.id'], width: 8, type: 'number' },
        { key: 'name', header: t['projects.name'], width: 30, type: 'text' },
        { key: 'description', header: t['projects.description'], width: 40, type: 'text' },
        { key: 'status', header: t['projects.status'], width: 15, type: 'text' },
        { key: 'priority', header: t['projects.priority'], width: 12, type: 'text' },
        { key: 'manager_name', header: t['projects.managerName'], width: 20, type: 'text' },
        { key: 'budget', header: t['projects.budget'], width: 15, type: 'currency' },
        { key: 'start_date', header: t['projects.startDate'], width: 15, type: 'date' },
        { key: 'end_date', header: t['projects.endDate'], width: 15, type: 'date' },
        { key: 'created_at', header: t['projects.createdAt'], width: 20, type: 'date' }
      ],
      theme: theme as any,
      includeSummary: true
    };

    const wb = this.createStyledWorkbook(options);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
