
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { database } from '../database/database';

export interface ImportResult {
  success: boolean;
  message: string;
  createdAssets: number;
  errors: string[];
  mappedColumns: { [key: string]: string };
  sampleData: any[];
}

export interface ColumnMapping {
  originalName: string;
  mappedField: string;
  confidence: number;
  dataType: string;
  sampleValues: any[];
}

export class AIImportService {
  private readonly IT_ASSET_FIELDS = [
    'id', 'device_type', 'owner_name', 'department', 'zone',
    'serial_number', 'ticket_number', 'model', 'brand', 'date', 'ram_gb',
    'disk_gb', 'processor', 'os', 'peripheral_type', 'connection_type', 'status'
  ];

  private readonly TELECOM_ASSET_FIELDS = [
    'id', 'provider', 'sim_number', 'sim_owner', 'subscription_type', 'date',
    'zone', 'department', 'data_plan', 'status', 'pin_code', 'puk_code',
    'serial_number', 'model', 'brand', 'imei', 'location', 'notes'
  ];

  private readonly FIELD_SYNONYMS = {
    // IT Asset synonyms - Enhanced French support
    'device_type': [
      'type', 'device', 'equipment', 'machine', 'appareil', 'équipement',
      'type_appareil', 'type_équipement', 'nature', 'catégorie', 'genre',
      'pc', 'ordinateur', 'laptop', 'portable', 'desktop', 'serveur',
      'type_equipement', 'type_equipement', 'categorie', 'type_machine',
      'type_pc', 'type_ordinateur', 'type_laptop', 'type_portable',
      'type_desktop', 'type_serveur', 'type_imprimante', 'type_moniteur',
      'type_routeur', 'type_switch', 'type_serveur', 'type_imprimante',
      'type_moniteur', 'type_routeur', 'type_switch', 'type_serveur',
      'type_imprimante', 'type_moniteur', 'type_routeur', 'type_switch',
      'typ', 'equipement_type', 'appareil_type', 'machine_type',
      'categorie_equipement', 'genre_equipement', 'nature_equipement'
    ],
    'owner_name': [
      'owner', 'user', 'assigned_to', 'responsable', 'utilisateur',
      'nom', 'nom_utilisateur', 'propriétaire', 'assigné', 'attribué',
      'utilisateur_assigné', 'responsable_équipement', 'nom_propriétaire',
      'nom_utilisateur', 'nom_assigné', 'nom_attribué', 'nom_responsable',
      'utilisateur', 'propriétaire', 'assigné', 'attribué', 'responsable',
      'utilisateur_assigné', 'responsable_équipement', 'nom_propriétaire',
      'nom_utilisateur', 'nom_assigné', 'nom_attribué', 'nom_responsable'
    ],
    'department': [
      'dept', 'division', 'service', 'département', 'service',
      'direction', 'secteur', 'unité', 'bureau', 'section',
      'departement', 'service', 'direction', 'secteur', 'unite',
      'bureau', 'section', 'dept', 'division', 'service',
      'departement', 'service', 'direction', 'secteur', 'unite'
    ],
    'zone': [
      'location', 'area', 'site', 'zone', 'lieu', 'emplacement',
      'localisation', 'salle', 'bureau', 'étage', 'bâtiment',
      'adresse', 'position',
      // Telecom-specific city mappings
      'ville', 'city', 'town', 'municipality', 'municipalite'
    ],
    'serial_number': [
      'serial', 'serial_no', 'numéro_serie', 'série',
      'numéro_de_série', 'n°_série', 'n°_serie', 's/n', 'serie',
      'numéro_serie', 'numero_serie', 'n_serie', 'numero', 'numéro',
      'identifiant', 'id', 's_n', 'serial_number', 'numero_serie',
      'n°_série', 'n°_serie', 'n_série', 'n_serie', 'série_numéro',
      'numero_serie', 'numero_série', 'n_serie', 'n_série',
      'identifiant_serie', 'id_serie', 'serie_id', 'serie_identifiant',
      'numero_identifiant', 'identifiant_numero', 'n°_identifiant',
      'n_identifiant', 'n°_id', 'n_id', 'id_n', 'id_n°',
      'numero_de_serie', 'numero_série', 'n°_série', 'n°_serie',
      's_n', 'sn', 'serial', 'serie', 'série', 'numero', 'numéro'
    ],
    'model': [
      'model_name', 'model_number', 'modèle', 'référence',
      'modele', 'ref', 'réf', 'version', 'désignation',
      'nom_modèle', 'nom_modele', 'model', 'modèle_nom', 'nom_modele',
      'version_modele', 'designation', 'désignation',
      'reference', 'référence', 'ref_model', 'model_ref',
      'nom_modele', 'modele_nom', 'designation_modele', 'modele_designation',
      'version_modele', 'modele_version', 'reference_modele', 'modele_reference'
    ],
    'brand': [
      'manufacturer', 'make', 'marque', 'fabricant',
      'constructeur', 'producteur', 'fournisseur', 'origine',
      'brand', 'marque_nom', 'nom_marque', 'fabricant_nom',
      'constructeur_nom', 'marque_fabricant', 'fabricant_marque',
      'marque_constructeur', 'constructeur_marque', 'fabricant_constructeur',
      'constructeur_fabricant', 'marque_fournisseur', 'fournisseur_marque',
      'fabricant_fournisseur', 'fournisseur_fabricant', 'constructeur_fournisseur',
      'fournisseur_constructeur', 'marque_origine', 'origine_marque',
      'fabricant_origine', 'origine_fabricant', 'constructeur_origine',
      'origine_constructeur', 'fournisseur_origine', 'origine_fournisseur'
    ],
    'ram_gb': [
      'ram', 'memory', 'mémoire', 'ram_gb', 'memory_gb',
      'mémoire_ram', 'memoire', 'mémoire_vive', 'memoire_vive',
      'ram_mb', 'ram_go', 'mémoire_go', 'memoire_ram'
    ],
    'disk_gb': [
      'disk', 'storage', 'hard_drive', 'disque', 'stockage',
      'disque_dur', 'hdd', 'ssd', 'capacité', 'espace',
      'disque_go', 'stockage_go', 'capacité_go'
    ],
    'processor': [
      'cpu', 'chip', 'processeur', 'puce',
      'microprocesseur', 'cpu_type', 'type_cpu', 'marque_cpu'
    ],
    'os': [
      'operating_system', 'system', 'système', 'os',
      'système_exploitation', 'systeme', 'os_version', 'version_os'
    ],
    'status': [
      'state', 'condition', 'état', 'statut',
      'situation', 'position', 'disponibilité', 'fonctionnement'
    ],
    // Activity field removed from telecom assets
    'ticket_number': [
      'ticket', 'numéro_ticket', 'numero_ticket', 'n°_ticket',
      'ticket_no', 'ticket_number', 'demande', 'incident'
    ],
    
    // Telecom Asset synonyms - Enhanced French support
    'provider': [
      'carrier', 'operator', 'opérateur', 'fournisseur',
      'opérateur_télécom', 'operateur', 'opérateur_telecom',
      'fournisseur_service', 'prestataire', 'opérateur_mobile',
      'operateur_mobile', 'opérateur_telecom', 'operateur_telecom',
      'fournisseur_telecom', 'prestataire_telecom', 'opérateur_reseau',
      'operateur_reseau', 'fournisseur_reseau', 'prestataire_reseau',
      'opérateur_service', 'operateur_service', 'fournisseur_service',
      'prestataire_service', 'opérateur_mobile', 'operateur_mobile',
      // Specific Moroccan providers
      'iam', 'inwi', 'orange', 'maroc_telecom', 'meditel',
      'itissalat', 'wana', 'bayn',
      // Telecom-specific agency mappings
      'agence', 'agence_commerciale', 'commercial', 'bureau', 'office'
    ],
    'sim_number': [
      'sim', 'sim_card', 'sim_id', 'carte_sim', 'sim',
      'numéro_sim', 'numero_sim', 'n°_sim', 'n_sim',
      'iccid', 'sim_number', 'carte_sim_numéro', 'numero_carte_sim',
      'numéro_carte_sim', 'n°_carte_sim', 'n_carte_sim',
      'carte_sim_numero', 'carte_sim_numéro', 'sim_carte',
      'carte_sim_id', 'id_carte_sim', 'sim_id_carte',
      'carte_sim_iccid', 'iccid_carte_sim', 'sim_iccid',
      // Telecom-specific phone number mappings - HIGH PRIORITY
      'n°_tel', 'n_tel', 'tel', 'telephone', 'phone', 'mobile', 'portable', 'gsm',
      'numero_telephone', 'numero_tel', 'n°_telephone', 'n_telephone', 'n_tel',
      'contact', 'numero_contact', 'sim_numero', 'sim_numéro'
    ],
    'sim_owner': [
      'sim_user', 'card_owner', 'propriétaire_sim', 'utilisateur_sim',
      'proprietaire_sim', 'utilisateur_carte', 'titulaire_sim',
      'nom_sim', 'propriétaire_carte', 'utilisateur_sim_carte',
      'utilisateur_carte_sim', 'propriétaire_sim_carte', 'propriétaire_carte_sim',
      'titulaire_sim_carte', 'titulaire_carte_sim', 'nom_propriétaire_sim',
      'nom_proprietaire_sim', 'nom_utilisateur_sim', 'nom_utilisateur_carte',
      'nom_titulaire_sim', 'nom_titulaire_carte', 'utilisateur_nom',
      'propriétaire_nom', 'titulaire_nom', 'nom_utilisateur',
      'nom_propriétaire', 'nom_titulaire',
      // Telecom-specific name mappings
      'nom', 'name', 'client', 'customer', 'utilisateur', 'user'
    ],
    'subscription_type': [
      'plan', 'subscription', 'abonnement', 'forfait',
      'type_abonnement', 'type_forfait', 'formule', 'offre',
      'contrat', 'plan_tarifaire', 'type_plan', 'type_subscription',
      'type_abonnement', 'type_forfait', 'type_formule', 'type_offre',
      'type_contrat', 'type_plan_tarifaire', 'plan_type', 'subscription_type',
      'abonnement_type', 'forfait_type', 'formule_type', 'offre_type',
      'contrat_type', 'plan_tarifaire_type', 'tarif', 'tarification',
      'prix', 'cout', 'coût', 'montant', 'valeur',
      // Common subscription types
      'postpaid', 'prepaid', 'prépayé', 'postpayé', 'prepaye', 'postpaye',
      'business', 'corporate', 'entreprise', 'professionnel', 'personnel',
      'standard', 'premium', 'basic', 'basique', 'simple'
    ],
    'data_plan': [
      'data', 'internet', 'données', 'internet',
      'donnees', 'forfait_data', 'forfait_données',
      'connexion', 'data_plan', 'plan_données',
      'forfait_internet', 'forfait_data', 'forfait_donnees',
      'forfait_données', 'plan_internet', 'plan_data',
      'plan_donnees', 'plan_données', 'connexion_data',
      'connexion_internet', 'connexion_donnees', 'connexion_données',
      'internet_plan', 'data_plan', 'donnees_plan', 'données_plan',
      'internet_forfait', 'data_forfait', 'donnees_forfait', 'données_forfait',
      'internet_connexion', 'data_connexion', 'donnees_connexion', 'données_connexion',
      // Common data plan sizes
      '1gb', '2gb', '5gb', '10gb', '20gb', '50gb', '100gb', 'unlimited',
      'illimité', 'illimite', 'mo', 'go', 'mb', 'gb', 'mega', 'giga'
    ],
    'pin_code': [
      'pin', 'code_pin', 'pin_code', 'code_pin',
      'pin_sim', 'code_pin_sim', 'n°_pin', 'n_pin',
      'pin_carte', 'code_pin_carte', 'pin_carte_sim',
      'code_pin_carte_sim', 'carte_pin', 'carte_code_pin',
      'sim_pin', 'sim_code_pin', 'carte_sim_pin',
      'carte_sim_code_pin', 'pin_numero', 'pin_numéro',
      'code_pin_numero', 'code_pin_numéro', 'n°_code_pin',
      'n_code_pin', 'n°_pin_code', 'n_pin_code'
    ],
    'puk_code': [
      'puk', 'code_puk', 'puk_code', 'code_puk',
      'puk_sim', 'code_puk_sim', 'n°_puk', 'n_puk',
      'puk_carte', 'code_puk_carte', 'puk_carte_sim',
      'code_puk_carte_sim', 'carte_puk', 'carte_code_puk',
      'sim_puk', 'sim_code_puk', 'carte_sim_puk',
      'carte_sim_code_puk', 'puk_numero', 'puk_numéro',
      'code_puk_numero', 'code_puk_numéro', 'n°_code_puk',
      'n_code_puk', 'n°_puk_code', 'n_puk_code'
    ]
  };

  async importExcelFile(fileData: string, assetType: 'it' | 'telecom'): Promise<ImportResult> {
    try {
      console.log(`Starting AI-powered import for ${assetType} assets from base64 data`);
      
      // Read Excel file from base64 data
      const workbook = new ExcelJS.Workbook();
      const buffer = Buffer.from(fileData, 'base64');
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      // Extract data from Excel
      const rawData = this.extractDataFromWorksheet(worksheet);
      console.log('Raw data extracted:', rawData.length, 'rows');

      if (rawData.length === 0) {
        return {
          success: false,
          message: 'No data found in Excel file',
          createdAssets: 0,
          errors: ['No data rows found'],
          mappedColumns: {},
          sampleData: []
        };
      }

      // AI-powered column mapping with data analysis
      const columnMappings = await this.mapColumnsWithAI(rawData[0], assetType, rawData);
      console.log('Column mappings:', columnMappings);

      // Validate and clean data
      const cleanedData = this.cleanAndValidateData(rawData, columnMappings, assetType);
      console.log('Cleaned data:', cleanedData.length, 'rows');

      // Create assets in database
      const createdAssets = await this.createAssetsInDatabase(cleanedData, assetType);
      console.log('Created assets:', createdAssets);

      return {
        success: true,
        message: `Successfully imported ${createdAssets} ${assetType} assets`,
        createdAssets,
        errors: [],
        mappedColumns: this.formatColumnMappings(columnMappings),
        sampleData: cleanedData.slice(0, 3) // First 3 rows as sample
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAssets: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        mappedColumns: {},
        sampleData: []
      };
    }
  }

  private extractDataFromWorksheet(worksheet: ExcelJS.Worksheet): any[] {
    const data: any[] = [];
    const headers: string[] = [];

    // Get headers from first row
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || `Column_${colNumber}`;
    });

    // Extract data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });

      // Only add rows that have some data
      if (Object.keys(rowData).some(key => rowData[key] !== null && rowData[key] !== undefined && rowData[key] !== '')) {
        data.push(rowData);
      }
    });

    return data;
  }

  private async mapColumnsWithAI(headers: any, assetType: 'it' | 'telecom', allData?: any[]): Promise<ColumnMapping[]> {
    console.log('=== AI MAPPING DEBUG START ===');
    console.log('Headers received:', Object.keys(headers));
    console.log('Asset type:', assetType);
    
    const targetFields = assetType === 'it' ? this.IT_ASSET_FIELDS : this.TELECOM_ASSET_FIELDS;
    const mappings: ColumnMapping[] = [];

    // Analyze actual data content to extract real information
    const extractedInfo = this.extractRealDataFromCSV(allData || [], headers);
    console.log('Extracted real data:', extractedInfo);

    // Columns to exclude from mapping
    const excludedColumns = ['n.b', 'nb', 'n°b', 'n°_b', 'n_b', 'quantite', 'qte', 'nombre', 'count', 'note', 'notes', 'comment', 'commentaire'];
    console.log('Excluded columns:', excludedColumns);

    for (const [originalName, value] of Object.entries(headers)) {
      if (!value) continue;

      const originalStr = this.normalizeString(originalName.toString());
      
      // Skip excluded columns
      if (excludedColumns.includes(originalStr)) {
        console.log(`Skipping excluded column: ${originalName} (${originalStr})`);
        continue;
      }
      let bestMatch = '';
      let bestConfidence = 0;
      let dataType = 'text';

      // Special priority handling for "type" - should always be device_type (MUST BE FIRST)
      if (originalStr === 'type' && targetFields.includes('device_type')) {
        console.log(`Special handling: ${originalName} -> device_type`);
        bestMatch = 'device_type';
        bestConfidence = 1.0;
      }

      // Direct field match (exact)
      if (!bestMatch) {
        for (const field of targetFields) {
          if (originalStr === field.toLowerCase()) {
            bestMatch = field;
            bestConfidence = 1.0;
            break;
          }
        }
      }

      // 2. Smart pattern recognition
      if (!bestMatch) {
        const patternMatch = this.analyzeColumnPattern(originalName.toString(), value, targetFields);
        if (patternMatch) {
          bestMatch = patternMatch.field;
          bestConfidence = patternMatch.confidence;
        }
      }

      // 3. Enhanced synonym matching with context awareness
      if (!bestMatch) {
        for (const [field, synonyms] of Object.entries(this.FIELD_SYNONYMS)) {
          if (targetFields.includes(field)) {
            for (const synonym of synonyms) {
              const normalizedSynonym = this.normalizeString(synonym);
              const similarity = this.calculateSimilarity(originalStr, normalizedSynonym);
              
              // Debug logging for telecom fields
              if (assetType === 'telecom' && (field === 'sim_number' || field === 'sim_owner' || field === 'provider' || field === 'zone' || field === 'department')) {
                console.log(`Checking ${originalStr} against ${synonym} (${field}): similarity=${similarity}`);
              }
              
              // Boost confidence for exact matches
              let adjustedSimilarity = similarity;
              if (originalStr === normalizedSynonym) {
                adjustedSimilarity = 0.98;
              } else if (originalStr.includes(normalizedSynonym) || normalizedSynonym.includes(originalStr)) {
                adjustedSimilarity = Math.max(similarity, 0.85);
              }
              
              // Context-aware confidence boosting
              adjustedSimilarity = this.boostConfidenceWithContext(originalName.toString(), field, value, adjustedSimilarity);
              
              if (adjustedSimilarity > bestConfidence && adjustedSimilarity > 0.25) {
                bestMatch = field;
                bestConfidence = adjustedSimilarity;
                if (assetType === 'telecom' && (field === 'sim_number' || field === 'sim_owner' || field === 'provider' || field === 'zone' || field === 'department')) {
                  console.log(`Found match: ${originalStr} -> ${field} (confidence: ${adjustedSimilarity})`);
                }
              }
            }
          }
        }
      }

      // Fuzzy matching for partial matches with lower threshold
      if (!bestMatch) {
        for (const field of targetFields) {
          const similarity = this.calculateSimilarity(originalStr, field.toLowerCase());
          if (similarity > bestConfidence && similarity > 0.4) {
            bestMatch = field;
            bestConfidence = similarity;
          }
        }
      }

      // 4. Special handling for common French patterns
      if (!bestMatch) {
        bestMatch = this.handleSpecialFrenchPatterns(originalStr, targetFields);
        if (bestMatch) {
          bestConfidence = 0.8; // Higher confidence for pattern matches
        }
      }

      // 5. Intelligent fallback for unmapped columns
      if (!bestMatch && this.shouldMapColumn(originalStr, value)) {
        const fallbackMatch = this.findIntelligentFallback(originalStr, value, targetFields, mappings, assetType);
        if (fallbackMatch) {
          bestMatch = fallbackMatch.field;
          bestConfidence = fallbackMatch.confidence;
        }
      }

      // Determine data type based on field name and content
      if (bestMatch) {
        dataType = this.determineDataType(bestMatch, originalStr);
      }

      // Only add mapping if we found a good match or if it's a meaningful column
      if (bestMatch || this.shouldMapColumn(originalStr, value)) {
        mappings.push({
          originalName: originalName.toString(),
          mappedField: bestMatch || originalName.toString(),
          confidence: bestConfidence,
          dataType,
          sampleValues: []
        });
      }
    }

    console.log('Final mappings:', mappings);
    console.log('=== AI MAPPING DEBUG END ===');
    return mappings;
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private handleSpecialFrenchPatterns(originalStr: string, targetFields: string[]): string {
    // Handle common French patterns with better matching
    const patterns = {
      // Owner/User patterns
      'nom': 'owner_name',
      'prenom': 'owner_name',
      'utilisateur': 'owner_name',
      'responsable': 'owner_name',
      'proprietaire': 'owner_name',
      'assigne': 'owner_name',
      'attribue': 'owner_name',
      
      // Device type patterns - HIGH PRIORITY
      'type': 'device_type',
      'nature': 'device_type',
      'categorie': 'device_type',
      'genre': 'device_type',
      'appareil': 'device_type',
      'equipement': 'device_type',
      
      // Department patterns
      'departement': 'department',
      'service': 'department',
      'direction': 'department',
      'unite': 'department',
      'bureau': 'department',
      'section': 'department',
      
      // Location patterns
      'zone': 'zone',
      'lieu': 'zone',
      'emplacement': 'zone',
      'localisation': 'zone',
      'salle': 'zone',
      'etage': 'zone',
      'batiment': 'zone',
      
      // Serial number patterns (enhanced) - HIGH PRIORITY
      'numero': 'serial_number',
      'serie': 'serial_number',
      'numero_serie': 'serial_number',
      'numero_de_serie': 'serial_number',
      'n_serie': 'serial_number',
      'n°_serie': 'serial_number',
      's_n': 'serial_number',
      'sn': 'serial_number',
      'serial': 'serial_number',
      'identifiant': 'serial_number',
      'id': 'serial_number',
      
      // Model patterns (enhanced) - HIGH PRIORITY
      'modele': 'model',
      'reference': 'model',
      'ref': 'model',
      'nom_modele': 'model',
      'type_modele': 'model',
      'version': 'model',
      'designation': 'model',
      'modele_nom': 'model',
      
      // Brand patterns (enhanced) - HIGH PRIORITY
      'marque': 'brand',
      'fabricant': 'brand',
      'constructeur': 'brand',
      'producteur': 'brand',
      'fournisseur': 'brand',
      'origine': 'brand',
      'nom_marque': 'brand',
      'marque_nom': 'brand',
      
      // Technical specs
      'memoire': 'ram_gb',
      'ram': 'ram_gb',
      'disque': 'disk_gb',
      'stockage': 'disk_gb',
      'processeur': 'processor',
      'cpu': 'processor',
      'systeme': 'os',
      'os': 'os',
      'etat': 'status',
      'statut': 'status',
      // Activity field removed
      'ticket': 'ticket_number',
      'demande': 'ticket_number'
    };

    // First try exact matches with priority
    for (const [pattern, field] of Object.entries(patterns)) {
      if (originalStr === pattern && targetFields.includes(field)) {
        return field;
      }
    }

    // Then try contains matches with priority
    for (const [pattern, field] of Object.entries(patterns)) {
      if (originalStr.includes(pattern) && targetFields.includes(field)) {
        return field;
      }
    }

    // Special handling for common abbreviations and variations
    if (originalStr.includes('n°') || originalStr.includes('n_') || originalStr.includes('no')) {
      if (originalStr.includes('serie') || originalStr.includes('série')) {
        return 'serial_number';
      }
      // If it's just n° or n_ without serie, it's likely serial number
      if (originalStr === 'n°' || originalStr === 'n_' || originalStr === 'no' || originalStr === 'n.b' || originalStr === 'nb') {
        return 'serial_number';
      }
    }

    if (originalStr.includes('mod') || originalStr.includes('ref')) {
      return 'model';
    }

    if (originalStr.includes('marq') || originalStr.includes('fab')) {
      return 'brand';
    }

    // Special case for "Type" - should be device_type, not model
    if (originalStr === 'type' || originalStr === 'typ') {
      return 'device_type';
    }

    return '';
  }

  private determineDataType(fieldName: string, originalName: string): string {
    // Number fields
    if (fieldName.includes('_gb') || fieldName.includes('ram') || fieldName.includes('disk') || 
        fieldName.includes('memory') || fieldName.includes('storage') || 
        originalName.toLowerCase().includes('go') || originalName.toLowerCase().includes('gb') ||
        originalName.toLowerCase().includes('mb') || originalName.toLowerCase().includes('mo')) {
      return 'number';
    }
    
    // Date fields
    if (fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated') ||
        originalName.toLowerCase().includes('date') || originalName.toLowerCase().includes('créé') ||
        originalName.toLowerCase().includes('modifié') || originalName.toLowerCase().includes('ajouté')) {
      return 'date';
    }
    
    // Text fields (default)
    return 'text';
  }

  // New intelligent analysis methods for better column mapping
  private analyzeColumnPattern(columnName: string, sampleValue: any, targetFields: string[]): { field: string; confidence: number } | null {
    const normalized = this.normalizeString(columnName);
    
    // Pattern-based analysis
    const patterns = {
      // Device type patterns
      'device_type': [
        /^(type|kind|category|nature|equipment|device)$/i,
        /^(pc|laptop|desktop|server|printer|monitor)$/i,
        /^(computer|machine|appareil|équipement)$/i
      ],
      // Serial number patterns
      'serial_number': [
        /^(serial|sn|s\/n|numéro|numero|id|identifier)$/i,
        /^(serial_number|serial_no|serialnumber)$/i,
        /^(s_n|s-n|sn_|sn-)$/i
      ],
      // Model patterns
      'model': [
        /^(model|modèle|modele|reference|ref|version)$/i,
        /^(model_name|model_number|modelname)$/i,
        /^(designation|specification|spec)$/i
      ],
      // Brand patterns
      'brand': [
        /^(brand|make|manufacturer|marque|fabricant)$/i,
        /^(company|vendor|supplier|fournisseur)$/i,
        /^(origin|origine|producer|producteur)$/i
      ],
      // Owner patterns
      'owner_name': [
        /^(owner|user|assigned|responsable|utilisateur)$/i,
        /^(name|nom|propriétaire|proprietaire)$/i,
        /^(assigned_to|assignedto|user_name|username)$/i
      ],
      // Department patterns
      'department': [
        /^(dept|department|service|direction)$/i,
        /^(division|unit|section|bureau)$/i,
        /^(team|group|équipe|groupe)$/i
      ]
    };

    for (const [field, fieldPatterns] of Object.entries(patterns)) {
      if (targetFields.includes(field)) {
        for (const pattern of fieldPatterns) {
          if (pattern.test(columnName)) {
            return { field, confidence: 0.9 };
          }
        }
      }
    }

    // Content-based analysis
    if (sampleValue && typeof sampleValue === 'string') {
      const content = sampleValue.toString().toLowerCase();
      
      // Serial number content patterns
      if (/^(sn-|serial|s\/n|^[a-z0-9]{8,}$)/i.test(content)) {
        return { field: 'serial_number', confidence: 0.85 };
      }
      
      // Model content patterns (usually contains numbers and letters)
      if (/^[a-z0-9\s\-_]{3,}$/i.test(content) && !/^(pc|computer|laptop)$/i.test(content)) {
        return { field: 'model', confidence: 0.7 };
      }
      
      // Brand content patterns (usually short, capitalized words)
      if (/^[a-z]{3,15}$/i.test(content) && !/^(pc|computer|laptop|portable)$/i.test(content)) {
        return { field: 'brand', confidence: 0.7 };
      }
    }

    return null;
  }

  private boostConfidenceWithContext(columnName: string, field: string, sampleValue: any, baseConfidence: number): number {
    let confidence = baseConfidence;

    // Boost based on column position and context
    if (field === 'device_type' && /^(type|kind|category)$/i.test(columnName)) {
      confidence += 0.2;
    }

    if (field === 'serial_number' && /^(serial|sn|id)$/i.test(columnName)) {
      confidence += 0.2;
    }

    if (field === 'model' && /^(model|ref|version)$/i.test(columnName)) {
      confidence += 0.2;
    }

    if (field === 'brand' && /^(brand|make|marque)$/i.test(columnName)) {
      confidence += 0.2;
    }

    // Boost based on sample data content
    if (sampleValue && typeof sampleValue === 'string') {
      const content = sampleValue.toString();
      
      if (field === 'serial_number' && /^(sn-|serial|s\/n)/i.test(content)) {
        confidence += 0.3;
      }
      
      if (field === 'device_type' && /^(pc|laptop|desktop|server|printer)/i.test(content)) {
        confidence += 0.3;
      }
    }

    return Math.min(confidence, 1.0);
  }

  private shouldMapColumn(columnName: string, sampleValue: any): boolean {
    const normalized = this.normalizeString(columnName);
    
    // Skip obviously non-mappable columns
    const skipPatterns = [
      /^(empty|blank|null|na|n\/a)$/i,
      /^(id|index|row|line|number)$/i,
      /^(total|sum|count|quantity|qty)$/i
    ];

    for (const pattern of skipPatterns) {
      if (pattern.test(normalized)) {
        return false;
      }
    }

    // Skip if sample value is empty or meaningless
    if (!sampleValue || sampleValue.toString().trim() === '') {
      return false;
    }

    return true;
  }

  private extractRealDataFromCSV(allData: any[], headers: any): any {
    const extractedInfo = {
      serialNumbers: new Set<string>(),
      models: new Set<string>(),
      brands: new Set<string>(),
      deviceTypes: new Set<string>(),
      owners: new Set<string>(),
      departments: new Set<string>(),
      dates: new Set<string>()
    };

    // Analyze first 10 rows to extract patterns
    const sampleSize = Math.min(10, allData.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const row = allData[i];
      if (!row) continue;

      // Look for serial number patterns in any column
      for (const [key, value] of Object.entries(row)) {
        if (!value || typeof value !== 'string') continue;
        
        const str = value.toString().trim();
        
        // Serial number patterns
        if (this.isSerialNumber(str)) {
          extractedInfo.serialNumbers.add(str);
        }
        
        // Model patterns (brand + model combinations)
        if (this.isModel(str)) {
          extractedInfo.models.add(str);
        }
        
        // Brand patterns
        if (this.isBrand(str)) {
          extractedInfo.brands.add(str);
        }
        
        // Device type patterns
        if (this.isDeviceType(str)) {
          extractedInfo.deviceTypes.add(str);
        }
        
        // Owner name patterns
        if (this.isOwnerName(str)) {
          extractedInfo.owners.add(str);
        }
        
        // Department patterns
        if (this.isDepartment(str)) {
          extractedInfo.departments.add(str);
        }
        
        // Date patterns
        if (this.isDate(str)) {
          const formattedDate = this.formatDate(str);
          if (formattedDate) {
            extractedInfo.dates.add(formattedDate);
          }
        }
      }
    }

    return {
      serialNumbers: Array.from(extractedInfo.serialNumbers),
      models: Array.from(extractedInfo.models),
      brands: Array.from(extractedInfo.brands),
      deviceTypes: Array.from(extractedInfo.deviceTypes),
      owners: Array.from(extractedInfo.owners),
      departments: Array.from(extractedInfo.departments),
      dates: Array.from(extractedInfo.dates)
    };
  }

  private isSerialNumber(str: string): boolean {
    // Patterns for serial numbers
    const patterns = [
      /^[A-Z]{2,4}-?\d{6,12}-?[A-Z0-9]{3,8}$/i,  // ABC-123456789-XYZ
      /^SN-?\d{10,15}-?[A-Z0-9]{6,12}$/i,        // SN-1234567890-ABC123
      /^[A-Z]{2,4}\d{8,15}$/i,                   // ABC123456789
      /^\d{10,20}$/,                             // Pure numbers (10-20 digits)
      /^[A-Z0-9]{8,20}$/i                        // Alphanumeric 8-20 chars
    ];
    
    return patterns.some(pattern => pattern.test(str)) && str.length >= 8;
  }

  private isModel(str: string): boolean {
    // Model patterns (usually brand + model combinations)
    const modelPatterns = [
      /^(Dell|HP|Lenovo|Asus|Acer|MSI|Apple|Samsung|Toshiba|Sony)\s+[A-Z0-9\-\s]{3,20}$/i,
      /^(ThinkPad|Inspiron|Pavilion|Vostro|Latitude|Precision|EliteBook|ProBook)\s*[A-Z0-9\-\s]{2,15}$/i,
      /^[A-Z]{2,4}\s*[A-Z0-9\-\s]{3,20}$/i,
      /^(MacBook|iMac|Mac\s*Pro|Mac\s*Mini|Mac\s*Air)\s*[A-Z0-9\-\s]{2,15}$/i
    ];
    
    return modelPatterns.some(pattern => pattern.test(str)) && str.length >= 5;
  }

  private isBrand(str: string): boolean {
    // Known brand names
    const brands = [
      'Dell', 'HP', 'Hewlett-Packard', 'Lenovo', 'Asus', 'Acer', 'MSI', 
      'Apple', 'Samsung', 'Toshiba', 'Sony', 'IBM', 'Fujitsu', 'Panasonic',
      'LG', 'AOC', 'BenQ', 'ViewSonic', 'Dell', 'Cisco', 'Netgear', 'TP-Link'
    ];
    
    return brands.some(brand => str.toLowerCase().includes(brand.toLowerCase())) && str.length <= 20;
  }

  private isDeviceType(str: string): boolean {
    // Device type patterns
    const deviceTypes = [
      'PC', 'Laptop', 'Desktop', 'Server', 'Printer', 'Monitor', 'Router', 'Switch',
      'Pc Portable', 'Ordinateur', 'Serveur', 'Imprimante', 'Moniteur', 'Routeur',
      'Switch', 'Tablet', 'Phone', 'Mobile', 'Workstation', 'Thin Client'
    ];
    
    return deviceTypes.some(type => str.toLowerCase().includes(type.toLowerCase()));
  }

  private isOwnerName(str: string): boolean {
    // Name patterns (first name + last name)
    const namePattern = /^[A-Za-zÀ-ÿ\s]{3,30}$/;
    const words = str.trim().split(/\s+/);
    
    return namePattern.test(str) && words.length >= 2 && words.length <= 4;
  }

  private isDepartment(str: string): boolean {
    // Department patterns
    const departments = [
      'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Management',
      'Administration', 'Support', 'Development', 'Research', 'Quality',
      'BU', 'Direction', 'Service', 'Bureau', 'Division', 'Secteur'
    ];
    
    return departments.some(dept => str.toLowerCase().includes(dept.toLowerCase())) || 
           /^[A-Z0-9\-\s]{1,10}$/.test(str);
  }

  private findRealSerialNumberInRow(row: any): string | null {
    for (const [key, value] of Object.entries(row)) {
      if (!value || typeof value !== 'string') continue;
      const str = value.toString().trim();
      if (this.isSerialNumber(str)) {
        return str;
      }
    }
    return null;
  }

  private findRealModelInRow(row: any): string | null {
    for (const [key, value] of Object.entries(row)) {
      if (!value || typeof value !== 'string') continue;
      const str = value.toString().trim();
      if (this.isModel(str)) {
        return str;
      }
    }
    return null;
  }

  private findRealBrandInRow(row: any): string | null {
    for (const [key, value] of Object.entries(row)) {
      if (!value || typeof value !== 'string') continue;
      const str = value.toString().trim();
      if (this.isBrand(str)) {
        return str;
      }
    }
    return null;
  }

  private findRealDateInRow(row: any): string | null {
    for (const [key, value] of Object.entries(row)) {
      if (!value) continue;
      const str = value.toString().trim();
      if (this.isDate(str)) {
        return this.formatDate(str);
      }
    }
    return null;
  }

  private isDate(str: string): boolean {
    // Date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // M/D/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/,       // M-D-YYYY
      /^\d{4}-\d{1,2}-\d{1,2}$/,       // YYYY-M-D
      /^\d{2}\.\d{2}\.\d{4}$/,         // DD.MM.YYYY
      /^\d{1,2}\.\d{1,2}\.\d{4}$/      // D.M.YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(str));
  }

  private formatDate(dateStr: string): string {
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateStr.includes('/')) {
        // Handle MM/DD/YYYY or DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts[0].length === 4) {
          // YYYY/MM/DD
          date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      } else if (dateStr.includes('.')) {
        // Handle DD.MM.YYYY
        const parts = dateStr.split('.');
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else if (dateStr.includes('-')) {
        // Handle YYYY-MM-DD or MM-DD-YYYY
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // MM-DD-YYYY
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      } else {
        // Try direct parsing
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Return in YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  private generateSmartSerialNumber(deviceType: string, ownerName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const devicePrefix = this.getDevicePrefix(deviceType);
    const ownerPrefix = ownerName.substring(0, 3).toUpperCase();
    return `${devicePrefix}-${timestamp}-${ownerPrefix}-${random}`;
  }

  private getDevicePrefix(deviceType: string): string {
    const type = deviceType.toLowerCase();
    if (type.includes('pc') || type.includes('ordinateur')) return 'PC';
    if (type.includes('laptop') || type.includes('portable')) return 'LAP';
    if (type.includes('desktop') || type.includes('bureau')) return 'DESK';
    if (type.includes('server') || type.includes('serveur')) return 'SRV';
    if (type.includes('printer') || type.includes('imprimante')) return 'PRT';
    if (type.includes('monitor') || type.includes('moniteur')) return 'MON';
    if (type.includes('router') || type.includes('routeur')) return 'RT';
    if (type.includes('switch')) return 'SW';
    return 'DEV';
  }

  private inferModelFromDeviceType(deviceType: string): string {
    if (!deviceType) return 'Unknown Model';
    
    const type = deviceType.toLowerCase();
    if (type.includes('pc portable') || type.includes('laptop')) {
      return 'Laptop Computer';
    }
    if (type.includes('pc') || type.includes('ordinateur')) {
      return 'Desktop Computer';
    }
    if (type.includes('serveur') || type.includes('server')) {
      return 'Server System';
    }
    if (type.includes('imprimante') || type.includes('printer')) {
      return 'Network Printer';
    }
    if (type.includes('moniteur') || type.includes('monitor')) {
      return 'LCD Monitor';
    }
    if (type.includes('routeur') || type.includes('router')) {
      return 'Network Router';
    }
    if (type.includes('switch')) {
      return 'Network Switch';
    }
    
    // Return a more descriptive model based on the device type
    return `${deviceType} Device`;
  }

  private inferBrandFromDeviceType(deviceType: string): string {
    if (!deviceType) return 'Unknown Brand';
    
    const type = deviceType.toLowerCase();
    if (type.includes('pc portable') || type.includes('laptop')) {
      return 'Business Laptop';
    }
    if (type.includes('pc') || type.includes('ordinateur')) {
      return 'Business Desktop';
    }
    if (type.includes('serveur') || type.includes('server')) {
      return 'Enterprise Server';
    }
    if (type.includes('imprimante') || type.includes('printer')) {
      return 'Office Printer';
    }
    if (type.includes('moniteur') || type.includes('monitor')) {
      return 'Business Monitor';
    }
    if (type.includes('routeur') || type.includes('router')) {
      return 'Network Equipment';
    }
    if (type.includes('switch')) {
      return 'Network Equipment';
    }
    
    return 'Business Equipment';
  }

  private findIntelligentFallback(columnName: string, sampleValue: any, targetFields: string[], existingMappings: ColumnMapping[], assetType: 'it' | 'telecom'): { field: string; confidence: number } | null {
    const normalized = this.normalizeString(columnName);
    const usedFields = existingMappings.map(m => m.mappedField);
    const availableFields = targetFields.filter(f => !usedFields.includes(f));

    // If we have unused critical fields, try to map to them intelligently
    const criticalFields = assetType === 'telecom' 
      ? ['sim_number', 'sim_owner', 'provider', 'zone', 'department', 'subscription_type', 'data_plan']
      : ['serial_number', 'model', 'brand', 'zone'];
    const unusedCritical = criticalFields.filter(f => availableFields.includes(f));

    for (const field of unusedCritical) {
      // Use content analysis to determine the best fit
      if (sampleValue && typeof sampleValue === 'string') {
        const content = sampleValue.toString();
        
        // Telecom-specific field detection
        if (assetType === 'telecom') {
          if (field === 'sim_number' && /^[0-9]{9,10}$/.test(content)) {
            return { field, confidence: 0.9 };
          }
          
          if (field === 'sim_owner' && /^[A-Z\s]{5,30}$/.test(content)) {
            return { field, confidence: 0.8 };
          }
          
          if (field === 'provider' && /^(iam|inwi|orange|maroc|meditel)/i.test(content)) {
            return { field, confidence: 0.9 };
          }
          
          if (field === 'zone' && /^[A-Za-z\s]{3,20}$/.test(content)) {
            return { field, confidence: 0.8 };
          }
          
          if (field === 'department' && /^[A-Za-z\s]{3,20}$/.test(content)) {
            return { field, confidence: 0.8 };
          }
        } else {
          // IT asset field detection
          if (field === 'serial_number' && /^(sn-|serial|s\/n|^[a-z0-9]{6,}$)/i.test(content)) {
            return { field, confidence: 0.8 };
          }
          
          if (field === 'model' && /^[a-z0-9\s\-_]{3,}$/i.test(content)) {
            return { field, confidence: 0.7 };
          }
          
          if (field === 'brand' && /^[a-z]{3,15}$/i.test(content)) {
            return { field, confidence: 0.7 };
          }
        }
      }
    }

    // Fallback to any available field with low confidence
    if (availableFields.length > 0) {
      return { field: availableFields[0], confidence: 0.3 };
    }

    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isFrenchColumn(columnName: string): boolean {
    const frenchIndicators = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ä', 'ç', 'ù', 'û', 'ü', 'ô', 'ö', 'î', 'ï'];
    return frenchIndicators.some(indicator => columnName.includes(indicator));
  }

  private isCommonAbbreviation(columnName: string, field: string): boolean {
    const abbreviations = {
      'serial_number': ['sn', 's/n', 'numero', 'serie'],
      'model': ['ref', 'réf', 'mod', 'modele'],
      'brand': ['marque', 'make', 'mfg', 'fab'],
      'device_type': ['cat', 'catégorie', 'typ'],
      'department': ['dept', 'div', 'sect', 'dep'],
      'phone_number': ['tel', 'tél', 'mobile', 'gsm'],
      'sim_number': ['sim', 'iccid', 'carte'],
      'provider': ['op', 'opérateur', 'carrier'],
      'ram_gb': ['ram', 'memoire', 'mem'],
      'disk_gb': ['disk', 'disque', 'storage', 'stockage']
    };
    
    const fieldAbbreviations = abbreviations[field as keyof typeof abbreviations] || [];
    return fieldAbbreviations.some(abbr => 
      columnName.toLowerCase().includes(abbr.toLowerCase()) || 
      abbr.toLowerCase().includes(columnName.toLowerCase())
    );
  }

  private isPartialMatch(columnName: string, synonym: string): boolean {
    const words1 = columnName.toLowerCase().split(/[\s_\-\.]+/);
    const words2 = synonym.toLowerCase().split(/[\s_\-\.]+/);
    
    return words1.some(word1 => 
      words2.some(word2 => 
        word1.includes(word2) || word2.includes(word1)
      )
    );
  }

  private isFrenchPattern(columnName: string, field: string): boolean {
    const frenchPatterns = {
      'device_type': ['type', 'nature', 'categorie', 'genre', 'appareil', 'equipement'],
      'owner_name': ['nom', 'prenom', 'utilisateur', 'responsable', 'proprietaire', 'assigne', 'attribue'],
      'serial_number': ['numero', 'serie', 'numero_serie', 'n_serie', 'n°_serie', 's_n', 'sn', 'n.b', 'nb', 'n°b'],
      'model': ['modele', 'reference', 'ref', 'type_modele', 'nom_modele', 'designation'],
      'brand': ['marque', 'fabricant', 'constructeur', 'producteur', 'fournisseur', 'origine'],
      'department': ['departement', 'service', 'direction', 'unite', 'bureau', 'section'],
      'zone': ['lieu', 'emplacement', 'localisation', 'salle', 'etage', 'batiment', 'adresse'],
      // Activity field removed
      'status': ['etat', 'statut', 'situation', 'position', 'disponibilite', 'fonctionnement'],
      'ram_gb': ['memoire', 'ram', 'memoire_ram', 'memoire_vive'],
      'disk_gb': ['disque', 'stockage', 'disque_dur', 'hdd', 'ssd', 'capacite', 'espace'],
      'processor': ['processeur', 'cpu', 'chip', 'puce', 'microprocesseur'],
      'os': ['systeme', 'os', 'systeme_exploitation', 'systeme_operatif'],
      'ticket_number': ['ticket', 'numero_ticket', 'demande', 'incident', 'support']
    };

    const patterns = frenchPatterns[field as keyof typeof frenchPatterns] || [];
    return patterns.some(pattern => 
      columnName.toLowerCase().includes(pattern) || 
      pattern.includes(columnName.toLowerCase())
    );
  }

  private cleanAndValidateData(rawData: any[], mappings: ColumnMapping[], assetType: 'it' | 'telecom'): any[] {
    const cleanedData: any[] = [];

    for (const row of rawData) {
      const cleanedRow: any = {};

      for (const mapping of mappings) {
        if (mapping.mappedField && mapping.confidence > 0.3) {
          let value = row[mapping.originalName];

          // Clean and convert value based on data type
          if (mapping.dataType === 'number') {
            value = this.parseNumber(value);
          } else if (mapping.dataType === 'date') {
            value = this.parseDate(value);
          } else {
            value = this.cleanText(value);
          }

          cleanedRow[mapping.mappedField] = value;
        }
      }

      // Set default values for required fields
      if (assetType === 'it') {
        if (!cleanedRow.device_type) {
          cleanedRow.device_type = 'Unknown';
        }
        if (!cleanedRow.status) {
          cleanedRow.status = 'active';
        }
        if (!cleanedRow.department) {
          cleanedRow.department = 'IT';
        }
        if (!cleanedRow.zone) {
          cleanedRow.zone = 'Office';
        }
        if (!cleanedRow.owner_name) {
          cleanedRow.owner_name = 'Unassigned';
        }
        // Activity field removed from database schema
        if (!cleanedRow.serial_number) {
          // Try to find real serial number in the row data first
          const realSerial = this.findRealSerialNumberInRow(row);
          if (realSerial) {
            cleanedRow.serial_number = realSerial;
          } else {
            // Generate smart one if no real serial found
            const deviceType = cleanedRow.device_type || 'Device';
            const ownerName = cleanedRow.owner_name || 'Unknown';
            cleanedRow.serial_number = this.generateSmartSerialNumber(deviceType, ownerName);
          }
        }
        if (!cleanedRow.model) {
          // Try to find real model in the row data first
          const realModel = this.findRealModelInRow(row);
          if (realModel) {
            cleanedRow.model = realModel;
          } else {
            // Infer from device type if no real model found
            cleanedRow.model = this.inferModelFromDeviceType(cleanedRow.device_type);
          }
        }
        if (!cleanedRow.brand) {
          // Try to find real brand in the row data first
          const realBrand = this.findRealBrandInRow(row);
          if (realBrand) {
            cleanedRow.brand = realBrand;
          } else {
            // Infer from device type if no real brand found
            cleanedRow.brand = this.inferBrandFromDeviceType(cleanedRow.device_type);
          }
        }
        if (!cleanedRow.date) {
          // Try to find real date in the row data first
          const realDate = this.findRealDateInRow(row);
          if (realDate) {
            cleanedRow.date = realDate;
          } else {
            // Use current date if no real date found
            cleanedRow.date = new Date().toISOString().split('T')[0];
          }
        }
      } else {
        if (!cleanedRow.provider) {
          cleanedRow.provider = 'Unknown';
        }
        if (!cleanedRow.status) {
          cleanedRow.status = 'active';
        }
        if (!cleanedRow.department) {
          cleanedRow.department = 'IT';
        }
        if (!cleanedRow.zone) {
          cleanedRow.zone = 'Office';
        }
        // Activity field removed from database schema
        if (!cleanedRow.sim_number) {
          cleanedRow.sim_number = 'SIM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        if (!cleanedRow.sim_owner) {
          cleanedRow.sim_owner = 'Unassigned';
        }
        if (!cleanedRow.subscription_type) {
          cleanedRow.subscription_type = 'Monthly';
        }
        if (!cleanedRow.data_plan) {
          cleanedRow.data_plan = 'Basic';
        }
        if (!cleanedRow.date) {
          cleanedRow.date = new Date().toISOString().split('T')[0];
        }
      }

      // Only add rows that have essential fields
      if (this.hasEssentialFields(cleanedRow, assetType)) {
        cleanedData.push(cleanedRow);
      }
    }

    return cleanedData;
  }

  private parseNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private parseDate(value: any): string | null {
    if (!value) return null;
    
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  private cleanText(value: any): string {
    if (!value) return '';
    return value.toString().trim();
  }

  private hasEssentialFields(row: any, assetType: 'it' | 'telecom'): boolean {
    if (assetType === 'it') {
      return !!(row.device_type || row.model || row.brand);
    } else {
      // More lenient validation for telecom - we can generate missing fields
      return !!(row.provider || row.sim_number || row.sim_owner || 
               Object.keys(row).some(key => key && row[key] && row[key].toString().trim()));
    }
  }

  private async createAssetsInDatabase(data: any[], assetType: 'it' | 'telecom'): Promise<number> {
    let createdCount = 0;

    for (const row of data) {
      try {
        if (assetType === 'it') {
          // Convert snake_case to camelCase for database
          const dbData = {
            deviceType: row.device_type,
            ownerName: row.owner_name,
            department: row.department,
            zone: row.zone,
            // Activity field removed
            serialNumber: row.serial_number,
            ticketNumber: row.ticket_number,
            model: row.model,
            brand: row.brand,
            date: row.date,
            ramGb: row.ram_gb,
            diskGb: row.disk_gb,
            processor: row.processor,
            os: row.os,
            peripheralType: row.peripheral_type,
            connectionType: row.connection_type,
            status: row.status
          };
          await database.createITAsset(dbData);
        } else {
          // Use snake_case for database consistency - Fixed telecom schema
          const dbData = {
            provider: row.provider || 'Unknown Provider',
            sim_number: row.sim_number || `AUTO-SIM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            sim_owner: row.sim_owner || 'Unknown Owner', 
            subscription_type: row.subscription_type || 'Standard',
            date: row.date || new Date().toISOString().split('T')[0],
            zone: row.zone || 'Office',
            department: row.department || 'IT',
            data_plan: row.data_plan || null,
            status: row.status || 'active',
            pin_code: row.pin_code || null,
            puk_code: row.puk_code || null
          };
          await database.createTelecomAsset(dbData);
        }
        createdCount++;
      } catch (error) {
        console.error('Error creating asset:', error);
      }
    }

    return createdCount;
  }

  private formatColumnMappings(mappings: ColumnMapping[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    for (const mapping of mappings) {
      if (mapping.mappedField && mapping.confidence > 0.3) {
        result[mapping.originalName] = `${mapping.mappedField} (${Math.round(mapping.confidence * 100)}%)`;
      }
    }
    return result;
  }

  // Method to preview import without actually creating assets
  async previewImport(fileData: string, assetType: 'it' | 'telecom'): Promise<{
    success: boolean;
    message: string;
    columnMappings: ColumnMapping[];
    sampleData: any[];
    totalRows: number;
  }> {
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = Buffer.from(fileData, 'base64');
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      const rawData = this.extractDataFromWorksheet(worksheet);
      const columnMappings = await this.mapColumnsWithAI(rawData[0], assetType);
      const cleanedData = this.cleanAndValidateData(rawData, columnMappings, assetType);

      return {
        success: true,
        message: `Preview ready: ${cleanedData.length} rows will be imported`,
        columnMappings,
        sampleData: cleanedData.slice(0, 5),
        totalRows: cleanedData.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        columnMappings: [],
        sampleData: [],
        totalRows: 0
      };
    }
  }
}

