import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { database } from '../database/database';

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

  private async createStyledWorkbookWithExcelJS(options: ExcelExportOptions): Promise<Buffer> {
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
      this.createSummarySheetWithExcelJS(summarySheet, options, colors);
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

  private createSummarySheetWithExcelJS(worksheet: ExcelJS.Worksheet, options: ExcelExportOptions, colors: any) {
    // Title
    const titleRow = worksheet.addRow(['Summary Report']);
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
    const dateRow = worksheet.addRow(['Generated on', new Date().toLocaleString()]);
    dateRow.getCell(1).font = { bold: true };
    dateRow.getCell(2).font = { italic: true };

    // Total records
    const recordsRow = worksheet.addRow(['Total Records', options.data.length]);
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

  async exportITAssets(format: string = 'xlsx', theme: string = 'modern'): Promise<Buffer> {
    try {
      console.log('Starting IT Assets export...');
      console.log('Database instance:', database);
      
      if (!database) {
        throw new Error('Database not initialized');
      }
      
      const assets = await database.getAllITAssets();
      console.log('IT Assets retrieved:', assets.length, 'assets');
      console.log('Sample asset:', assets[0]);
      
      const options: ExcelExportOptions = {
        title: 'IT Assets Management Report',
        subtitle: `Generated on ${new Date().toLocaleDateString()} - Total Assets: ${assets.length}`,
        data: assets,
        columns: [
          { key: 'id', header: 'ID', width: 8, type: 'number' },
          { key: 'device_type', header: 'Device Type', width: 15, type: 'text' },
          { key: 'owner_name', header: 'Owner', width: 20, type: 'text' },
          { key: 'department', header: 'Department', width: 15, type: 'text' },
          { key: 'zone', header: 'Zone/Emplacement', width: 16, type: 'text' },
          { key: 'serial_number', header: 'Serial Number', width: 18, type: 'text' },
          { key: 'model', header: 'Model', width: 20, type: 'text' },
          { key: 'brand', header: 'Brand', width: 15, type: 'text' },
          { key: 'date', header: 'Asset Date', width: 15, type: 'date' },
          { key: 'ram_gb', header: 'RAM (GB)', width: 12, type: 'number' },
          { key: 'disk_gb', header: 'Storage (GB)', width: 12, type: 'number' },
          { key: 'processor', header: 'Processor', width: 25, type: 'text' },
          { key: 'os', header: 'Operating System', width: 20, type: 'text' },
          { key: 'peripheral_type', header: 'Peripheral Type', width: 18, type: 'text' },
          { key: 'connection_type', header: 'Connection Type', width: 18, type: 'text' },
          { key: 'status', header: 'Status', width: 12, type: 'text' },
          { key: 'remarque', header: 'Remarque', width: 25, type: 'text' },
          { key: 'poste_activite', header: 'Poste/Activité', width: 18, type: 'text' },
          { key: 'company', header: 'Company', width: 18, type: 'text' },
          { key: 'created_at', header: 'Created At', width: 20, type: 'date' }
        ],
        theme: theme as any,
        includeSummary: true
      };

      console.log('Creating styled workbook with ExcelJS...');
      const buffer = await this.createStyledWorkbookWithExcelJS(options);
      console.log('ExcelJS buffer created, size:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error in exportITAssets:', error);
      throw new Error(`Failed to export IT assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportTelecomAssets(format: string = 'xlsx', theme: string = 'modern'): Promise<Buffer> {
    try {
      console.log('Starting Telecom Assets export...');
      console.log('Database instance:', database);
      
      if (!database) {
        throw new Error('Database not initialized');
      }
      
      const assets = await database.getAllTelecomAssets();
      console.log('Telecom Assets retrieved:', assets.length, 'assets');
      console.log('Sample asset:', assets[0]);
      
      const options: ExcelExportOptions = {
        title: 'Telecom Assets Management Report',
        subtitle: `Generated on ${new Date().toLocaleDateString()} - Total Assets: ${assets.length}`,
        data: assets,
      columns: [
        { key: 'id', header: 'ID', width: 8, type: 'number' },
        { key: 'provider', header: 'Provider', width: 15, type: 'text' },
        { key: 'sim_number', header: 'SIM Number', width: 18, type: 'text' },
        { key: 'sim_owner', header: 'SIM Owner', width: 20, type: 'text' },
        { key: 'subscription_type', header: 'Subscription Type', width: 20, type: 'text' },
        { key: 'phone_number', header: 'Phone Number', width: 15, type: 'text' },
        { key: 'phone_name', header: 'Phone Name', width: 20, type: 'text' },
        { key: 'ram_gb', header: 'RAM (GB)', width: 12, type: 'number' },
        { key: 'storage_gb', header: 'Storage (GB)', width: 12, type: 'number' },
        { key: 'imei', header: 'IMEI', width: 18, type: 'text' },
        { key: 'data_plan', header: 'Data Plan', width: 15, type: 'text' },
        { key: 'pin_code', header: 'PIN Code', width: 12, type: 'text' },
        { key: 'puk_code', header: 'PUK Code', width: 12, type: 'text' },
        { key: 'zone', header: 'Zone/Emplacement', width: 16, type: 'text' },
        { key: 'department', header: 'Department', width: 15, type: 'text' },
        { key: 'company', header: 'Company', width: 18, type: 'text' },
        { key: 'poste_activite', header: 'Poste/Activité', width: 18, type: 'text' },
        { key: 'remarque', header: 'Remarque', width: 25, type: 'text' },
        { key: 'status', header: 'Status', width: 12, type: 'text' },
        { key: 'date', header: 'Date Added', width: 15, type: 'date' },
        { key: 'created_at', header: 'Created At', width: 20, type: 'date' }
      ],
      theme: theme as any,
      includeSummary: true
    };

      console.log('Creating styled workbook with ExcelJS...');
      const buffer = await this.createStyledWorkbookWithExcelJS(options);
      console.log('ExcelJS buffer created, size:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error in exportTelecomAssets:', error);
      throw new Error(`Failed to export telecom assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportTasks(format: string = 'xlsx', theme: string = 'modern'): Promise<Buffer> {
    const tasks = await database.getAllTasks();
    
    const options: ExcelExportOptions = {
      title: 'Task Management Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()} - Total Tasks: ${tasks.length}`,
      data: tasks,
      columns: [
        { key: 'id', header: 'ID', width: 8, type: 'number' },
        { key: 'title', header: 'Task Title', width: 30, type: 'text' },
        { key: 'description', header: 'Description', width: 40, type: 'text' },
        { key: 'status', header: 'Status', width: 15, type: 'text' },
        { key: 'priority', header: 'Priority', width: 12, type: 'text' },
        { key: 'project_name', header: 'Project', width: 20, type: 'text' },
        { key: 'assigned_user_name', header: 'Assigned To', width: 20, type: 'text' },
        { key: 'created_by_name', header: 'Created By', width: 20, type: 'text' },
        { key: 'progress_percentage', header: 'Progress %', width: 12, type: 'percentage' },
        { key: 'due_date', header: 'Due Date', width: 15, type: 'date' },
        { key: 'created_at', header: 'Created At', width: 20, type: 'date' }
      ],
      theme: theme as any,
      includeSummary: true
    };

    const wb = this.createStyledWorkbook(options);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportProjects(format: string = 'xlsx', theme: string = 'modern'): Promise<Buffer> {
    const projects = await database.getAllProjects();
    
    const options: ExcelExportOptions = {
      title: 'Project Management Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()} - Total Projects: ${projects.length}`,
      data: projects,
      columns: [
        { key: 'id', header: 'ID', width: 8, type: 'number' },
        { key: 'name', header: 'Project Name', width: 30, type: 'text' },
        { key: 'description', header: 'Description', width: 40, type: 'text' },
        { key: 'status', header: 'Status', width: 15, type: 'text' },
        { key: 'priority', header: 'Priority', width: 12, type: 'text' },
        { key: 'manager_name', header: 'Manager', width: 20, type: 'text' },
        { key: 'budget', header: 'Budget', width: 15, type: 'currency' },
        { key: 'start_date', header: 'Start Date', width: 15, type: 'date' },
        { key: 'end_date', header: 'End Date', width: 15, type: 'date' },
        { key: 'created_at', header: 'Created At', width: 20, type: 'date' }
      ],
      theme: theme as any,
      includeSummary: true
    };

    const wb = this.createStyledWorkbook(options);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
