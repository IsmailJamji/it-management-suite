import * as XLSX from 'xlsx';
import { database } from '../database/database';

export interface ExcelImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  createdAssets: number;
  errors: string[];
  columnMappings: ColumnMapping[];
  sampleData: any[];
}

export interface ColumnMapping {
  originalName: string;
  mappedField: string;
  confidence: number;
  dataType: string;
  sampleValues: any[];
}

export class ExcelImportService {
  private static readonly FIELD_SYNONYMS = {
    // IT Assets Fields
    'device_type': ['type', 'device type', 'type d\'appareil', 'type appareil', 'categorie', 'catégorie', 'category', 'kind', 'nature', 'desktop', 'laptop', 'portable', 'ordinateur', 'computer', 'pc', 'phone', 'téléphone', 'mobile', 'tablet', 'tablette', 'printer', 'imprimante', 'monitor', 'écran', 'ecran', 'router', 'routeur', 'switch', 'server', 'serveur'],
    'brand': ['marque', 'fabricant', 'manufacturer', 'make', 'constructeur', 'fournisseur', 'supplier'],
    'model': ['modele', 'modèle', 'model', 'reference', 'référence', 'ref', 'version', 'variant'],
    'serial_number': ['numero serie', 'numéro série', 'serial', 'serial number', 'sn', 's/n', 'n° série', 'n° serie'],
    'hostname': ['hostname', 'nom machine', 'nom d\'hôte', 'computer name', 'nom ordinateur', 'machine name'],
    'ticket_number': ['ticket', 'numéro ticket', 'numero ticket', 'ticket number', 'n° ticket', 'n°ticket', 'incident'],
    'date': ['date', 'date acquisition', 'date d\'acquisition', 'acquisition date', 'purchase date', 'date achat', 'date d\'achat', 'created', 'créé'],
    'warranty_expiration': ['garantie', 'warranty', 'expiration garantie', 'warranty expiry', 'fin garantie', 'date fin garantie'],
    'status': ['statut', 'status', 'etat', 'état', 'state', 'condition', 'situation'],
    'assigned_to': ['assigned to', 'assigné à', 'assignee', 'utilisateur', 'user', 'owner', 'propriétaire', 'responsable'],
    'department': ['departement', 'département', 'department', 'service', 'division', 'secteur', 'area', 'zone'],
    'location': ['location', 'emplacement', 'lieu', 'place', 'site', 'adresse', 'address'],
    'processor': ['processeur', 'processor', 'cpu', 'chip', 'puce', 'microprocesseur'],
    'ram_gb': ['ram', 'mémoire', 'memoire', 'memory', 'ram gb', 'ram go', 'mémoire gb', 'memoire gb'],
    'disk_gb': ['disque', 'disk', 'storage', 'stockage', 'hdd', 'ssd', 'disque gb', 'disk gb', 'storage gb', 'stockage gb'],
    'os': ['os', 'operating system', 'système d\'exploitation', 'systeme d\'exploitation', 'windows', 'linux', 'macos'],
    'imei': ['imei', 'imei number', 'numéro imei', 'numero imei'],
    'has_mouse': ['souris', 'mouse', 'avec souris', 'with mouse'],
    'has_keyboard': ['clavier', 'keyboard', 'avec clavier', 'with keyboard'],
    'has_screen': ['écran', 'ecran', 'screen', 'monitor', 'avec écran', 'with screen'],
    'has_headphone': ['casque', 'headphone', 'headset', 'écouteurs', 'ecouteurs', 'avec casque', 'with headphone'],

    // Telecom Assets Fields
    'sim_number': ['numero sim', 'numéro sim', 'sim number', 'sim', 'n° sim', 'n°sim', 'numero telephone', 'numéro téléphone', 'tel', 'telephone', 'phone', 'mobile', 'portable', 'gsm', 'n° tel', 'n°_tel', 'contact', 'numero contact', 'sim numero', 'sim numéro', 'n° tel', 'n°_tel', 'numero tel', 'numéro tel'],
    'sim_owner': ['nom', 'name', 'proprietaire sim', 'propriétaire sim', 'sim owner', 'owner', 'propriétaire', 'proprietaire', 'utilisateur', 'user', 'client', 'customer', 'titulaire', 'holder'],
    'provider': ['fournisseur', 'provider', 'operateur', 'opérateur', 'operator', 'agence', 'agence commerciale', 'commercial', 'bureau', 'office', 'company', 'societe', 'société', 'agence commerciale'],
    'zone': ['zone', 'ville', 'city', 'town', 'municipality', 'municipalite', 'region', 'région', 'area', 'secteur', 'ville'],
    'subscription_type': ['type abonnement', 'subscription type', 'type subscription', 'abonnement', 'subscription', 'plan', 'forfait', 'package'],
    'data_plan': ['plan donnees', 'plan données', 'data plan', 'dataplan', 'forfait donnees', 'forfait données', 'data package', 'package donnees'],
    'pin_code': ['code pin', 'pin', 'pin code', 'code pin sim', 'pin sim'],
    'puk_code': ['code puk', 'puk', 'puk code', 'code puk sim', 'puk sim']
  };

  private static readonly REQUIRED_FIELDS = {
    'it_assets': ['device_type', 'brand', 'model', 'serial_number'],
    'telecom_assets': ['sim_number', 'sim_owner', 'provider']
  };

  private static readonly FIELD_TYPES: { [key: string]: string } = {
    'device_type': 'text',
    'brand': 'text',
    'model': 'text',
    'serial_number': 'text',
    'hostname': 'text',
    'ticket_number': 'text',
    'date': 'date',
    'warranty_expiration': 'date',
    'status': 'text',
    'assigned_to': 'text',
    'department': 'text',
    'location': 'text',
    'processor': 'text',
    'ram_gb': 'number',
    'disk_gb': 'number',
    'os': 'text',
    'imei': 'text',
    'has_mouse': 'boolean',
    'has_keyboard': 'boolean',
    'has_screen': 'boolean',
    'has_headphone': 'boolean',
    'sim_number': 'text',
    'sim_owner': 'text',
    'provider': 'text',
    'zone': 'text',
    'subscription_type': 'text',
    'data_plan': 'text',
    'pin_code': 'text',
    'puk_code': 'text'
  };

  /**
   * Parse Excel file and return preview data
   */
  static async parseExcelFile(fileData: string, assetType: 'it_assets' | 'telecom_assets'): Promise<ExcelImportResult> {
    try {
      console.log(`=== EXCEL IMPORT DEBUG START ===`);
      console.log(`File data length: ${fileData.length}, Asset Type: ${assetType}`);

      // Parse base64 data
      const base64Data = fileData.split(',')[1]; // Remove data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64, prefix
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Read Excel file from buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rawData.length < 2) {
        return {
          success: false,
          message: 'Excel file must contain at least a header row and one data row',
          totalRows: 0,
          createdAssets: 0,
          errors: ['Insufficient data'],
          columnMappings: [],
          sampleData: []
        };
      }

      // Find the actual data section (skip title rows, empty rows, etc.)
      let dataStartIndex = 0;
      let headers: string[] = [];
      let dataRows: any[][] = [];

      // Look for the row that contains actual column headers
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] as any[];
        if (row && row.length > 0) {
          // Check if this row looks like headers (contains common field names)
          const rowText = row.join(' ').toLowerCase();
          if (rowText.includes('nom') || rowText.includes('tel') || rowText.includes('ville') || 
              rowText.includes('departement') || rowText.includes('agence') || 
              rowText.includes('device') || rowText.includes('serial') || rowText.includes('brand') ||
              rowText.includes('id') || rowText.includes('owner') || rowText.includes('model') ||
              rowText.includes('ram') || rowText.includes('disk') || rowText.includes('processor') ||
              rowText.includes('operating') || rowText.includes('status') || rowText.includes('created')) {
            headers = row as string[];
            dataRows = rawData.slice(i + 1) as any[][];
            dataStartIndex = i;
            break;
          }
        }
      }

      // If no headers found, use the first row as headers
      if (headers.length === 0) {
        headers = rawData[0] as string[];
        dataRows = rawData.slice(1) as any[][];
      }

      // Filter out empty rows
      dataRows = dataRows.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''));
      
      console.log(`Headers: ${JSON.stringify(headers)}`);
      console.log(`Data rows: ${dataRows.length}`);
      console.log(`First few data rows: ${JSON.stringify(dataRows.slice(0, 3), null, 2)}`);

      // Map columns to fields
      const columnMappings = this.mapColumnsToFields(headers, assetType);
      console.log(`Column mappings: ${JSON.stringify(columnMappings, null, 2)}`);

      // Process sample data
      const sampleData = this.processSampleData(dataRows.slice(0, 5), columnMappings, assetType, headers);
      console.log(`Sample data: ${JSON.stringify(sampleData, null, 2)}`);

      console.log(`=== EXCEL IMPORT DEBUG END ===`);

      return {
        success: true,
        message: `Preview ready: ${dataRows.length} rows will be imported`,
        totalRows: dataRows.length,
        createdAssets: 0,
        errors: [],
        columnMappings,
        sampleData
      };

    } catch (error) {
      console.error('Excel parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Error parsing Excel file: ${errorMessage}`,
        totalRows: 0,
        createdAssets: 0,
        errors: [errorMessage],
        columnMappings: [],
        sampleData: []
      };
    }
  }

  /**
   * Execute the import with the mapped data
   */
  static async executeImport(fileData: string, assetType: 'it_assets' | 'telecom_assets'): Promise<ExcelImportResult> {
    try {
      console.log(`=== EXCEL IMPORT EXECUTE START ===`);
      console.log(`File data length: ${fileData.length}, Asset Type: ${assetType}`);

      // Parse base64 data
      const base64Data = fileData.split(',')[1]; // Remove data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64, prefix
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Read Excel file from buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Find the actual data section (skip title rows, empty rows, etc.)
      let dataStartIndex = 0;
      let headers: string[] = [];
      let dataRows: any[][] = [];

      // Look for the row that contains actual column headers
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] as any[];
        if (row && row.length > 0) {
          // Check if this row looks like headers (contains common field names)
          const rowText = row.join(' ').toLowerCase();
          if (rowText.includes('nom') || rowText.includes('tel') || rowText.includes('ville') || 
              rowText.includes('departement') || rowText.includes('agence') || 
              rowText.includes('device') || rowText.includes('serial') || rowText.includes('brand') ||
              rowText.includes('id') || rowText.includes('owner') || rowText.includes('model') ||
              rowText.includes('ram') || rowText.includes('disk') || rowText.includes('processor') ||
              rowText.includes('operating') || rowText.includes('status') || rowText.includes('created')) {
            headers = row as string[];
            dataRows = rawData.slice(i + 1) as any[][];
            dataStartIndex = i;
            break;
          }
        }
      }

      // If no headers found, use the first row as headers
      if (headers.length === 0) {
        headers = rawData[0] as string[];
        dataRows = rawData.slice(1) as any[][];
      }

      // Filter out empty rows
      dataRows = dataRows.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''));
      
      console.log(`Headers: ${JSON.stringify(headers)}`);
      console.log(`Data rows: ${dataRows.length}`);
      console.log(`First few data rows: ${JSON.stringify(dataRows.slice(0, 3), null, 2)}`);

      // Map columns to fields
      const columnMappings = this.mapColumnsToFields(headers, assetType);
      console.log(`Column mappings: ${JSON.stringify(columnMappings, null, 2)}`);

      // Process all data
      const processedData = this.processSampleData(dataRows, columnMappings, assetType, headers);
      console.log(`Processed data: ${processedData.length} rows`);

      // Create assets in database
      let createdAssets = 0;
      const errors: string[] = [];

      for (const assetData of processedData) {
        try {
          if (assetType === 'it_assets') {
            await database.createITAsset(assetData);
          } else {
            await database.createTelecomAsset(assetData);
          }
          createdAssets++;
        } catch (error) {
          console.error('Error creating asset:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${createdAssets + 1}: ${errorMessage}`);
        }
      }

      console.log(`Created assets: ${createdAssets}`);
      console.log(`Errors: ${errors.length}`);

      console.log(`=== EXCEL IMPORT EXECUTE END ===`);

      return {
        success: true,
        message: `Successfully imported ${createdAssets} ${assetType}`,
        totalRows: dataRows.length,
        createdAssets,
        errors,
        columnMappings,
        sampleData: processedData.slice(0, 5)
      };

    } catch (error) {
      console.error('Excel import execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Error executing import: ${errorMessage}`,
        totalRows: 0,
        createdAssets: 0,
        errors: [errorMessage],
        columnMappings: [],
        sampleData: []
      };
    }
  }

  /**
   * Map Excel columns to database fields
   */
  private static mapColumnsToFields(headers: string[], assetType: 'it_assets' | 'telecom_assets'): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];
    const usedFields = new Set<string>();

    for (const header of headers) {
      if (!header || typeof header !== 'string') continue;

      const normalizedHeader = this.normalizeString(header);
      let bestMatch = '';
      let bestConfidence = 0;

      // Check against all field synonyms
      for (const [field, synonyms] of Object.entries(this.FIELD_SYNONYMS)) {
        // Skip if field is already used
        if (usedFields.has(field)) continue;

        // Skip if field is not relevant to asset type
        if (assetType === 'it_assets' && field.startsWith('sim_')) continue;
        if (assetType === 'telecom_assets' && !field.startsWith('sim_') && !['provider', 'zone', 'subscription_type', 'data_plan', 'pin_code', 'puk_code', 'department'].includes(field)) continue;

        // Debug logging for department field
        if (field === 'department' && assetType === 'telecom_assets') {
          console.log(`DEBUG: Checking department mapping for header: "${header}"`);
        }

        for (const synonym of synonyms) {
          const normalizedSynonym = this.normalizeString(synonym);
          const similarity = this.calculateSimilarity(normalizedHeader, normalizedSynonym);
          
          // Debug logging for department field
          if (field === 'department' && assetType === 'telecom_assets') {
            console.log(`DEBUG: Checking synonym "${synonym}" -> similarity: ${similarity}`);
          }
          
          // Prioritize exact matches and higher similarity
          if (similarity > bestConfidence && similarity > 0.6) {
            // Give extra boost to exact matches
            const exactMatch = normalizedHeader === normalizedSynonym;
            const adjustedConfidence = exactMatch ? 1.0 : similarity;
            
            // Special handling for sim_owner - only map if it's a clear match
            if (field === 'sim_owner' && !exactMatch && similarity < 0.9) {
              continue; // Skip weak matches for sim_owner
            }
            
            // Block "Check" from being mapped to sim_owner
            if (field === 'sim_owner' && (normalizedHeader.includes('check') || normalizedHeader === 'check')) {
              continue; // Skip "Check" column for sim_owner
            }
            
            if (adjustedConfidence > bestConfidence) {
              bestMatch = field;
              bestConfidence = adjustedConfidence;
            }
          }
        }
      }

      if (bestMatch) {
        usedFields.add(bestMatch);
        mappings.push({
          originalName: header,
          mappedField: bestMatch,
          confidence: bestConfidence,
          dataType: this.FIELD_TYPES[bestMatch] || 'text',
          sampleValues: []
        });
      }
    }

    return mappings;
  }

  /**
   * Process sample data using column mappings
   */
  private static processSampleData(dataRows: any[][], columnMappings: ColumnMapping[], assetType: 'it_assets' | 'telecom_assets', headers: string[]): any[] {
    const processedData: any[] = [];

    for (const row of dataRows) {
      const assetData: any = {};

      // Map data using column mappings first
      for (const mapping of columnMappings) {
        // Find the column index by looking for the original header name in the headers array
        const columnIndex = headers.indexOf(mapping.originalName);
        
        if (columnIndex !== -1 && columnIndex < row.length) {
          const value = row[columnIndex];
          if (value !== null && value !== undefined && value !== '') {
            let normalizedValue = this.normalizeValue(value, mapping.mappedField);
            
            // Special handling for provider field
            if (mapping.mappedField === 'provider' && assetType === 'telecom_assets') {
              normalizedValue = this.normalizeProvider(normalizedValue);
            }
            
            assetData[mapping.mappedField] = normalizedValue;
            console.log(`Mapped ${mapping.originalName} -> ${mapping.mappedField}: ${value} -> ${normalizedValue}`);
          }
        }
      }

      // Set default values based on asset type (only if not provided by mapping)
      if (assetType === 'it_assets') {
        // Map device types to match UI form expectations
        if (assetData.device_type) {
          const deviceType = assetData.device_type.toLowerCase();
          if (deviceType.includes('desktop') || deviceType.includes('ordinateur de bureau')) {
            assetData.device_type = 'desktop';
          } else if (deviceType.includes('laptop') || deviceType.includes('portable') || deviceType.includes('ordinateur portable')) {
            assetData.device_type = 'laptop';
          } else if (deviceType.includes('phone') || deviceType.includes('téléphone') || deviceType.includes('mobile')) {
            assetData.device_type = 'phone';
          } else if (deviceType.includes('tablet') || deviceType.includes('tablette')) {
            assetData.device_type = 'tablet';
          } else if (deviceType.includes('printer') || deviceType.includes('imprimante')) {
            assetData.device_type = 'printer';
          } else if (deviceType.includes('monitor') || deviceType.includes('écran') || deviceType.includes('ecran')) {
            assetData.device_type = 'monitor';
          } else if (deviceType.includes('router') || deviceType.includes('routeur')) {
            assetData.device_type = 'router';
          } else if (deviceType.includes('switch')) {
            assetData.device_type = 'switch';
          } else if (deviceType.includes('server') || deviceType.includes('serveur')) {
            assetData.device_type = 'server';
          } else {
            // Default to desktop for computers with specs
            if (assetData.ram_gb || assetData.disk_gb || assetData.processor || assetData.os) {
              assetData.device_type = 'desktop';
            } else {
              assetData.device_type = 'desktop'; // Default to desktop
            }
          }
        } else {
          // Default to desktop if no device type specified
          assetData.device_type = 'desktop';
        }
        
        if (!assetData.status) assetData.status = 'active';
        if (!assetData.department) assetData.department = 'IT';
        if (!assetData.location) assetData.location = 'Office';
      } else {
        if (!assetData.status) assetData.status = 'active';
        if (!assetData.department) assetData.department = 'IT';
        if (!assetData.zone) assetData.zone = 'Office';
        if (!assetData.subscription_type) assetData.subscription_type = 'Monthly';
        if (!assetData.data_plan) assetData.data_plan = 'Basic';
      }

      // Generate missing required fields
      if (assetType === 'it_assets') {
        if (!assetData.serial_number) {
          assetData.serial_number = `SN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!assetData.owner_name) {
          assetData.owner_name = 'Unassigned';
        }
        if (!assetData.brand) {
          assetData.brand = 'Unknown';
        }
        if (!assetData.model) {
          assetData.model = 'Unknown';
        }
        if (!assetData.date) {
          assetData.date = new Date().toISOString().split('T')[0];
        }
      } else {
        if (!assetData.sim_number) {
          assetData.sim_number = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!assetData.sim_owner) {
          assetData.sim_owner = 'Unassigned';
        }
        if (!assetData.provider) {
          assetData.provider = 'IAM'; // Default to IAM instead of Unknown
        }
        if (!assetData.date) {
          assetData.date = new Date().toISOString().split('T')[0];
        }
      }

      processedData.push(assetData);
    }

    return processedData;
  }

  /**
   * Normalize string for comparison
   */
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Calculate similarity between two strings
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize value based on field type
   */
  private static normalizeValue(value: any, field: string): any {
    if (value === null || value === undefined) return null;

    const fieldType = this.FIELD_TYPES[field];
    
    switch (fieldType) {
      case 'number':
        const num = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
        return isNaN(num) ? null : num;
      
      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      
      case 'boolean':
        const str = value.toString().toLowerCase();
        return str === 'true' || str === '1' || str === 'yes' || str === 'oui' || str === 'o';
      
      default:
        return value.toString().trim();
    }
  }

  /**
   * Normalize provider value to match database constraints
   */
  private static normalizeProvider(value: string): string {
    if (!value) return 'IAM';
    
    const provider = value.toString().toUpperCase();
    
    // Map common provider names to valid database values
    if (provider.includes('IAM') || provider.includes('MAROC') || provider.includes('TELECOM') || provider.includes('COMMERCIAL')) {
      return 'IAM';
    } else if (provider.includes('INWI') || provider.includes('WANA')) {
      return 'INWI';
    } else if (provider.includes('ORANGE') || provider.includes('MEDITEL')) {
      return 'ORANGE';
    } else {
      // Default to IAM for unknown providers
      return 'IAM';
    }
  }
}
