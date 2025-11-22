import React, { useState, useEffect } from 'react';
import { saveToStorage, getFromStorage } from '../utils/storage';
import { detectTaskConflicts } from '../utils/aiEngine';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    deadline: '',
    priority: 'Medium',
    category: 'Study',
    scheduledTime: ''
  });
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = getFromStorage('tasks', []);
    
    // FIX 1: Safer sorting logic in case priority is missing
    const sortedTasks = savedTasks.sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      // Default to 'Medium' if priority is undefined
      const pA = priorityOrder[a.priority || 'Medium'];
      const pB = priorityOrder[b.priority || 'Medium'];
      return pA - pB;
    });
    
    setTasks(sortedTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTask = {
      id: editingTask ? editingTask.id : Date.now(),
      ...formData,
      completed: editingTask ? editingTask.completed : false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString()
    };

    const taskConflicts = detectTaskConflicts(
      tasks.filter(t => t.id !== newTask.id),
      newTask
    );

    if (taskConflicts.length > 0) {
      setConflicts(taskConflicts);
      return;
    }

    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? newTask : t);
    } else {
      updatedTasks = [...tasks, newTask];
    }

    updatedTasks.sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const pA = priorityOrder[a.priority || 'Medium'];
      const pB = priorityOrder[b.priority || 'Medium'];
      return pA - pB;
    });

    setTasks(updatedTasks);
    saveToStorage('tasks', updatedTasks);
    resetForm();
  };

  const handleToggleComplete = (taskId) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    saveToStorage('tasks', updatedTasks);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name || '',
      duration: task.duration || '',
      deadline: task.deadline || '',
      priority: task.priority || 'Medium',
      category: task.category || 'Study',
      scheduledTime: task.scheduledTime || ''
    });
    setShowForm(true);
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Delete this task?')) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      saveToStorage('tasks', updatedTasks);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: '',
      deadline: '',
      priority: 'Medium',
      category: 'Study',
      scheduledTime: ''
    });
    setShowForm(false);
    setEditingTask(null);
    setConflicts([]);
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">Organize and prioritize your tasks</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      {conflicts.length > 0 && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Schedule Conflict Detected!</strong>
            <p>This task overlaps with: {conflicts.map(c => c.name).join(', ')}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setConflicts([])}>
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Task Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Duration (hours) *</label>
                <input
                  type="number"
                  className="form-input"
                  min="0.5"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deadline *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Study">Study</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
              <div className="task-card-header">
                <input
                  type="checkbox"
                  checked={!!task.completed} // Ensure boolean
                  onChange={() => handleToggleComplete(task.id)}
                  className="task-checkbox"
                />
                <h3 className="task-title">{task.name}</h3>
                {/* FIX 2: Added (task.priority || 'medium').toLowerCase() to prevent crash */}
                <span className={`badge badge-${(task.priority || 'medium').toLowerCase()}`}>
                  {task.priority || 'Medium'}
                </span>
              </div>

              <div className="task-meta">
                <div className="task-meta-item">
                  <span>📁</span>
                  <span>{task.category || 'General'}</span>
                </div>
                <div className="task-meta-item">
                  <span>⏱️</span>
                  <span>{task.duration || 0}h</span>
                </div>
                <div className="task-meta-item">
                  <span>📅</span>
                  {/* FIX 3: Added check for deadline existence */}
                  <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>

              <div className="task-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleEdit(task)}
                  disabled={task.completed}
                >
                  ✏️
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => handleDelete(task.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;