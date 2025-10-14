import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Clock, CheckCircle, AlertCircle, Users, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  manager_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  created_at: string;
}

const ProjectsPage: React.FC = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let data;
      if (hasPermission('view_projects')) {
        if (isAdmin()) {
          // Admin can see all projects
          data = await window.electronAPI.projects.getAll();
        } else {
          // Regular users can only see projects they're assigned to
          data = await window.electronAPI.projects.getByUser(user?.id || 0);
        }
      } else {
        data = [];
      }
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      if (window.electronAPI && isAdmin()) {
        const data = await window.electronAPI.users.getAll();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.projects.delete(projectId);
        }
        await loadProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleExport = async (format: string = 'xlsx', theme: string = 'modern') => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.projects.export(format, theme);
        
        if (result.success) {
          alert(`✅ Export successful!\nFile saved to: ${result.filePath}`);
        } else {
          alert(`❌ Export failed: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Failed to export projects:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      if (window.electronAPI) {
        if (selectedProject) {
          await window.electronAPI.projects.update(selectedProject.id, projectData);
        } else {
          await window.electronAPI.projects.create({
            ...projectData,
            managerId: user?.id
          });
        }
      }
      await loadProjects();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planning':
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planning':
        return 'bg-muted text-muted-foreground';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and track your projects</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="btn btn-outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          {hasPermission('create_projects') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">Project</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                </span>
                <div className="relative group">
                  <button className="p-1 hover:bg-accent rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    {hasPermission('edit_projects') && (
                      <button
                        onClick={() => handleEditProject(project)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </button>
                    )}
                    {hasPermission('delete_projects') && (
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Manager:</span>
                <span className="font-medium">{project.manager_name || 'Unassigned'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              
              {project.budget && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">${project.budget.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleViewProject(project)}
                className="flex-1 btn btn-outline btn-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              {hasPermission('edit_projects') && (
                <button 
                  onClick={() => handleEditProject(project)}
                  className="flex-1 btn btn-outline btn-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first project.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const projectData = {
                name: formData.get('name'),
                description: formData.get('description'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : null
              };
              handleSaveProject(projectData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.name')} *</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedProject?.name || ''}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.description')}</label>
                  <textarea
                    name="description"
                    defaultValue={selectedProject?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.status')}</label>
                    <select
                      name="status"
                      defaultValue={selectedProject?.status || 'planning'}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.priority')}</label>
                    <select
                      name="priority"
                      defaultValue={selectedProject?.priority || 'medium'}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.startDate')}</label>
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={selectedProject?.start_date ? selectedProject.start_date.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.endDate')}</label>
                    <input
                      name="endDate"
                      type="date"
                      defaultValue={selectedProject?.end_date ? selectedProject.end_date.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.budget')}</label>
                  <input
                    name="budget"
                    type="number"
                    step="0.01"
                    defaultValue={selectedProject?.budget || ''}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedProject(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Project Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProject(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <p className="text-sm text-foreground">{selectedProject.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.status')}</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                      {getStatusIcon(selectedProject.status)}
                      <span className="ml-1 capitalize">{selectedProject.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.priority')}</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.manager')}</label>
                    <p className="text-sm text-foreground">{selectedProject.manager_name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <p className="text-sm text-foreground">{selectedProject.description || 'No description'}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.startDate')}</label>
                    <p className="text-sm text-foreground">
                      {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('fields.endDate')}</label>
                    <p className="text-sm text-foreground">
                      {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  {selectedProject.budget && (
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('fields.budget')}</label>
                      <p className="text-sm text-foreground">${selectedProject.budget.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProject(null);
                }}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditProject(selectedProject);
                }}
                className="btn btn-primary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Export Projects</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('export.format')}</label>
                <select id="exportFormat" className="w-full px-3 py-2 border border-input rounded-md">
                  <option value="xlsx">Excel (.xlsx) - Modern Format</option>
                  <option value="csv">CSV (.csv) - Simple Format</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('export.theme')}</label>
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
    </div>
  );
};

export default ProjectsPage;
