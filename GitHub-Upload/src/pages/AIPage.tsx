import React, { useState, useEffect } from 'react';
import { Bot, Send, Lightbulb, Cpu, CheckSquare, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';

interface AISuggestion {
  type: 'task' | 'device' | 'project' | 'security' | 'performance';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  estimatedImpact?: string;
}

const AIPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai', message: string }>>([]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);

    setIsLoading(true);
    try {
      let aiResponse = '';
      
      if (window.electronAPI) {
        // Get real system context
        const [tasks, projects, devices, systemInfo] = await Promise.all([
          window.electronAPI.tasks.getAll().catch(() => []),
          window.electronAPI.projects.getAll().catch(() => []),
          window.electronAPI.devices.getAll().catch(() => []),
          window.electronAPI.system.collectInfo().catch(() => null)
        ]);

        const context = {
          userRole: 'admin', // This should come from auth context
          currentTasks: tasks,
          devices: devices,
          projects: projects,
          systemHealth: systemInfo ? { score: 85 } : { score: 0 }
        };

        // Get AI suggestions based on context
        const suggestions = await window.electronAPI.ai.getSuggestions(context);
        
        if (suggestions && suggestions.length > 0) {
          aiResponse = `Basé sur votre infrastructure IT, voici mes recommandations intelligentes :\n\n`;
          suggestions.forEach((suggestion: any, index: number) => {
            const priorityEmoji = suggestion.priority === 'critical' ? '🔴' : 
                                 suggestion.priority === 'high' ? '🟠' : 
                                 suggestion.priority === 'medium' ? '🟡' : '🟢';
            aiResponse += `${index + 1}. ${priorityEmoji} **${suggestion.title}** (Priorité ${suggestion.priority})\n`;
            aiResponse += `   ${suggestion.description}\n`;
            if (suggestion.action) {
              aiResponse += `   💡 Action recommandée: ${suggestion.action}\n`;
            }
            if (suggestion.estimatedImpact) {
              aiResponse += `   📈 Impact estimé: ${suggestion.estimatedImpact}\n`;
            }
            aiResponse += `\n`;
          });
        } else {
          aiResponse = `Je comprends que vous demandez à propos de "${userMessage}". Basé sur votre infrastructure IT actuelle, je peux vous aider avec :\n\n`;
          aiResponse += `• Gestion et priorisation des tâches\n`;
          aiResponse += `• Optimisation des performances système\n`;
          aiResponse += `• Planification de projets et allocation des ressources\n`;
          aiResponse += `• Surveillance et maintenance des équipements\n`;
          aiResponse += `• Recommandations de sécurité\n\n`;
          aiResponse += `Comment puis-je vous aider davantage ?`;
        }
      } else {
        // Fallback response
        aiResponse = `I understand you're asking about "${userMessage}". Based on your IT infrastructure, here are some recommendations...`;
      }
      
      setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorResponse = `I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.`;
      setChatHistory(prev => [...prev, { role: 'ai', message: errorResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      
      if (window.electronAPI) {
        // Get real system context
        const [tasks, projects, devices, systemInfo] = await Promise.all([
          window.electronAPI.tasks.getAll().catch(() => []),
          window.electronAPI.projects.getAll().catch(() => []),
          window.electronAPI.devices.getAll().catch(() => []),
          window.electronAPI.system.collectInfo().catch(() => null)
        ]);

        const context = {
          userRole: 'admin',
          currentTasks: tasks,
          devices: devices,
          projects: projects,
          systemHealth: systemInfo ? { score: 85 } : { score: 0 }
        };
        
        const data = await window.electronAPI.ai.getSuggestions(context);
        setSuggestions(data || []);
      } else {
        // Fallback suggestions for development
        setSuggestions([
          {
            type: 'performance',
            title: 'System Performance Optimization',
            description: 'Your system performance could be improved by updating drivers and clearing temporary files.',
            priority: 'medium',
            action: 'Run system cleanup and update drivers',
            estimatedImpact: '15-20% performance improvement'
          },
          {
            type: 'security',
            title: 'Security Update Required',
            description: 'Several devices are missing critical security updates.',
            priority: 'high',
            action: 'Schedule security updates for all devices',
            estimatedImpact: 'Enhanced security posture'
          },
          {
            type: 'task',
            title: 'Task Management Optimization',
            description: 'Consider reorganizing tasks by priority to improve team productivity.',
            priority: 'low',
            action: 'Review and reprioritize pending tasks',
            estimatedImpact: 'Better task visibility and completion rates'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        {
          type: 'performance',
          title: 'System Performance Optimization',
          description: 'Your system performance could be improved by updating drivers and clearing temporary files.',
          priority: 'medium',
          action: 'Run system cleanup and update drivers',
          estimatedImpact: '15-20% performance improvement'
        },
        {
          type: 'security',
          title: 'Security Update Required',
          description: 'Several devices are missing critical security updates.',
          priority: 'high',
          action: 'Schedule security updates for all devices',
          estimatedImpact: 'Enhanced security posture'
        },
        {
          type: 'task',
          title: 'Task Management Optimization',
          description: 'Consider reorganizing tasks by priority to improve team productivity.',
          priority: 'low',
          action: 'Review and reprioritize pending tasks',
          estimatedImpact: 'Better task visibility and completion rates'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case 'device':
        return <Cpu className="h-5 w-5 text-green-500" />;
      case 'project':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'security':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground">Get intelligent recommendations and assistance</p>
        </div>
        <button onClick={loadSuggestions} className="btn btn-outline">
          <Lightbulb className="h-4 w-4 mr-2" />
          Get Suggestions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chat with AI</h3>
          
          {/* Chat History */}
          <div className="h-80 overflow-y-auto space-y-4 mb-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start a conversation with the AI assistant</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your IT infrastructure..."
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="btn btn-primary"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">AI Suggestions</h3>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Click "Get Suggestions" to see AI recommendations</p>
              <button onClick={loadSuggestions} className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Suggestions
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-foreground">{suggestion.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                      {suggestion.action && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Action:</strong> {suggestion.action}
                        </p>
                      )}
                      {suggestion.estimatedImpact && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Impact:</strong> {suggestion.estimatedImpact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <Cpu className="h-6 w-6 text-blue-500 mb-2" />
            <h4 className="font-medium text-foreground">Analyze System</h4>
            <p className="text-sm text-muted-foreground">Get system performance analysis</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <CheckSquare className="h-6 w-6 text-green-500 mb-2" />
            <h4 className="font-medium text-foreground">Optimize Tasks</h4>
            <p className="text-sm text-muted-foreground">Improve task management</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
            <h4 className="font-medium text-foreground">Security Check</h4>
            <p className="text-sm text-muted-foreground">Review security status</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
            <h4 className="font-medium text-foreground">Performance Tips</h4>
            <p className="text-sm text-muted-foreground">Get optimization tips</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
