import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Wifi,
  Signal,
  Battery,
  X,
  Brain,
  FileSpreadsheet
} from 'lucide-react';
import ExcelImportModal from '../components/ExcelImportModal';
import TelecomIcon from '../components/TelecomIcon';
import ModernButton from '../components/ModernButton';
import ModernIcon from '../components/ModernIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface TelecomAsset {
  id: number;
  provider: string;
  sim_number: string;
  sim_owner: string;
  subscription_type?: string;
  date: string;
  zone: string;
  department: string;
  data_plan?: string;
  pin_code?: string;
  puk_code?: string;
  status: string;
  // New fields
  company?: string;
  poste_activite?: string;
  remarque?: string;
  phone_name?: string;
  ram_gb?: number;
  imei?: string;
  storage_gb?: number;
}

const TelecomAssetsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { hasPermission } = useAuth();
  const [assets, setAssets] = useState<TelecomAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<TelecomAsset | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [yearFilter, setYearFilter] = useState('all');

  const providers = [
    { value: 'IAM', label: 'IAM', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', brandColor: '#1E40AF' },
    { value: 'INWI', label: 'INWI', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', brandColor: '#8B5CF6' },
    { value: 'ORANGE', label: 'ORANGE', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', brandColor: '#FF6B35' }
  ];

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Management'];
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Remote', 'Field'];

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const data = await window.electronAPI.telecomAssets.getAll();
        setAssets(data);
      } else {
        // Fallback mock data for development
        const mockAssets: TelecomAsset[] = [
          {
            id: 1,
            provider: 'IAM',
            sim_number: '212612345678',
            sim_owner: 'John Doe',
            subscription_type: 'Corporate',
            date: '2024-01-15',
            zone: 'Zone A',
            department: 'IT',
            data_plan: '10GB',
            status: 'active'
          },
          {
            id: 2,
            provider: 'INWI',
            sim_number: '212612345679',
            sim_owner: 'Jane Smith',
            subscription_type: 'Postpaid',
            date: '2024-02-01',
            zone: 'Zone B',
            department: 'HR',
            data_plan: '5GB',
            status: 'active'
          },
          {
            id: 3,
            provider: 'ORANGE',
            sim_number: '212612345680',
            sim_owner: 'Mike Johnson',
            subscription_type: 'Prepaid',
            date: '2024-02-15',
            zone: 'Field',
            department: 'Sales',
            data_plan: '2GB',
            status: 'inactive'
          }
        ];
        setAssets(mockAssets);
      }
    } catch (error) {
      console.error('Failed to load telecom assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'iam':
        return <TelecomIcon provider="iam" size={24} className="text-blue-600" />;
      case 'inwi':
        return <TelecomIcon provider="inwi" size={24} className="text-purple-600" />;
      case 'orange':
        return <TelecomIcon provider="orange" size={24} className="text-orange-600" />;
      default:
        return <ModernIcon name="phone" size={24} className="text-primary" />;
    }
  };

  const getProviderStyling = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'iam':
        return {
          cardClass: 'bg-blue-50 border-blue-200 hover:border-blue-300',
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-800',
          accentColor: 'text-blue-600'
        };
      case 'inwi':
        return {
          cardClass: 'bg-purple-50 border-purple-200 hover:border-purple-300',
          iconBg: 'bg-purple-100',
          titleColor: 'text-purple-800',
          accentColor: 'text-purple-600'
        };
      case 'orange':
        return {
          cardClass: 'bg-orange-50 border-orange-200 hover:border-orange-300',
          iconBg: 'bg-orange-100',
          titleColor: 'text-orange-800',
          accentColor: 'text-orange-600'
        };
      default:
        return {
          cardClass: 'bg-card border hover:border-primary',
          iconBg: 'bg-primary/10',
          titleColor: 'text-foreground',
          accentColor: 'text-primary'
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = (asset.sim_owner || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.sim_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.provider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.subscription_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = providerFilter === 'all' || asset.provider === providerFilter;
    const matchesYear = yearFilter === 'all' || (() => {
      // Prioritize asset dates over creation timestamp
      const dateValue = (asset as any).date || (asset as any).created_at;
      if (!dateValue) return false;
      
      try {
        const year = new Date(dateValue).getFullYear();
        const matches = year.toString() === yearFilter;
        console.log('Telecom year filter check (asset date priority):', { 
          assetDate: (asset as any).date, 
          created_at: (asset as any).created_at,
          dateValue, 
          year, 
          yearFilter, 
          matches 
        });
        return matches;
      } catch (e) {
        console.log('Telecom date parsing error in filter:', e, dateValue);
        return false;
      }
    })();
    return matchesSearch && matchesProvider && matchesYear;
  });

  const handleViewAsset = (asset: TelecomAsset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };

  const handleEditAsset = (asset: TelecomAsset) => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (window.confirm('Are you sure you want to delete this telecom asset?')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.telecomAssets.delete(assetId);
        }
        await loadAssets();
      } catch (error) {
        console.error('Failed to delete telecom asset:', error);
      }
    }
  };


  const handleExport = async (format: string = 'xlsx', theme: string = 'modern') => {
    try {
      if (window.electronAPI) {
        console.log('Starting export with format:', format, 'theme:', theme);
        const result = await window.electronAPI.telecomAssets.export(format, theme, language);
        console.log('Export result:', result);
        
        if (result && result.success) {
          alert(`✅ Export successful!\nFile saved to: ${result.filePath}`);
        } else if (result && result.message) {
          alert(`❌ Export failed: ${result.message}`);
        } else {
          alert(`❌ Export failed: Unknown error occurred`);
        }
      } else {
        alert('❌ Export failed: Application not ready');
      }
    } catch (error) {
      console.error('Failed to export assets:', error);
      alert(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };


  const handleSaveAsset = async (assetData: any) => {
    try {
      if (window.electronAPI) {
        if (selectedAsset) {
          await window.electronAPI.telecomAssets.update(selectedAsset.id, assetData);
        } else {
          await window.electronAPI.telecomAssets.create(assetData);
        }
      }
      await loadAssets();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedAsset(null);
    } catch (error) {
      console.error('Failed to save telecom asset:', error);
    }
  };

  // Multi-select functions
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedAssets([]);
    }
  };

  const toggleAssetSelection = (assetId: number) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const selectAllAssets = () => {
    setSelectedAssets(filteredAssets.map(asset => asset.id));
  };

  const clearSelection = () => {
    setSelectedAssets([]);
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    
    const confirmMessage = t('telecomAssets.deleteConfirm').replace('{count}', selectedAssets.length.toString());
    if (window.confirm(confirmMessage)) {
      try {
        // Delete assets one by one
        for (const assetId of selectedAssets) {
          await window.electronAPI.telecomAssets.delete(assetId);
        }
        await loadAssets();
        setSelectedAssets([]);
        setIsSelectMode(false);
      } catch (error) {
        console.error('Error deleting assets:', error);
        alert(t('telecomAssets.deleteError'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('telecomAssets.title')}</h1>
          <p className="text-muted-foreground">{t('telecomAssets.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          {!isSelectMode ? (
            <>
              <ModernButton
                onClick={() => setShowExcelImportModal(true)}
                variant="info"
                icon={<FileSpreadsheet className="h-4 w-4" />}
              >
                Excel Import
              </ModernButton>
              <ModernButton
                onClick={() => setShowExportModal(true)}
                variant="success"
                icon={<Download className="h-4 w-4" />}
              >
                {t('common.export')}
              </ModernButton>
              {hasPermission('create_telecom_assets') && (
                <ModernButton
                  onClick={() => setShowAddModal(true)}
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  {t('telecomAssets.addAsset')}
                </ModernButton>
              )}
              <ModernButton
                onClick={toggleSelectMode}
                variant="secondary"
                icon={<Filter className="h-4 w-4" />}
              >
                {t('telecomAssets.selectMode')}
              </ModernButton>
            </>
          ) : (
            <>
              <ModernButton
                onClick={selectAllAssets}
                variant="primary"
                icon={<Filter className="h-4 w-4" />}
              >
                {t('telecomAssets.selectAll')}
              </ModernButton>
              <ModernButton
                onClick={clearSelection}
                variant="secondary"
                icon={<X className="h-4 w-4" />}
              >
                {t('telecomAssets.clearSelection')}
              </ModernButton>
              {selectedAssets.length > 0 && (
                <ModernButton
                  onClick={handleBulkDelete}
                  variant="danger"
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  {t('telecomAssets.bulkDelete').replace('{count}', selectedAssets.length.toString())}
                </ModernButton>
              )}
              <ModernButton
                onClick={toggleSelectMode}
                variant="secondary"
                icon={<X className="h-4 w-4" />}
              >
                {t('telecomAssets.exitSelectMode')}
              </ModernButton>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('telecomAssets.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">{t('telecomAssets.allProviders')}</option>
          {providers.map(provider => (
            <option key={provider.value} value={provider.value}>{provider.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t('common.allYears')}</option>
            {Array.from(new Set(assets.map(a => {
              const dateValue = (a as any).date || (a as any).created_at;
              if (dateValue) {
                try {
                  const year = new Date(dateValue).getFullYear();
                  return isNaN(year) ? null : year;
                } catch (e) {
                  return null;
                }
              }
              return null;
            }).filter(Boolean) as number[]))
              .sort((a, b) => b - a)
              .map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
          </select>
          <input
            type="number"
            placeholder="Année..."
            value={yearFilter === 'all' ? '' : yearFilter}
            onChange={(e) => setYearFilter(e.target.value || 'all')}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-20"
            min="1900"
            max="2100"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const styling = getProviderStyling(asset.provider);
          return (
            <div key={asset.id} className={`${styling.cardClass} rounded-lg border p-6 hover:shadow-md transition-shadow ${isSelectMode ? 'cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {isSelectMode && (
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                  <div className={`p-2 rounded-lg ${styling.iconBg}`}>
                    {getProviderIcon(asset.provider)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${styling.titleColor}`}>{asset.provider}</h3>
                    <p className={`text-sm ${styling.accentColor}`}>{asset.subscription_type}</p>
                  </div>
                </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  <span className="capitalize">{t(`status.${asset.status?.toLowerCase() || 'active'}`)}</span>
                </span>
                {!isSelectMode && (
                  <div className="relative group">
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewAsset(asset)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view')}
                      </button>
                      {hasPermission('edit_telecom_assets') && (
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </button>
                      )}
                      {hasPermission('delete_telecom_assets') && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('telecomAssets.simOwner')}:</span>
                <span className="font-medium">{asset.sim_owner}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('telecomAssets.simNumber')}:</span>
                <span className="font-medium font-mono text-xs">{asset.sim_number}</span>
              </div>
              
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('fields.department')}:</span>
                <span className="font-medium">{asset.department}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('telecomAssets.zone')}:</span>
                <span className="font-medium">{asset.zone}</span>
              </div>
              
              
              {asset.data_plan && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('telecomAssets.dataPlan')}:</span>
                  <span className="font-medium">{asset.data_plan}</span>
                </div>
              )}
              
              {asset.pin_code && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('telecomAssets.pinCode')}:</span>
                  <span className="font-medium font-mono text-xs">{asset.pin_code}</span>
                </div>
              )}
              
              {asset.puk_code && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('telecomAssets.pukCode')}:</span>
                  <span className="font-medium font-mono text-xs">{asset.puk_code}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('fields.date')}:</span>
                <span className="font-medium">{new Date(asset.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleViewAsset(asset)}
                className="flex-1 btn btn-outline btn-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              {hasPermission('edit_telecom_assets') && (
                <button 
                  onClick={() => handleEditAsset(asset)}
                  className="flex-1 btn btn-outline btn-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('telecomAssets.noAssetsFound')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || providerFilter !== 'all' 
              ? t('telecomAssets.tryAdjustingFilters')
              : t('telecomAssets.addFirstAsset')
            }
          </p>
          {!searchTerm && providerFilter === 'all' && hasPermission('create_telecom_assets') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('telecomAssets.addFirstAsset')}
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {selectedAsset ? t('telecomAssets.editAsset') : t('telecomAssets.addNewAsset')}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const assetData = {
                provider: formData.get('provider'),
                sim_number: formData.get('sim_number'),
                sim_owner: formData.get('sim_owner'),
                subscription_type: formData.get('subscription_type'),
                date: formData.get('date'),
                zone: formData.get('zone'),
                department: formData.get('department'),
                data_plan: formData.get('data_plan'),
                pin_code: formData.get('pin_code'),
                puk_code: formData.get('puk_code'),
                status: formData.get('status') || 'active',
                // New fields
                company: formData.get('company'),
                poste_activite: formData.get('poste_activite'),
                remarque: formData.get('remarque'),
                phone_name: formData.get('phone_name'),
                ram_gb: formData.get('ram_gb') ? parseInt(String(formData.get('ram_gb'))) : undefined,
                imei: formData.get('imei'),
                storage_gb: formData.get('storage_gb') ? parseInt(String(formData.get('storage_gb'))) : undefined
              };
              handleSaveAsset(assetData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.provider')} *</label>
                  <select name="provider" required defaultValue={selectedAsset?.provider || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">{t('common.select')} {t('telecomAssets.provider').toLowerCase()}</option>
                    {providers.map(provider => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.simNumber')} *</label>
                  <input name="sim_number" required defaultValue={selectedAsset?.sim_number || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.simOwner')} *</label>
                  <input name="sim_owner" required defaultValue={selectedAsset?.sim_owner || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.subscriptionType')}</label>
                  <input 
                    name="subscription_type" 
                    defaultValue={selectedAsset?.subscription_type || ''} 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="e.g., Postpaid, Prepaid, Corporate..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.dataPlan')}</label>
                  <input name="data_plan" defaultValue={selectedAsset?.data_plan || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.pinCode')}</label>
                  <input name="pin_code" defaultValue={selectedAsset?.pin_code || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t('telecomAssets.pinCode')} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.pukCode')}</label>
                  <input name="puk_code" defaultValue={selectedAsset?.puk_code || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t('telecomAssets.pukCode')} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.department')} *</label>
                  <input name="department" required defaultValue={selectedAsset?.department || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t('fields.department')} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.zone')} *</label>
                  <input name="zone" required defaultValue={selectedAsset?.zone || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t('telecomAssets.zone')} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.company')}</label>
                  <input name="company" defaultValue={(selectedAsset as any)?.company || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., ACME Corp" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.position')}</label>
                  <input name="poste_activite" defaultValue={(selectedAsset as any)?.poste_activite || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., Field Sales" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.notes')}</label>
                  <textarea name="remarque" rows={4} defaultValue={(selectedAsset as any)?.remarque || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Notes..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('telecomAssets.phoneName')}</label>
                  <input name="phone_name" defaultValue={(selectedAsset as any)?.phone_name || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., iPhone 13" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.ram')}</label>
                  <input type="number" min={0} name="ram_gb" defaultValue={(selectedAsset as any)?.ram_gb || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., 8" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.imei')}</label>
                  <input name="imei" maxLength={15} defaultValue={(selectedAsset as any)?.imei || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., 123456789012345" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.storage')}</label>
                  <input type="number" min={0} name="storage_gb" defaultValue={(selectedAsset as any)?.storage_gb || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., 128" />
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.date')} *</label>
                  <input name="date" type="date" required defaultValue={selectedAsset?.date || ''} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">{t('fields.status')}</label>
                  <select name="status" defaultValue={selectedAsset?.status || 'active'} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="active">{t('status.active')}</option>
                    <option value="inactive">{t('status.inactive')}</option>
                    <option value="suspended">{t('status.suspended')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedAsset(null);
                  }}
                  className="btn btn-outline"
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedAsset ? t('telecomAssets.updateAsset') : t('telecomAssets.addAsset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">{t('telecomAssets.assetDetails')}</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAsset(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header with Provider and Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getProviderIcon(selectedAsset.provider)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedAsset.provider}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAsset.subscription_type}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAsset.status)}`}>
                  <span className="capitalize">{t(`status.${selectedAsset.status?.toLowerCase() || 'active'}`)}</span>
                </span>
              </div>

              {/* Asset Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground border-b pb-2">{t('telecomAssets.simInformation')}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('telecomAssets.simNumber')}:</span>
                      <span className="font-medium font-mono">{selectedAsset.sim_number}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('telecomAssets.simOwner')}:</span>
                      <span className="font-medium">{selectedAsset.sim_owner}</span>
                    </div>
                    
                    
                    {selectedAsset.data_plan && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('telecomAssets.dataPlan')}:</span>
                        <span className="font-medium">{selectedAsset.data_plan}</span>
                      </div>
                    )}
                    
                    {selectedAsset.pin_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('telecomAssets.pinCode')}:</span>
                        <span className="font-medium font-mono">{selectedAsset.pin_code}</span>
                      </div>
                    )}
                    
                  {selectedAsset.puk_code && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('telecomAssets.pukCode')}:</span>
                      <span className="font-medium font-mono">{selectedAsset.puk_code}</span>
                    </div>
                  )}
                  {(selectedAsset as any).imei && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMEI:</span>
                      <span className="font-medium font-mono">{(selectedAsset as any).imei}</span>
                    </div>
                  )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground border-b pb-2">{t('telecomAssets.organizationDetails')}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('fields.department')}:</span>
                      <span className="font-medium">{selectedAsset.department}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('telecomAssets.zone')}:</span>
                      <span className="font-medium">{selectedAsset.zone}</span>
                    </div>
                    
                    
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('fields.date')}:</span>
                    <span className="font-medium">{new Date(selectedAsset.date).toLocaleDateString()}</span>
                  </div>
                  {(selectedAsset as any).company && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{(selectedAsset as any).company}</span>
                    </div>
                  )}
                  {(selectedAsset as any).phone_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone Name:</span>
                      <span className="font-medium">{(selectedAsset as any).phone_name}</span>
                    </div>
                  )}
                  {((selectedAsset as any).ram_gb || (selectedAsset as any).storage_gb) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specs:</span>
                      <span className="font-medium">{(selectedAsset as any).ram_gb ? `${(selectedAsset as any).ram_gb} GB RAM` : ''}{(selectedAsset as any).ram_gb && (selectedAsset as any).storage_gb ? ' | ' : ''}{(selectedAsset as any).storage_gb ? `${(selectedAsset as any).storage_gb} GB Storage` : ''}</span>
                    </div>
                  )}
                  {(selectedAsset as any).poste_activite && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poste/Activité:</span>
                      <span className="font-medium">{(selectedAsset as any).poste_activite}</span>
                    </div>
                  )}
                  {(selectedAsset as any).remarque && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Remarque:</span>
                      <span className="font-medium whitespace-pre-wrap max-w-[60%] text-right">{(selectedAsset as any).remarque}</span>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAsset(null);
                }}
                className="btn btn-outline"
              >
                {t('telecomAssets.close')}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAsset(selectedAsset);
                }}
                className="btn btn-primary"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('telecomAssets.editAsset')}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Export Telecom Assets</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select id="exportFormat" className="w-full px-3 py-2 border border-input rounded-md">
                  <option value="xlsx">Excel (.xlsx) - Modern Format</option>
                  <option value="csv">CSV (.csv) - Simple Format</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Theme Style</label>
                <select id="exportTheme" className="w-full px-3 py-2 border border-input rounded-md">
                  <option value="modern">Modern - Colorful & Professional</option>
                  <option value="corporate">Corporate - Clean & Business</option>
                  <option value="colorful">Colorful - Vibrant & Creative</option>
                  <option value="minimal">Minimal - Simple & Clean</option>
                </select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>✨ AI-powered Excel export with modern formatting, colors, and professional design!</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Beautiful headers with colors</li>
                  <li>Alternating row colors</li>
                  <li>Professional borders and spacing</li>
                  <li>Summary statistics sheet</li>
                  <li>Auto-sized columns</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const format = (document.getElementById('exportFormat') as HTMLSelectElement)?.value || 'xlsx';
                  const theme = (document.getElementById('exportTheme') as HTMLSelectElement)?.value || 'modern';
                  handleExport(format, theme);
                  setShowExportModal(false);
                }}
                className="btn btn-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelImportModal}
        onClose={() => setShowExcelImportModal(false)}
        assetType="telecom"
        onImportComplete={() => {
          loadAssets();
          setShowExcelImportModal(false);
        }}
      />
    </div>
  );
};

export default TelecomAssetsPage;