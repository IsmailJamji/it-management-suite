const BetterSqlite3 = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

export class Database {
  private db: any;
  private isConnected: boolean = false;

  constructor() {
    const isPackaged = app ? app.isPackaged : false;
    const baseDir = isPackaged ? app.getPath('userData') : process.cwd();
    const dbPath = path.join(baseDir, 'it_management.db');

    try {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    } catch (_) {}

    this.db = new BetterSqlite3(dbPath);
  }

  public async initializeDatabase(): Promise<void> {
    try {
      // Read and execute schema
      const isPackaged = app ? app.isPackaged : false;
      const schemaPath = isPackaged
        ? path.join(process.resourcesPath, 'database', 'schema.sql')
        : path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        this.db.exec(statement);
      }

      this.isConnected = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Basic database methods using better-sqlite3
  public run(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(params);
    } catch (err) {
      console.error('Database run error:', err);
      throw err;
    }
  }

  public get(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(params);
    } catch (err) {
      console.error('Database get error:', err);
      throw err;
    }
  }

  public all(sql: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    } catch (err) {
      console.error('Database all error:', err);
      throw err;
    }
  }

  // User management
  public async getAllUsers(): Promise<any[]> {
    return this.all('SELECT * FROM users ORDER BY id DESC');
  }

  public async createUser(userData: any): Promise<any> {
    const { username, email, password, role = 'user' } = userData;
    const result = this.run(
      'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [username, email, password, role]
    );
    return { id: result.lastInsertRowid, ...userData };
  }

  public async updateUser(id: number, userData: any): Promise<any> {
    const { username, email, role } = userData;
    this.run(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, id]
    );
    return { id, ...userData };
  }

  public async deleteUser(id: number): Promise<void> {
    this.run('DELETE FROM users WHERE id = ?', [id]);
  }

  // Device management
  public async getAllDevices(): Promise<any[]> {
    return this.all('SELECT * FROM devices ORDER BY id DESC');
  }

  public async getDeviceById(id: number): Promise<any> {
    return this.get('SELECT * FROM devices WHERE id = ?', [id]);
  }

  public async createDevice(deviceData: any): Promise<any> {
    const { name, type, status, location, specifications, assigned_to } = deviceData;
    const result = this.run(
      'INSERT INTO devices (name, type, status, location, specifications, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [name, type, status, location, specifications, assigned_to]
    );
    return { id: result.lastInsertRowid, ...deviceData };
  }

  public async updateDevice(id: number, deviceData: any): Promise<any> {
    const { name, type, status, location, specifications, assigned_to } = deviceData;
    this.run(
      'UPDATE devices SET name = ?, type = ?, status = ?, location = ?, specifications = ?, assigned_to = ? WHERE id = ?',
      [name, type, status, location, specifications, assigned_to, id]
    );
    return { id, ...deviceData };
  }

  public async deleteDevice(id: number): Promise<void> {
    this.run('DELETE FROM devices WHERE id = ?', [id]);
  }

  // IT Assets
  public async getAllITAssets(): Promise<any[]> {
    return this.all('SELECT * FROM it_assets ORDER BY id DESC');
  }

  public async getITAssetById(id: number): Promise<any> {
    return this.get('SELECT * FROM it_assets WHERE id = ?', [id]);
  }

  public async createITAsset(assetData: any): Promise<any> {
    const { device_type, brand, model, serial_number, status, location, assigned_to, purchase_date, warranty_expiration } = assetData;
    const result = this.run(
      'INSERT INTO it_assets (device_type, brand, model, serial_number, status, location, assigned_to, purchase_date, warranty_expiration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [device_type, brand, model, serial_number, status, location, assigned_to, purchase_date, warranty_expiration]
    );
    return { id: result.lastInsertRowid, ...assetData };
  }

  public async updateITAsset(id: number, assetData: any): Promise<any> {
    const { device_type, brand, model, serial_number, status, location, assigned_to, purchase_date, warranty_expiration } = assetData;
    this.run(
      'UPDATE it_assets SET device_type = ?, brand = ?, model = ?, serial_number = ?, status = ?, location = ?, assigned_to = ?, purchase_date = ?, warranty_expiration = ? WHERE id = ?',
      [device_type, brand, model, serial_number, status, location, assigned_to, purchase_date, warranty_expiration, id]
    );
    return { id, ...assetData };
  }

  public async deleteITAsset(id: number): Promise<void> {
    this.run('DELETE FROM it_assets WHERE id = ?', [id]);
  }

  // Telecom Assets
  public async getAllTelecomAssets(): Promise<any[]> {
    return this.all('SELECT * FROM telecom_assets ORDER BY id DESC');
  }

  public async getTelecomAssetById(id: number): Promise<any> {
    return this.get('SELECT * FROM telecom_assets WHERE id = ?', [id]);
  }

  public async createTelecomAsset(assetData: any): Promise<any> {
    const { provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status } = assetData;
    const result = this.run(
      'INSERT INTO telecom_assets (provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status]
    );
    return { id: result.lastInsertRowid, ...assetData };
  }

  public async updateTelecomAsset(id: number, assetData: any): Promise<any> {
    const { provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status } = assetData;
    this.run(
      'UPDATE telecom_assets SET provider = ?, sim_number = ?, sim_owner = ?, subscription_type = ?, date = ?, zone = ?, department = ?, data_plan = ?, pin_code = ?, puk_code = ?, status = ? WHERE id = ?',
      [provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, id]
    );
    return { id, ...assetData };
  }

  public async deleteTelecomAsset(id: number): Promise<void> {
    this.run('DELETE FROM telecom_assets WHERE id = ?', [id]);
  }

  // Project management
  public async getAllProjects(): Promise<any[]> {
    return this.all('SELECT * FROM projects ORDER BY id DESC');
  }

  public async getProjectsByUserId(userId: number): Promise<any[]> {
    return this.all('SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC', [userId]);
  }

  public async createProject(projectData: any): Promise<any> {
    const { name, description, status, start_date, end_date, user_id } = projectData;
    const result = this.run(
      'INSERT INTO projects (name, description, status, start_date, end_date, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [name, description, status, start_date, end_date, user_id]
    );
    return { id: result.lastInsertRowid, ...projectData };
  }

  public async updateProject(id: number, projectData: any): Promise<any> {
    const { name, description, status, start_date, end_date } = projectData;
    this.run(
      'UPDATE projects SET name = ?, description = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, description, status, start_date, end_date, id]
    );
    return { id, ...projectData };
  }

  public async deleteProject(id: number): Promise<void> {
    this.run('DELETE FROM projects WHERE id = ?', [id]);
  }

  // Task management
  public async getAllTasks(): Promise<any[]> {
    return this.all('SELECT * FROM tasks ORDER BY id DESC');
  }

  public async getTasksByUserId(userId: number): Promise<any[]> {
    return this.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC', [userId]);
  }

  public async createTask(taskData: any): Promise<any> {
    const { title, description, status, priority, due_date, user_id, project_id } = taskData;
    const result = this.run(
      'INSERT INTO tasks (title, description, status, priority, due_date, user_id, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [title, description, status, priority, due_date, user_id, project_id]
    );
    return { id: result.lastInsertRowid, ...taskData };
  }

  public async updateTask(id: number, taskData: any): Promise<any> {
    const { title, description, status, priority, due_date } = taskData;
    this.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [title, description, status, priority, due_date, id]
    );
    return { id, ...taskData };
  }

  public async deleteTask(id: number): Promise<void> {
    this.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // System monitoring
  public async getSystemMonitoringData(deviceId: number, hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return this.all(
      'SELECT * FROM system_monitoring WHERE device_id = ? AND timestamp > ? ORDER BY timestamp DESC',
      [deviceId, since]
    );
  }

  // Audit logging
  public async addAuditLog(auditData: any): Promise<void> {
    const { user_id, action, resource, details } = auditData;
    this.run(
      'INSERT INTO audit_logs (user_id, action, resource, details, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
      [user_id, action, resource, details]
    );
  }

  // Import/Export methods
  public async importITAssets(data: any[], format: string): Promise<any> {
    // Simple implementation - in real app you'd handle CSV/Excel parsing
    for (const asset of data) {
      await this.createITAsset(asset);
    }
    return { success: true, imported: data.length };
  }

  public async importTelecomAssets(data: any[], format: string): Promise<any> {
    // Simple implementation - in real app you'd handle CSV/Excel parsing
    for (const asset of data) {
      await this.createTelecomAsset(asset);
    }
    return { success: true, imported: data.length };
  }

  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

export const database = new Database();
