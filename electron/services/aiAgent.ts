import OpenAI from 'openai';
import { database } from '../database/database';

export interface AISuggestion {
  type: 'task' | 'device' | 'project' | 'security' | 'performance';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  estimatedImpact?: string;
}

export interface SystemAnalysis {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  recommendations: string[];
  performanceScore: number;
}

export class AIAgent {
  private openai: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    try {
      // In production, this should come from environment variables
      const apiKey = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
      
      if (apiKey && apiKey !== 'your-openai-api-key-here') {
        try {
          this.openai = new (OpenAI as any)({
            apiKey: apiKey
          });
          this.isInitialized = true;
          console.log('OpenAI initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize OpenAI:', error);
          this.isInitialized = false;
        }
      } else {
        console.warn('OpenAI API key not provided. AI features will be limited.');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      this.isInitialized = false;
    }
  }

  async getSuggestions(context: {
    userRole: string;
    currentTasks: any[];
    devices: any[];
    projects: any[];
    systemHealth: any;
  }): Promise<AISuggestion[]> {
    try {
      if (!this.isInitialized) {
        return this.getFallbackSuggestions(context);
      }

      const prompt = this.buildSuggestionPrompt(context);
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for an IT Management System. Provide helpful suggestions based on the context provided. Return suggestions strictly as compact JSON array only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.4
      });

      const raw = (response.choices?.[0]?.message?.content ?? '').trim();
      const jsonString = this.extractJson(raw);
      const suggestions = JSON.parse(jsonString || '[]');
      
      // Log AI action
      await database.logAIAction({
        actionType: 'SUGGESTIONS',
        description: 'Generated AI suggestions',
        aiResponse: JSON.stringify(suggestions)
      });

      return suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return this.getFallbackSuggestions(context);
    }
  }

  async analyzeSystem(systemData: any): Promise<SystemAnalysis> {
    try {
      if (!this.isInitialized) {
        return this.getFallbackSystemAnalysis(systemData);
      }

      const prompt = this.buildSystemAnalysisPrompt(systemData);
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI system analyst for IT infrastructure. Analyze the provided system data and return a comprehensive analysis strictly as JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      const raw = (response.choices?.[0]?.message?.content ?? '').trim();
      const jsonString = this.extractJson(raw);
      const analysis = JSON.parse(jsonString || '{}');
      
      // Log AI action
      await database.logAIAction({
        actionType: 'SYSTEM_ANALYSIS',
        description: 'Performed system analysis',
        aiResponse: JSON.stringify(analysis)
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing system:', error);
      return this.getFallbackSystemAnalysis(systemData);
    }
  }

  async manageTasks(tasks: any[]): Promise<{
    prioritizedTasks: any[];
    recommendations: string[];
    estimatedCompletion: string;
  }> {
    try {
      if (!this.isInitialized) {
        return this.getFallbackTaskManagement(tasks);
      }

      const prompt = this.buildTaskManagementPrompt(tasks);
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI task management assistant. Analyze tasks and provide prioritization and recommendations strictly as JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.35
      });

      const raw = (response.choices?.[0]?.message?.content ?? '').trim();
      const jsonString = this.extractJson(raw);
      const management = JSON.parse(jsonString || '{}');
      
      // Log AI action
      await database.logAIAction({
        actionType: 'TASK_MANAGEMENT',
        description: 'Managed and prioritized tasks',
        aiResponse: JSON.stringify(management)
      });

      return management;
    } catch (error) {
      console.error('Error managing tasks:', error);
      return this.getFallbackTaskManagement(tasks);
    }
  }

  // Extract first JSON object/array substring to guard against stray text
  private extractJson(text: string): string {
    if (!text) return '';
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const start = [firstBrace, firstBracket].filter(i => i >= 0).sort((a,b)=>a-b)[0] ?? -1;
    if (start < 0) return text;
    let stack: string[] = [];
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}' || ch === ']') {
        const last = stack[stack.length - 1];
        if ((last === '{' && ch === '}') || (last === '[' && ch === ']')) {
          stack.pop();
          if (stack.length === 0) {
            return text.substring(start, i + 1);
          }
        } else {
          // mismatched, break
          break;
        }
      }
    }
    return text.substring(start);
  }

  private buildSuggestionPrompt(context: any): string {
    return `
    Context:
    - User Role: ${context.userRole}
    - Current Tasks: ${JSON.stringify(context.currentTasks)}
    - Devices: ${JSON.stringify(context.devices)}
    - Projects: ${JSON.stringify(context.projects)}
    - System Health: ${JSON.stringify(context.systemHealth)}

    Please provide 3-5 actionable suggestions for improving IT management efficiency. 
    Consider the user's role and current workload.
    
    Return format:
    [
      {
        "type": "task|device|project|security|performance",
        "title": "Suggestion title",
        "description": "Detailed description",
        "priority": "low|medium|high|critical",
        "action": "Specific action to take",
        "estimatedImpact": "Expected impact"
      }
    ]
    `;
  }

  private buildSystemAnalysisPrompt(systemData: any): string {
    return `
    System Data:
    ${JSON.stringify(systemData, null, 2)}

    Analyze this system data and provide:
    1. Overall health assessment
    2. Identified issues with severity levels
    3. Specific recommendations
    4. Performance score (0-100)
    
    Return format:
    {
      "overallHealth": "excellent|good|fair|poor",
      "issues": [
        {
          "type": "Issue type",
          "severity": "low|medium|high|critical",
          "description": "Issue description",
          "recommendation": "How to fix"
        }
      ],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "performanceScore": 85
    }
    `;
  }

  private buildTaskManagementPrompt(tasks: any[]): string {
    return `
    Tasks to manage:
    ${JSON.stringify(tasks, null, 2)}

    Please:
    1. Prioritize tasks based on urgency, importance, and dependencies
    2. Provide recommendations for task optimization
    3. Estimate completion time
    
    Return format:
    {
      "prioritizedTasks": [sorted task array],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "estimatedCompletion": "Estimated completion time"
    }
    `;
  }

  private getFallbackSuggestions(context: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Enhanced suggestions based on context
    const taskCount = context.currentTasks?.length || 0;
    const deviceCount = context.devices?.length || 0;
    const projectCount = context.projects?.length || 0;
    const systemHealth = context.systemHealth?.score || 85;

    // Task management suggestions
    if (taskCount > 10) {
      suggestions.push({
        type: 'task',
        title: 'Surcharge de tâches détectée',
        description: `Vous avez ${taskCount} tâches en cours. Considérez la délégation ou la priorisation.`,
        priority: 'high',
        action: 'Réviser et déléguer les tâches',
        estimatedImpact: 'Réduire le stress et améliorer l\'efficacité'
      });
    } else if (taskCount > 5) {
      suggestions.push({
        type: 'task',
        title: 'Optimisation des tâches',
        description: 'Considérez l\'utilisation de la méthode Pomodoro pour améliorer la productivité.',
        priority: 'medium',
        action: 'Implémenter des techniques de gestion du temps',
        estimatedImpact: 'Améliorer la concentration et l\'efficacité'
      });
    }

    // Device management suggestions
    if (deviceCount > 0) {
      const maintenanceDevices = context.devices?.filter((d: any) => d.status === 'maintenance') || [];
      if (maintenanceDevices.length > 0) {
        suggestions.push({
          type: 'device',
          title: 'Maintenance d\'équipements requise',
          description: `${maintenanceDevices.length} équipement(s) nécessitent une attention.`,
          priority: 'medium',
          action: 'Vérifier les plannings de maintenance',
          estimatedImpact: 'Prévenir les pannes d\'équipements'
        });
      }

      const inactiveDevices = context.devices?.filter((d: any) => d.status === 'inactive') || [];
      if (inactiveDevices.length > 0) {
        suggestions.push({
          type: 'device',
          title: 'Équipements inactifs',
          description: `${inactiveDevices.length} équipement(s) sont inactifs. Vérifiez leur statut.`,
          priority: 'low',
          action: 'Auditer les équipements inactifs',
          estimatedImpact: 'Optimiser l\'utilisation des ressources'
        });
      }
    }

    // Project management suggestions
    if (projectCount > 3) {
      suggestions.push({
        type: 'project',
        title: 'Gestion de projets multiples',
        description: `Vous gérez ${projectCount} projets. Assurez-vous d\'avoir une vue d\'ensemble claire.`,
        priority: 'medium',
        action: 'Créer un tableau de bord de projets',
        estimatedImpact: 'Améliorer la coordination et la visibilité'
      });
    }

    // System health suggestions
    if (systemHealth < 70) {
      suggestions.push({
        type: 'performance',
        title: 'Performance système faible',
        description: `Score de santé système: ${systemHealth}%. Des améliorations sont nécessaires.`,
        priority: 'high',
        action: 'Analyser et optimiser les performances',
        estimatedImpact: 'Améliorer la stabilité et les performances'
      });
    } else if (systemHealth < 85) {
      suggestions.push({
        type: 'performance',
        title: 'Optimisation système recommandée',
        description: `Score de santé: ${systemHealth}%. Quelques optimisations pourraient aider.`,
        priority: 'medium',
        action: 'Effectuer des vérifications de maintenance',
        estimatedImpact: 'Maintenir des performances optimales'
      });
    }

    // Security suggestions
    suggestions.push({
      type: 'security',
      title: 'Vérification de sécurité',
      description: 'Effectuez une vérification régulière des mises à jour de sécurité.',
      priority: 'medium',
      action: 'Vérifier les mises à jour de sécurité',
      estimatedImpact: 'Maintenir la sécurité du système'
    });

    // General productivity suggestions
    suggestions.push({
      type: 'performance',
      title: 'Rapport de performance',
      description: 'Générez un rapport hebdomadaire pour suivre les progrès et identifier les tendances.',
      priority: 'low',
      action: 'Créer des rapports automatisés',
      estimatedImpact: 'Améliorer la prise de décision basée sur les données'
    });

    return suggestions;
  }

  private getFallbackSystemAnalysis(systemData: any): SystemAnalysis {
    const issues = [];
    let performanceScore = 80;

    // Basic analysis based on system data
    if (systemData.memory && systemData.memory.used / systemData.memory.total > 0.9) {
      issues.push({
        type: 'Memory',
        severity: 'high' as const,
        description: 'High memory usage detected',
        recommendation: 'Consider adding more RAM or closing unnecessary applications'
      });
      performanceScore -= 20;
    }

    if (systemData.disk && systemData.disk.used / systemData.disk.total > 0.9) {
      issues.push({
        type: 'Storage',
        severity: 'medium' as const,
        description: 'Low disk space',
        recommendation: 'Free up disk space or add more storage'
      });
      performanceScore -= 10;
    }

    return {
      overallHealth: performanceScore > 80 ? 'excellent' : performanceScore > 60 ? 'good' : 'fair',
      issues,
      recommendations: [
        'Regular system maintenance',
        'Monitor resource usage',
        'Keep software updated'
      ],
      performanceScore: Math.max(0, performanceScore)
    };
  }

  private getFallbackTaskManagement(tasks: any[]): any {
    // Simple priority sorting
    const prioritizedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });

    return {
      prioritizedTasks,
      recommendations: [
        'Focus on high-priority tasks first',
        'Break down large tasks into smaller ones',
        'Set realistic deadlines'
      ],
      estimatedCompletion: 'Based on current workload and priorities'
    };
  }

  isAIAvailable(): boolean {
    return this.isInitialized;
  }
}
