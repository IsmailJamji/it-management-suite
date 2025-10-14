import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ModernButton from './ModernButton';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  assetType: 'it' | 'telecom';
}

interface ColumnMapping {
  originalName: string;
  mappedField: string;
  confidence: number;
  dataType: string;
  sampleValues: any[];
}

interface ImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  createdAssets: number;
  errors: string[];
  columnMappings: ColumnMapping[];
  sampleData: any[];
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  assetType
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData(null);
      setShowPreview(false);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // Convert file to base64 and send to backend
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const result = await window.electronAPI.excelImport.preview(base64, assetType === 'it' ? 'it_assets' : 'telecom_assets');
          setPreviewData(result);
          setShowPreview(true);
        } catch (error) {
          console.error('Preview error:', error);
          alert('Error previewing file: ' + (error as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Error previewing file: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !previewData) return;

    setIsLoading(true);
    try {
      // Convert file to base64 and send to backend
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const result = await window.electronAPI.excelImport.execute(base64, assetType === 'it' ? 'it_assets' : 'telecom_assets');
          setImportResult(result);
          
          if (result.success) {
            onImportComplete();
            setTimeout(() => {
              onClose();
              setSelectedFile(null);
              setPreviewData(null);
              setShowPreview(false);
              setImportResult(null);
            }, 2000);
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Error importing file: ' + (error as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing file: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
    setPreviewData(null);
    setShowPreview(false);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-foreground">
              Excel Import - {assetType === 'it' ? 'IT Assets' : 'Telecom Assets'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showPreview && !importResult && (
            <div className="space-y-6">
              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Select Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to select Excel file</p>
                      <p className="text-xs text-muted-foreground">Supports .xlsx, .xls, .csv files</p>
                    </div>
                  )}
                  <ModernButton
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    className="mt-4"
                  >
                    {selectedFile ? 'Change File' : 'Select File'}
                  </ModernButton>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">{t('import.instructions')}</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('import.instruction1')}</li>
                  <li>• {t('import.instruction2')}</li>
                  <li>• {t('import.instruction3')}</li>
                  <li>• {t('import.instruction4')}</li>
                </ul>
              </div>

              {/* Preview Button */}
              {selectedFile && (
                <div className="flex justify-center">
                  <ModernButton
                    onClick={handlePreview}
                    disabled={isLoading}
                    variant="primary"
                    icon={<Eye className="w-4 h-4" />}
                  >
                    {isLoading ? t('import.previewing') : t('import.previewImport')}
                  </ModernButton>
                </div>
              )}
            </div>
          )}

          {/* Preview Data */}
          {showPreview && previewData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Import Preview</h3>
                <ModernButton
                  onClick={() => setShowPreview(false)}
                  variant="secondary"
                  icon={<EyeOff className="w-4 h-4" />}
                >
                  Hide Preview
                </ModernButton>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{previewData.totalRows}</div>
                  <div className="text-sm text-blue-800">Total Rows</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{previewData.columnMappings.length}</div>
                  <div className="text-sm text-green-800">Mapped Columns</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{previewData.sampleData.length}</div>
                  <div className="text-sm text-purple-800">Sample Records</div>
                </div>
              </div>

              {/* Column Mappings */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Column Mappings</h4>
                <div className="space-y-2">
                  {previewData.columnMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{mapping.originalName}</div>
                        <div className="text-sm text-muted-foreground">→ {mapping.mappedField}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {Math.round(mapping.confidence * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{mapping.dataType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Sample Data</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted">
                      <tr>
                        {previewData.columnMappings.map((mapping, index) => (
                          <th key={index} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {mapping.mappedField}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {previewData.sampleData.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {previewData.columnMappings.map((mapping, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 text-sm text-foreground">
                              {row[mapping.mappedField] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-center space-x-4">
                <ModernButton
                  onClick={() => setShowPreview(false)}
                  variant="secondary"
                >
                  Cancel
                </ModernButton>
                <ModernButton
                  onClick={handleImport}
                  disabled={isLoading}
                  variant="success"
                  icon={<Upload className="w-4 h-4" />}
                >
                  {isLoading ? 'Importing...' : 'Import Data'}
                </ModernButton>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-6">
              <div className="text-center">
                {importResult.success ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {importResult.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
                <p className="text-muted-foreground">{importResult.message}</p>
              </div>

              {importResult.success && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{importResult.createdAssets}</div>
                    <div className="text-sm text-green-800">Assets Created</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                    <div className="text-sm text-blue-800">Total Rows</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                    <div className="text-sm text-red-800">Errors</div>
                  </div>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Errors</h4>
                  <div className="space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-800">{error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <ModernButton
                  onClick={handleClose}
                  variant="primary"
                >
                  Close
                </ModernButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
