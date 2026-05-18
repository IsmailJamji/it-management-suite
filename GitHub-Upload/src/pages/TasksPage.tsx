import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: number | null;
  project_name: string;
  assigned_user_id: number | null;
  assigned_user_name: string;
  created_by_id: number;
  created_by_name: string;
  due_date: string;
  estimated_hours: number | null;
  progress_percentage: number;
  created_at: string;
}

const TasksPage: React.FC = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let data;
      if (isAdmin()) {
        data = await window.electronAPI.tasks.getAll();
      } else {
        data = await window.electronAPI.tasks.getByUser(user?.id || 0);
      }
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
        const data = await window.electronAPI.projects.getAll();
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadUsers = async () => {
    try {
        const data = await window.electronAPI.users.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      console.log('🔍 Frontend: Starting task save process');
      console.log('🔍 Frontend: Task data:', taskData);
      
      if (window.electronAPI) {
        if (selectedTask) {
          console.log('🔍 Frontend: Updating task (edit mode)');
          await window.electronAPI.tasks.update(selectedTask.id, taskData);
        } else {
          console.log('🔍 Frontend: Creating new task');
          const createData = {
            ...taskData,
            createdById: user?.id
          };
          console.log('🔍 Frontend: Final create data:', createData);
          
          const result = await window.electronAPI.tasks.create(createData);
          console.log('🔍 Frontend: Task creation result:', result);
        }
      }
      await loadTasks();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'review': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await window.electronAPI.tasks.delete(id);
        await loadTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('❌ Failed to delete task. Please try again.');
      }
    }
  };

  const handleExportTasks = async () => {
    try {
      await window.electronAPI.tasks.export('excel', 'light');
      alert('✅ Tasks exported successfully!');
    } catch (error) {
      console.error('Failed to export tasks:', error);
      alert('❌ Export failed. Please try again.');
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
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <div className="flex space-x-2">
          {hasPermission('create_tasks') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          )}
          <button 
            onClick={handleExportTasks}
            className="btn btn-outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md"
          />
        </div>
          </div>
          <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
        >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
          </div>
      </div>

      <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
              <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(task.status)}
                      <h3 className="font-medium">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Assigned to: {task.assigned_user_name || 'Unassigned'}</span>
                      <span>Project: {task.project_name || 'No project'}</span>
                      {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
                  <div className="flex items-center space-x-2">
                  <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowViewModal(true);
                      }}
                      className="p-2 hover:bg-accent rounded-md"
                    >
                      <Eye className="h-4 w-4" />
                  </button>
                    {hasPermission('edit_tasks') && (
                  <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-accent rounded-md"
                      >
                        <Edit className="h-4 w-4" />
                  </button>
                    )}
                    {hasPermission('delete_tasks') && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-accent rounded-md text-destructive"
                  >
                        <Trash2 className="h-4 w-4" />
                  </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                projectId: formData.get('projectId') ? parseInt(formData.get('projectId') as string) : null,
                assignedUserId: formData.get('assignedUserId') ? parseInt(formData.get('assignedUserId') as string) : null,
                dueDate: formData.get('dueDate') || null,
                estimatedHours: formData.get('estimatedHours') ? parseInt(formData.get('estimatedHours') as string) : null,
                progressPercentage: formData.get('progressPercentage') ? parseInt(formData.get('progressPercentage') as string) : 0
              };
              handleSaveTask(taskData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select name="status" className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select name="priority" className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project</label>
                    <select name="projectId" className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="">No project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assigned To</label>
                    <select name="assignedUserId" className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      name="dueDate"
                      type="date"
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
              </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <input
                      name="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                projectId: formData.get('projectId') ? parseInt(formData.get('projectId') as string) : null,
                assignedUserId: formData.get('assignedUserId') ? parseInt(formData.get('assignedUserId') as string) : null,
                dueDate: formData.get('dueDate') || null,
                estimatedHours: formData.get('estimatedHours') ? parseInt(formData.get('estimatedHours') as string) : null,
                progressPercentage: formData.get('progressPercentage') ? parseInt(formData.get('progressPercentage') as string) : 0
              };
              handleSaveTask(taskData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={selectedTask.title}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedTask.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select name="status" defaultValue={selectedTask.status} className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select name="priority" defaultValue={selectedTask.priority} className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project</label>
                    <select name="projectId" defaultValue={selectedTask.project_id || ''} className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="">No project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assigned To</label>
                    <select name="assignedUserId" defaultValue={selectedTask.assigned_user_id || ''} className="w-full px-3 py-2 border border-input rounded-md">
                      <option value="">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <input
                      name="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      defaultValue={selectedTask.estimated_hours || ''}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                  </div>
                  
                  <div>
                  <label className="block text-sm font-medium mb-1">Progress Percentage</label>
                    <input
                      name="progressPercentage"
                      type="number"
                      min="0"
                      max="100"
                    defaultValue={selectedTask.progress_percentage}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <p className="text-sm text-foreground">{selectedTask.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <p className="text-sm text-foreground">{selectedTask.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <p className="text-sm text-foreground capitalize">{selectedTask.status.replace('_', ' ')}</p>
                </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <p className="text-sm text-foreground capitalize">{selectedTask.priority}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project</label>
                  <p className="text-sm text-foreground">{selectedTask.project_name || 'No project'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assigned To</label>
                    <p className="text-sm text-foreground">{selectedTask.assigned_user_name || 'Unassigned'}</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <p className="text-sm text-foreground">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <p className="text-sm text-foreground">{selectedTask.estimated_hours || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Progress</label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${selectedTask.progress_percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{selectedTask.progress_percentage}% complete</p>
              </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Created By</label>
                    <p className="text-sm text-foreground">{selectedTask.created_by_name}</p>
                  </div>

                  <div>
                <label className="block text-sm font-medium mb-1">Created At</label>
                <p className="text-sm text-foreground">
                  {new Date(selectedTask.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTask(null);
                }}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;