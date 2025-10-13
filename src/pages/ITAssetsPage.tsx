import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Server, 
  Printer, 
  Router, 
  HardDrive,
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  X,
  Brain,
  Mouse,
  Keyboard,
  Headphones,
  Calendar,
  User,
  Network,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import ExcelImportModal from '../components/ExcelImportModal';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ITAsset {
  id: number;
  device_name: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  mac_address?: string;
  ip_address?: string;
  location: string;
  department: string;
  assigned_to?: string;
  purchase_date: string;
  warranty_expiry?: string;
  status: string;
  notes?: string;
  // Additional fields
  hostname?: string;
  ticket_number?: string;
  date?: string;
  processor?: string;
  ram_gb?: number;
  disk_gb?: number;
  os?: string;
  warranty_expiration?: string;
  imei?: string;
  has_mouse?: boolean;
  has_keyboard?: boolean;
  has_screen?: boolean;
  has_headphone?: boolean;
  // Database specific fields
  owner_name?: string;
  zone?: string;
  remarque?: string;
  poste_activite?: string;
  company?: string;
}

const ITAssetsPage: React.FC = () => {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ITAsset | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  const deviceTypes = [
    'Laptop',
    'Desktop',
    'Printer',
    'Router',
    'Server',
    'Switch'
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const assets = await window.electronAPI.itAssets.getAll();
      setAssets(assets || []);
    } catch (error) {
      console.error('Error loading IT assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (assetData: Omit<ITAsset, 'id'>) => {
    try {
      await window.electronAPI.itAssets.create(assetData);
      await loadAssets();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding IT asset:', error);
    }
  };

  const handleEditAsset = (asset: ITAsset) => {
    setSelectedAsset(asset);
    setSelectedDeviceType(asset.device_type);
    setShowEditModal(true);
  };

  const handleUpdateAsset = async (id: number, assetData: Partial<ITAsset>) => {
    try {
      await window.electronAPI.itAssets.update(id, assetData);
      await loadAssets();
      setShowEditModal(false);
      setSelectedAsset(null);
    } catch (error) {
      console.error('Error updating IT asset:', error);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this IT asset?')) {
      try {
        await window.electronAPI.itAssets.delete(id);
        await loadAssets();
      } catch (error) {
        console.error('Error deleting IT asset:', error);
      }
    }
  };

  const handleViewAsset = (asset: ITAsset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };


  const handleExport = async (format: 'csv' | 'json' | 'xlsx', theme: string = 'modern') => {
    try {
      const result = await window.electronAPI.itAssets.export(format, theme);
      if (result.success) {
        setShowExportModal(false);
      }
    } catch (error) {
      console.error('Error exporting IT assets:', error);
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
    
    const confirmMessage = t('itAssets.deleteConfirm').replace('{count}', selectedAssets.length.toString());
    if (window.confirm(confirmMessage)) {
      try {
        // Delete assets one by one
        for (const assetId of selectedAssets) {
          await window.electronAPI.itAssets.delete(assetId);
        }
        await loadAssets();
        setSelectedAssets([]);
        setIsSelectMode(false);
      } catch (error) {
        console.error('Error deleting assets:', error);
        alert(t('itAssets.deleteError'));
      }
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase() || '') {
      case 'desktop computer':
        return <Monitor className="w-5 h-5" />;
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'printer':
        return <Printer className="w-5 h-5" />;
      case 'router':
      case 'network switch':
        return <Router className="w-5 h-5" />;
      default:
        return <HardDrive className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase() || '') {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Calculate device age in years
  const getDeviceAge = (dateString: string): number => {
    if (!dateString) return 0;
    const deviceDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - deviceDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = (asset.device_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (asset.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (asset.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (asset.serial_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesDeviceType = deviceTypeFilter === 'all' || asset.device_type === deviceTypeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesYear = yearFilter === 'all' || (() => {
      // Prioritize asset dates over creation timestamp
      const dateValue = (asset as any).date || (asset as any).purchase_date || (asset as any).created_at;
      if (!dateValue) return false;
      
      try {
        const year = new Date(dateValue).getFullYear();
        const matches = year.toString() === yearFilter;
        console.log('Year filter check (asset date priority):', { 
          assetDate: (asset as any).date, 
          purchaseDate: (asset as any).purchase_date, 
          created_at: (asset as any).created_at,
          dateValue, 
          year, 
          yearFilter, 
          matches 
        });
        return matches;
      } catch (e) {
        console.log('Date parsing error in filter:', e, dateValue);
        return false;
      }
    })();
    
    // Age filter logic
    let matchesAge = true;
    if (ageFilter !== 'all') {
      const age = getDeviceAge(asset.date || asset.purchase_date);
      switch (ageFilter) {
        case '0-3':
          matchesAge = age <= 3;
          break;
        case '3-5':
          matchesAge = age > 3 && age <= 5;
          break;
        case '5+':
          matchesAge = age > 5;
          break;
        default:
          matchesAge = true;
      }
    }
    
    return matchesSearch && matchesDeviceType && matchesStatus && matchesAge && matchesYear;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('itAssets.title')}</h1>
          <p className="text-muted-foreground">{t('itAssets.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          {!isSelectMode ? (
            <>
              {hasPermission('create_it_assets') && (
              <ModernButton
                onClick={() => setShowExcelImportModal(true)}
                variant="info"
                icon={<FileSpreadsheet className="w-4 h-4" />}
              >
                Excel Import
              </ModernButton>
              )}
              {hasPermission('create_it_assets') && (
              <ModernButton
                onClick={() => setShowExportModal(true)}
                variant="success"
                icon={<Download className="w-4 h-4" />}
              >
                {t('common.export')}
              </ModernButton>
              )}
              {hasPermission('create_it_assets') && (
              <ModernButton
                onClick={() => {
                  setSelectedDeviceType('');
                  setShowAddModal(true);
                }}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                {t('itAssets.addAsset')}
              </ModernButton>
              )}
              <ModernButton
                onClick={toggleSelectMode}
                variant="secondary"
                icon={<Filter className="w-4 h-4" />}
              >
                {t('itAssets.selectMode')}
              </ModernButton>
            </>
          ) : (
            <>
              <ModernButton
                onClick={selectAllAssets}
                variant="primary"
                icon={<Filter className="w-4 h-4" />}
              >
                {t('itAssets.selectAll')}
              </ModernButton>
              <ModernButton
                onClick={clearSelection}
                variant="secondary"
                icon={<X className="w-4 h-4" />}
              >
                {t('itAssets.clearSelection')}
              </ModernButton>
              {selectedAssets.length > 0 && (
                <ModernButton
                  onClick={handleBulkDelete}
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  {t('itAssets.bulkDelete').replace('{count}', selectedAssets.length.toString())}
                </ModernButton>
              )}
              <ModernButton
                onClick={toggleSelectMode}
                variant="secondary"
                icon={<X className="w-4 h-4" />}
              >
                {t('itAssets.exitSelectMode')}
              </ModernButton>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder={t('itAssets.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={deviceTypeFilter}
            onChange={(e) => setDeviceTypeFilter(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('itAssets.allDeviceTypes')}</option>
            {deviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('itAssets.allStatus')}</option>
            <option value="active">{t('status.active')}</option>
            <option value="inactive">{t('status.inactive')}</option>
            <option value="maintenance">{t('status.maintenance')}</option>
            <option value="retired">{t('status.retired')}</option>
          </select>
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Ages</option>
            <option value="0-3">0-3 Years</option>
            <option value="3-5">3-5 Years</option>
            <option value="5+">5+ Years</option>
          </select>
          <div className="flex items-center gap-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">{t('common.allYears')}</option>
              {Array.from(new Set(assets.map(a => {
                const dateValue = (a as any).date || (a as any).purchase_date || (a as any).created_at;
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
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className={`bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow ${isSelectMode ? 'cursor-pointer' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {isSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => toggleAssetSelection(asset.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
                {getDeviceIcon(asset.device_type)}
                <div className="ml-2">
                  <h3 className="font-semibold text-foreground">{asset.device_name}</h3>
                  <p className="text-sm text-muted-foreground">{asset.brand} {asset.model}</p>
                </div>
              </div>
              {!isSelectMode && (
                <div className="relative">
                  <button
                    onClick={() => {
                      const menu = document.getElementById(`menu-${asset.id}`);
                      if (menu) {
                        menu.classList.toggle('hidden');
                      }
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div
                    id={`menu-${asset.id}`}
                    className="hidden absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border"
                  >
                    <button
                      onClick={() => handleViewAsset(asset)}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('common.view')}
                    </button>
                    {hasPermission('edit_it_assets') && (
                    <button
                      onClick={() => handleEditAsset(asset)}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('common.edit')}
                    </button>
                    )}
                    {hasPermission('delete_it_assets') && (
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-accent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('common.delete')}
                    </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('fields.serialNumber')}:</span>
                <span className="text-foreground font-mono text-xs">{asset.serial_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('fields.department')}:</span>
                <span className="text-foreground">{asset.department}</span>
              </div>
              {asset.mac_address && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('fields.macAddress')}:</span>
                  <span className="text-foreground font-mono text-xs">{asset.mac_address}</span>
                </div>
              )}
              {asset.ip_address && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('fields.ipAddress')}:</span>
                  <span className="text-foreground font-mono text-xs">{asset.ip_address}</span>
                </div>
              )}
              {asset.assigned_to && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="text-foreground">{asset.assigned_to}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('fields.purchaseDate')}:</span>
                <span className="text-foreground">{new Date(asset.purchase_date).toLocaleDateString()}</span>
              </div>
              {asset.warranty_expiry && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('fields.warrantyExpiry')}:</span>
                  <span className="text-foreground">{new Date(asset.warranty_expiry).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('fields.status')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {t(`status.${asset.status?.toLowerCase() || 'active'}`)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('itAssets.noAssetsFound')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || deviceTypeFilter !== 'all' || statusFilter !== 'all'
              ? t('itAssets.tryAdjustingFilters')
              : t('itAssets.addFirstAsset')
            }
          </p>
          {(!searchTerm && deviceTypeFilter === 'all' && statusFilter === 'all') && (
            <button
              onClick={() => {
                setSelectedDeviceType('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('itAssets.addFirstAsset')}
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {showAddModal ? t('itAssets.addNewAsset') : t('itAssets.editAsset')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedAsset(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const assetData = {
                // Interface required fields
                device_name: formData.get('hostname') as string || 'Unknown Device',
                device_type: formData.get('device_type') as string,
                brand: formData.get('brand') as string,
                model: formData.get('model') as string,
                serial_number: formData.get('serial_number') as string,
                location: formData.get('zone') as string || 'Office',
                department: formData.get('department') as string || 'IT',
                assigned_to: formData.get('owner_name') as string,
                purchase_date: formData.get('purchase_date') as string || formData.get('date') as string,
                warranty_expiry: formData.get('warranty_expiry') as string,
                status: formData.get('status') as string || 'active',
                notes: formData.get('remarque') as string,
                // Additional interface fields
                hostname: formData.get('hostname') as string,
                ticket_number: formData.get('ticket_number') as string,
                date: formData.get('date') as string,
                processor: formData.get('processor') as string,
                ram_gb: formData.get('ram_gb') ? parseInt(formData.get('ram_gb') as string) : undefined,
                disk_gb: formData.get('disk_gb') ? parseInt(formData.get('disk_gb') as string) : undefined,
                os: formData.get('os') as string,
                peripheral_type: formData.get('peripheral_type') as string,
                connection_type: formData.get('connection_type') as string,
                warranty_expiration: formData.get('warranty_expiry') as string,
                imei: formData.get('imei') as string,
                has_mouse: formData.get('has_mouse') === 'on' || formData.get('has_mouse') === 'true',
                has_keyboard: formData.get('has_keyboard') === 'on' || formData.get('has_keyboard') === 'true',
                has_screen: formData.get('has_screen') === 'on' || formData.get('has_screen') === 'true',
                has_headphone: formData.get('has_headphone') === 'on' || formData.get('has_headphone') === 'true',
                // Database specific fields
                owner_name: formData.get('owner_name') as string || 'Unknown',
                zone: formData.get('zone') as string || 'Office',
                remarque: formData.get('remarque') as string,
                poste_activite: formData.get('poste_activite') as string,
                company: formData.get('company') as string,
                ip_address: formData.get('ip_address') as string,
                mac_address: formData.get('mac_address') as string,
              };
              
              if (showAddModal) {
                handleAddAsset(assetData);
              } else if (selectedAsset) {
                handleUpdateAsset(selectedAsset.id, assetData);
              }
            }}>
              {/* Main Fields Section */}
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Device Type *</label>
                  <select
                    name="device_type"
                      value={selectedDeviceType || selectedAsset?.device_type || ''}
                      onChange={(e) => setSelectedDeviceType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                      <option value="">Select Device Type</option>
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Device Hostname *</label>
                  <input
                    type="text"
                      name="hostname"
                      defaultValue={selectedAsset?.device_name || ''}
                    required
                      placeholder="e.g., LAPTOP-001"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Owner *</label>
                  <input
                    type="text"
                    name="owner_name"
                    defaultValue={(selectedAsset as any)?.owner_name || ''}
                    required
                    placeholder="e.g., Employee name"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Serial Number *</label>
                  <input
                    type="text"
                    name="serial_number"
                    defaultValue={selectedAsset?.serial_number || ''}
                    required
                      placeholder="e.g., ABC123456789"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Brand *</label>
                  <input
                    type="text"
                      name="brand"
                      defaultValue={selectedAsset?.brand || ''}
                      required
                      placeholder="e.g., Dell, HP, Apple"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Model *</label>
                  <input
                    type="text"
                      name="model"
                      defaultValue={selectedAsset?.model || ''}
                      required
                      placeholder="e.g., ThinkPad X1, MacBook Pro"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Zone/Emplacement *</label>
                  <input
                    type="text"
                    name="zone"
                    defaultValue={(selectedAsset as any)?.zone || ''}
                    required
                    placeholder="e.g., Zone A / Floor 2"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={selectedAsset?.department || ''}
                    required
                    placeholder="e.g., IT"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
                  <input
                      type="date"
                      name="date"
                      defaultValue={selectedAsset?.date || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Purchase Date</label>
                  <input
                      type="date"
                      name="purchase_date"
                      defaultValue={selectedAsset?.purchase_date || ''}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Warranty Expiration
                    </label>
                  <input
                      type="date"
                      name="warranty_expiry"
                      defaultValue={selectedAsset?.warranty_expiry || ''}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Status *</label>
                    <select
                      name="status"
                      defaultValue={selectedAsset?.status || 'active'}
                      required
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={(selectedAsset as any)?.company || ''}
                    placeholder="e.g., ACME Corp"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Owner Name *</label>
                  <input
                    type="text"
                    name="owner_name"
                    defaultValue={selectedAsset?.owner_name || ''}
                    placeholder="e.g., John Doe"
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">IP Address</label>
                  <input
                    type="text"
                    name="ip_address"
                    defaultValue={selectedAsset?.ip_address || ''}
                    placeholder="e.g., 192.168.1.100"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">MAC Address</label>
                  <input
                    type="text"
                    name="mac_address"
                    defaultValue={selectedAsset?.mac_address || ''}
                    placeholder="e.g., 00:1B:44:11:3A:B7"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                </div>
              </div>

              {/* Accessories Section - Only for Laptop/Desktop */}
              {(selectedDeviceType === 'Laptop' || selectedDeviceType === 'Desktop') && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Included Accessories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_mouse"
                        defaultChecked={(selectedAsset as any)?.has_mouse || false}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-foreground">Mouse</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_keyboard"
                        defaultChecked={(selectedAsset as any)?.has_keyboard || false}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-foreground">Keyboard</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_screen"
                        defaultChecked={(selectedAsset as any)?.has_screen || false}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-foreground">Screen</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_headphone"
                        defaultChecked={(selectedAsset as any)?.has_headphone || false}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-foreground">Headphone</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields for Laptop/Desktop */}
              {(selectedDeviceType === 'Laptop' || selectedDeviceType === 'Desktop') && (
                <div className="bg-primary/10 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    <HardDrive className="w-5 h-5 inline mr-2" />
                    Computer Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Processor</label>
                  <input
                        type="text"
                        name="processor"
                        placeholder="e.g., Intel Core i7-11800H"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-foreground mb-1">RAM (GB)</label>
                  <input
                        type="number"
                        name="ram_gb"
                        placeholder="e.g., 16"
                        min="1"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Storage (GB)</label>
                      <input
                        type="number"
                        name="disk_gb"
                        placeholder="e.g., 512"
                        min="1"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Operating System</label>
                      <input
                        type="text"
                        name="os"
                        placeholder="e.g., Windows 11 Pro"
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
              </div>
                  </div>

                </div>
              )}

              {/* Additional Organization Fields */}
              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Poste/Activité</label>
                    <input
                      type="text"
                      name="poste_activite"
                      defaultValue={(selectedAsset as any)?.poste_activite || ''}
                      placeholder="e.g., Support IT"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Remarque</label>
                  <textarea
                    name="remarque"
                    defaultValue={(selectedAsset as any)?.remarque || ''}
                    placeholder="Notes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedAsset(null);
                  }}
                  className="px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAddModal ? 'Add Asset' : 'Update Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Asset Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAsset(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Basic Information Section */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Device Type</label>
                  <div className="flex items-center">
                    {getDeviceIcon(selectedAsset.device_type)}
                    <p className="text-foreground ml-2 font-medium">{selectedAsset.device_type}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Device Hostname</label>
                  <p className="text-foreground font-mono">{selectedAsset.device_name || selectedAsset.hostname || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Company</label>
                  <p className="text-foreground">{(selectedAsset as any).company || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Serial Number</label>
                  <p className="text-foreground font-mono">{selectedAsset.serial_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Brand</label>
                  <p className="text-foreground">{selectedAsset.brand}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Model</label>
                  <p className="text-foreground">{selectedAsset.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Zone/Emplacement</label>
                  <p className="text-foreground">{(selectedAsset as any).zone || selectedAsset.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Department</label>
                  <p className="text-foreground">{selectedAsset.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                  <p className="text-foreground">{selectedAsset.date || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Warranty Expiration</label>
                  <p className="text-foreground">{(selectedAsset as any).warranty_expiration || selectedAsset.warranty_expiry || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Purchase Date</label>
                  <p className="text-foreground">{selectedAsset.purchase_date || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedAsset.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedAsset.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAsset.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Owner</label>
                  <p className="text-foreground">{(selectedAsset as any).assigned_to || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Computer Specifications (for Laptop/Desktop) */}
            {(selectedAsset.device_type === 'Laptop' || selectedAsset.device_type === 'Desktop') && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  <HardDrive className="w-5 h-5 inline mr-2" />
                  Computer Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Processor</label>
                    <p className="text-foreground">{selectedAsset.processor || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">RAM (GB)</label>
                    <p className="text-foreground">{selectedAsset.ram_gb ? `${selectedAsset.ram_gb} GB` : 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Storage (GB)</label>
                    <p className="text-foreground">{selectedAsset.disk_gb ? `${selectedAsset.disk_gb} GB` : 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Operating System</label>
                    <p className="text-foreground">{selectedAsset.os || 'N/A'}</p>
                </div>
                </div>
                
                {/* Accessories */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-foreground mb-3">Included Accessories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg border-2 ${(selectedAsset as any).has_mouse ? 'border-green-300 bg-green-50' : 'border-border bg-muted'}`}>
                      <div className="text-center">
                        <Mouse className={`w-8 h-8 mx-auto mb-2 ${(selectedAsset as any).has_mouse ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${(selectedAsset as any).has_mouse ? 'text-green-800' : 'text-muted-foreground'}`}>
                          Mouse {(selectedAsset as any).has_mouse ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${(selectedAsset as any).has_keyboard ? 'border-green-300 bg-green-50' : 'border-border bg-muted'}`}>
                      <div className="text-center">
                        <Keyboard className={`w-8 h-8 mx-auto mb-2 ${(selectedAsset as any).has_keyboard ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${(selectedAsset as any).has_keyboard ? 'text-green-800' : 'text-muted-foreground'}`}>
                          Keyboard {(selectedAsset as any).has_keyboard ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${(selectedAsset as any).has_screen ? 'border-green-300 bg-green-50' : 'border-border bg-muted'}`}>
                      <div className="text-center">
                        <Monitor className={`w-8 h-8 mx-auto mb-2 ${(selectedAsset as any).has_screen ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${(selectedAsset as any).has_screen ? 'text-green-800' : 'text-muted-foreground'}`}>
                          Screen {(selectedAsset as any).has_screen ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${(selectedAsset as any).has_headphone ? 'border-green-300 bg-green-50' : 'border-border bg-muted'}`}>
                      <div className="text-center">
                        <Headphones className={`w-8 h-8 mx-auto mb-2 ${(selectedAsset as any).has_headphone ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${(selectedAsset as any).has_headphone ? 'text-green-800' : 'text-muted-foreground'}`}>
                          Headphone {(selectedAsset as any).has_headphone ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Device Specifications (for Phone/Tablet) */}
            {(selectedAsset.device_type === 'Phone' || selectedAsset.device_type === 'Tablet') && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  <Smartphone className="w-5 h-5 inline mr-2" />
                  Mobile Device Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">RAM (GB)</label>
                    <p className="text-foreground">{selectedAsset.ram_gb ? `${selectedAsset.ram_gb} GB` : 'N/A'}</p>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Storage (GB)</label>
                    <p className="text-foreground">{selectedAsset.disk_gb ? `${selectedAsset.disk_gb} GB` : 'N/A'}</p>
              </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">IMEI</label>
                    <p className="text-foreground font-mono">{(selectedAsset as any).imei || 'N/A'}</p>
                  </div>
                </div>
                </div>
              )}

            {/* Organization & Remarks */}
            <div className="bg-muted/30 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Organization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Poste/Activité</label>
                  <p className="text-foreground">{(selectedAsset as any).poste_activite || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                  <p className="text-foreground">{(selectedAsset as any).company || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Remarque</label>
                  <p className="text-foreground whitespace-pre-wrap">{(selectedAsset as any).remarque || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Warranty & Purchase Information */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Warranty & Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Purchase Date</label>
                  <p className="text-foreground">{selectedAsset.purchase_date || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Warranty Expiry</label>
                  <p className="text-foreground">{selectedAsset.warranty_expiry || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedAsset.notes || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Network & Location Information */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <Network className="w-5 h-5 inline mr-2" />
                Network & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">IP Address</label>
                  <p className="text-foreground font-mono">{selectedAsset.ip_address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">MAC Address</label>
                  <p className="text-foreground font-mono">{selectedAsset.mac_address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                  <p className="text-foreground">{selectedAsset.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Department</label>
                  <p className="text-foreground">{selectedAsset.department}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAsset(null);
                }}
                className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAsset(selectedAsset);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Export IT Assets</h2>
            
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
                  handleExport(format as 'csv' | 'json' | 'xlsx', theme);
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
      {showExcelImportModal && (
        <ExcelImportModal
          isOpen={showExcelImportModal}
          onClose={() => setShowExcelImportModal(false)}
          onImportComplete={loadAssets}
          assetType="it"
        />
      )}
    </div>
  );
};

export default ITAssetsPage;