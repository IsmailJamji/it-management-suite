const BetterSqlite3 = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { DatabaseConfigService } from '../services/databaseConfigService';

export class Database {
  private db: any;
  private isConnected: boolean = false;
  private configService: DatabaseConfigService;

  constructor() {
    this.configService = new DatabaseConfigService();
    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      const config = this.configService.getConfig();
      let dbPath: string;

      if (config) {
        // Use configured database path
        dbPath = config.dbPath;
      } else {
        // Fallback to default local path
        const isPackaged = app ? app.isPackaged : false;
        const baseDir = isPackaged ? app.getPath('userData') : process.cwd();
        dbPath = path.join(baseDir, 'it_management.db');
      }

      // Ensure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new BetterSqlite3(dbPath);
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      this.isConnected = false;
    }
  }

  public setDatabasePath(dbPath: string): void {
    try {
      if (this.db) {
        this.db.close();
      }
      
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new BetterSqlite3(dbPath);
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to set database path:', error);
      this.isConnected = false;
    }
  }

  public getConfigService(): DatabaseConfigService {
    return this.configService;
  }

  public async checkConnection(): Promise<boolean> {
    return await this.configService.checkConnection();
  }

  public isServerMode(): boolean {
    return this.configService.isServerMode();
  }

  public isClientMode(): boolean {
    return this.configService.isClientMode();
  }

  public isLocalMode(): boolean {
    return this.configService.isLocalMode();
  }

  public getConnectionStatus(): { isOnline: boolean; lastSync?: Date } {
    const config = this.configService.getConfig();
    return {
      isOnline: config?.isOnline || false,
      lastSync: config?.lastSync
    };
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
      
      // Safe migrations for columns that may not exist yet
      const ensureColumn = (table: string, column: string, type: string) => {
        const pragma = this.db.prepare(`PRAGMA table_info(${table})`).all();
        const exists = pragma.some((row: any) => row.name === column);
        if (!exists) {
          this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        }
      };

      // IT Assets additions
      ensureColumn('it_assets', 'remarque', 'TEXT');
      
      // Tasks email addition
      ensureColumn('tasks', 'assigned_user_email', 'VARCHAR(255)');
      ensureColumn('it_assets', 'poste_activite', 'TEXT');
      ensureColumn('it_assets', 'company', 'TEXT');
      ensureColumn('it_assets', 'warranty_expiry', 'DATE');
      ensureColumn('it_assets', 'purchase_date', 'DATE');
      ensureColumn('it_assets', 'ticket_number', 'VARCHAR(50)');
      ensureColumn('it_assets', 'notes', 'TEXT');
      ensureColumn('it_assets', 'device_name', 'VARCHAR(100)');
      ensureColumn('it_assets', 'location', 'VARCHAR(100)');
      ensureColumn('it_assets', 'assigned_to', 'VARCHAR(100)');
      ensureColumn('it_assets', 'hostname', 'VARCHAR(100)');
      ensureColumn('it_assets', 'ip_address', 'VARCHAR(15)');
      ensureColumn('it_assets', 'mac_address', 'VARCHAR(17)');
      // Accessory fields
      ensureColumn('it_assets', 'has_mouse', 'BOOLEAN');
      ensureColumn('it_assets', 'has_keyboard', 'BOOLEAN');
      ensureColumn('it_assets', 'has_screen', 'BOOLEAN');
      ensureColumn('it_assets', 'has_headphone', 'BOOLEAN');

      // Telecom Assets additions
      ensureColumn('telecom_assets', 'remarque', 'TEXT');
      ensureColumn('telecom_assets', 'poste_activite', 'TEXT');
      ensureColumn('telecom_assets', 'company', 'TEXT');
      ensureColumn('telecom_assets', 'phone_name', 'TEXT');
      ensureColumn('telecom_assets', 'ram_gb', 'INTEGER');
      ensureColumn('telecom_assets', 'imei', 'VARCHAR(20)');
      ensureColumn('telecom_assets', 'storage_gb', 'INTEGER');

      // Create default admin user if no users exist
      await this.createDefaultAdminUser();

      this.isConnected = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createDefaultAdminUser(): Promise<void> {
    try {
      // Check if any users exist
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
      
      if (userCount.count === 0) {
        // Create default admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        this.db.prepare(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, department, is_active, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
          'admin',
          'admin@itmanagement.com',
          hashedPassword,
          'Admin',
          'User',
          'IT',
          1,
          'admin'
        );
        
        console.log('Default admin user created:');
        console.log('Email: admin@itmanagement.com');
        console.log('Password: admin123');
      }
    } catch (error) {
      console.error('Failed to create default admin user:', error);
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
    const { username, email, password, role = 'user', firstName, lastName, department, isActive = true } = userData;
    
    // Hash the password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = this.run(
      'INSERT INTO users (username, email, password_hash, role, first_name, last_name, department, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [username, email, hashedPassword, role, firstName, lastName, department, isActive ? 1 : 0]
    );
    return { id: result.lastInsertRowid, ...userData };
  }

  public async updateUser(id: number, userData: any): Promise<any> {
    const { username, email, role, firstName, lastName, department, isActive, password } = userData;
    
    let updateFields = [];
    let updateValues = [];
    
    // Always update these fields
    updateFields.push('username = ?', 'email = ?', 'role = ?', 'first_name = ?', 'last_name = ?', 'department = ?', 'is_active = ?');
    updateValues.push(username, email, role, firstName, lastName, department, isActive ? 1 : 0);
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }
    
    updateValues.push(id);
    
    this.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    return { id, ...userData };
  }

  public async deleteUser(id: number): Promise<void> {
    try {
      // Temporarily disable foreign key constraints
      this.run('PRAGMA foreign_keys = OFF');
      
      // First, handle foreign key references by setting them to NULL or deleting related records
      // Set assigned users to NULL in devices
      this.run('UPDATE devices SET assigned_user_id = NULL WHERE assigned_user_id = ?', [id]);
      
      // Set manager to NULL in projects
      this.run('UPDATE projects SET manager_id = NULL WHERE manager_id = ?', [id]);
      
      // Set assigned users to NULL in tasks
      this.run('UPDATE tasks SET assigned_user_id = NULL WHERE assigned_user_id = ?', [id]);
      this.run('UPDATE tasks SET created_by_id = NULL WHERE created_by_id = ?', [id]);
      
      // Delete related records
      this.run('DELETE FROM task_comments WHERE user_id = ?', [id]);
      this.run('DELETE FROM permissions WHERE user_id = ?', [id]);
      this.run('DELETE FROM audit_logs WHERE user_id = ?', [id]);
      
      // Now delete the user
      this.run('DELETE FROM users WHERE id = ?', [id]);
      
      // Re-enable foreign key constraints
      this.run('PRAGMA foreign_keys = ON');
    } catch (error) {
      // Re-enable foreign key constraints even if there's an error
      this.run('PRAGMA foreign_keys = ON');
      throw error;
    }
  }

  // Device management
  public async getAllDevices(): Promise<any[]> {
    return this.all('SELECT * FROM devices ORDER BY id DESC');
  }

  public async getDeviceById(id: number): Promise<any> {
    return this.get('SELECT * FROM devices WHERE id = ?', [id]);
  }

  public async createDevice(deviceData: any): Promise<any> {
    // Accept both camelCase and snake_case inputs
    const name = deviceData.name;
    const device_type_id = deviceData.device_type_id ?? deviceData.deviceTypeId ?? deviceData.type;
    const status = deviceData.status ?? 'active';
    const location = deviceData.location ?? null;
    const specifications = deviceData.specifications ?? null;
    const assigned_user_id = deviceData.assigned_user_id ?? deviceData.assignedUserId ?? null;
    const serial_number = deviceData.serial_number ?? deviceData.serialNumber ?? null;
    const model = deviceData.model ?? null;
    const manufacturer = deviceData.manufacturer ?? null;
    const hostname = deviceData.hostname ?? null;
    const os_name = deviceData.os_name ?? deviceData.osName ?? null;
    const os_version = deviceData.os_version ?? deviceData.osVersion ?? null;
    const ram_gb = deviceData.ram_gb ?? deviceData.ramGb ?? null;
    const processor = deviceData.processor ?? null;
    const disk_space_gb = deviceData.disk_space_gb ?? deviceData.diskSpaceGb ?? null;
    const disk_used_gb = deviceData.disk_used_gb ?? deviceData.diskUsedGb ?? null;
    const last_seen = deviceData.last_seen ?? deviceData.lastSeen ?? null;
    const ip_address = deviceData.ip_address ?? deviceData.ipAddress ?? null;
    const mac_address = deviceData.mac_address ?? deviceData.macAddress ?? null;
    const installed_apps = deviceData.installed_apps ?? deviceData.installedApps ?? null;
    const system_info = deviceData.system_info ?? deviceData.systemInfo ?? null;
    const update_status = deviceData.update_status ?? deviceData.updateStatus ?? null;
    const antivirus_status = deviceData.antivirus_status ?? deviceData.antivirusStatus ?? null;

    const result = this.run(
      `INSERT INTO devices (
        name, device_type_id, serial_number, model, manufacturer, hostname,
        status, location, specifications, assigned_user_id,
        os_name, os_version, ram_gb, processor, disk_space_gb, disk_used_gb,
        last_seen, ip_address, mac_address, installed_apps, system_info,
        update_status, antivirus_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        name, device_type_id, serial_number, model, manufacturer, hostname,
        status, location, specifications, assigned_user_id,
        os_name, os_version, ram_gb, processor, disk_space_gb, disk_used_gb,
        last_seen, ip_address, mac_address, installed_apps, system_info,
        update_status, antivirus_status
      ]
    );
    return { id: result.lastInsertRowid, ...deviceData };
  }

  public async updateDevice(id: number, deviceData: any): Promise<any> {
    // Handle both old and new field names for compatibility
    const { 
      name, 
      type, 
      device_type_id, 
      status, 
      location, 
      specifications, 
      assigned_to, 
      assigned_user_id,
      osName,
      osVersion,
      ramGb,
      processor,
      diskSpaceGb,
      diskUsedGb,
      lastSeen,
      ipAddress,
      macAddress,
      hostname,
      manufacturer,
      model,
      serialNumber,
      installedApps,
      systemInfo,
      updateStatus,
      antivirusStatus
    } = deviceData;
    
    // Use device_type_id if provided, otherwise use type
    const deviceTypeId = device_type_id || type;
    const assignedUserId = assigned_user_id || assigned_to;
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (deviceTypeId !== undefined) { updateFields.push('device_type_id = ?'); updateValues.push(deviceTypeId); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
    if (specifications !== undefined) { updateFields.push('specifications = ?'); updateValues.push(specifications); }
    if (assignedUserId !== undefined) { updateFields.push('assigned_user_id = ?'); updateValues.push(assignedUserId); }
    if (osName !== undefined) { updateFields.push('os_name = ?'); updateValues.push(osName); }
    if (osVersion !== undefined) { updateFields.push('os_version = ?'); updateValues.push(osVersion); }
    if (ramGb !== undefined) { updateFields.push('ram_gb = ?'); updateValues.push(ramGb); }
    if (processor !== undefined) { updateFields.push('processor = ?'); updateValues.push(processor); }
    if (diskSpaceGb !== undefined) { updateFields.push('disk_space_gb = ?'); updateValues.push(diskSpaceGb); }
    if (diskUsedGb !== undefined) { updateFields.push('disk_used_gb = ?'); updateValues.push(diskUsedGb); }
    if (lastSeen !== undefined) { updateFields.push('last_seen = ?'); updateValues.push(lastSeen); }
    if (ipAddress !== undefined) { updateFields.push('ip_address = ?'); updateValues.push(ipAddress); }
    if (macAddress !== undefined) { updateFields.push('mac_address = ?'); updateValues.push(macAddress); }
    if (hostname !== undefined) { updateFields.push('hostname = ?'); updateValues.push(hostname); }
    if (manufacturer !== undefined) { updateFields.push('manufacturer = ?'); updateValues.push(manufacturer); }
    if (model !== undefined) { updateFields.push('model = ?'); updateValues.push(model); }
    if (serialNumber !== undefined) { updateFields.push('serial_number = ?'); updateValues.push(serialNumber); }
    if (installedApps !== undefined) { updateFields.push('installed_apps = ?'); updateValues.push(installedApps); }
    if (systemInfo !== undefined) { updateFields.push('system_info = ?'); updateValues.push(systemInfo); }
    if (updateStatus !== undefined) { updateFields.push('update_status = ?'); updateValues.push(updateStatus); }
    if (antivirusStatus !== undefined) { updateFields.push('antivirus_status = ?'); updateValues.push(antivirusStatus); }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      const sql = `UPDATE devices SET ${updateFields.join(', ')} WHERE id = ?`;
      this.run(sql, updateValues);
    }
    
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
    const { 
      device_type, owner_name, department, zone, serial_number, model, brand, date, 
      ram_gb, disk_gb, processor, os, peripheral_type, connection_type, status, 
      remarque, poste_activite, company, warranty_expiry, purchase_date, ticket_number, 
      notes, device_name, location, assigned_to, hostname, ip_address, mac_address,
      has_mouse, has_keyboard, has_screen, has_headphone
    } = assetData;
    
    const result = this.run(
      `INSERT INTO it_assets (
        device_type, owner_name, department, zone, serial_number, model, brand, date, 
        ram_gb, disk_gb, processor, os, peripheral_type, connection_type, status, 
        remarque, poste_activite, company, warranty_expiry, purchase_date, ticket_number, 
        notes, device_name, location, assigned_to, hostname, ip_address, mac_address,
        has_mouse, has_keyboard, has_screen, has_headphone, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        device_type, owner_name, department, zone, serial_number, model, brand, date, 
        ram_gb, disk_gb, processor, os, peripheral_type, connection_type, status, 
        remarque, poste_activite, company, warranty_expiry, purchase_date, ticket_number, 
        notes, device_name, location, assigned_to, hostname, ip_address, mac_address,
        has_mouse ? 1 : 0, has_keyboard ? 1 : 0, has_screen ? 1 : 0, has_headphone ? 1 : 0
      ]
    );
    return { id: result.lastInsertRowid, ...assetData };
  }

  public async updateITAsset(id: number, assetData: any): Promise<any> {
    const { 
      device_type, owner_name, department, zone, serial_number, model, brand, date, 
      ram_gb, disk_gb, processor, os, peripheral_type, connection_type, status, 
      remarque, poste_activite, company, warranty_expiry, purchase_date, ticket_number, 
      notes, device_name, location, assigned_to, hostname, ip_address, mac_address,
      has_mouse, has_keyboard, has_screen, has_headphone
    } = assetData;

    // Build dynamic update to avoid overwriting with undefined
    const fields: string[] = [];
    const values: any[] = [];
    const push = (cond: any, clause: string, value: any) => { if (cond !== undefined) { fields.push(clause); values.push(value); } };

    push(device_type, 'device_type = ?', device_type);
    push(owner_name, 'owner_name = ?', owner_name);
    push(department, 'department = ?', department);
    push(zone, 'zone = ?', zone);
    push(serial_number, 'serial_number = ?', serial_number);
    push(model, 'model = ?', model);
    push(brand, 'brand = ?', brand);
    push(date, 'date = ?', date);
    push(ram_gb, 'ram_gb = ?', ram_gb);
    push(disk_gb, 'disk_gb = ?', disk_gb);
    push(processor, 'processor = ?', processor);
    push(os, 'os = ?', os);
    push(peripheral_type, 'peripheral_type = ?', peripheral_type);
    push(connection_type, 'connection_type = ?', connection_type);
    push(status, 'status = ?', status);
    push(remarque, 'remarque = ?', remarque);
    push(poste_activite, 'poste_activite = ?', poste_activite);
    push(company, 'company = ?', company);
    push(warranty_expiry, 'warranty_expiry = ?', warranty_expiry);
    push(purchase_date, 'purchase_date = ?', purchase_date);
    push(ticket_number, 'ticket_number = ?', ticket_number);
    push(notes, 'notes = ?', notes);
    push(device_name, 'device_name = ?', device_name);
    push(location, 'location = ?', location);
    push(assigned_to, 'assigned_to = ?', assigned_to);
    push(hostname, 'hostname = ?', hostname);
    push(ip_address, 'ip_address = ?', ip_address);
    push(mac_address, 'mac_address = ?', mac_address);
    push(has_mouse, 'has_mouse = ?', has_mouse ? 1 : 0);
    push(has_keyboard, 'has_keyboard = ?', has_keyboard ? 1 : 0);
    push(has_screen, 'has_screen = ?', has_screen ? 1 : 0);
    push(has_headphone, 'has_headphone = ?', has_headphone ? 1 : 0);

    if (fields.length > 0) {
      values.push(id);
      const sql = `UPDATE it_assets SET ${fields.join(', ')} WHERE id = ?`;
      this.run(sql, values);
    }
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
    const { provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, remarque, poste_activite, company, phone_name, ram_gb, imei, storage_gb } = assetData;
    const result = this.run(
      'INSERT INTO telecom_assets (provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, remarque, poste_activite, company, phone_name, ram_gb, imei, storage_gb, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, remarque, poste_activite, company, phone_name, ram_gb, imei, storage_gb]
    );
    return { id: result.lastInsertRowid, ...assetData };
  }

  public async updateTelecomAsset(id: number, assetData: any): Promise<any> {
    const { provider, sim_number, sim_owner, subscription_type, date, zone, department, data_plan, pin_code, puk_code, status, remarque, poste_activite, company, phone_name, ram_gb, imei, storage_gb } = assetData;

    const fields: string[] = [];
    const values: any[] = [];
    const push = (cond: any, clause: string, value: any) => { if (cond !== undefined) { fields.push(clause); values.push(value); } };

    push(provider, 'provider = ?', provider);
    push(sim_number, 'sim_number = ?', sim_number);
    push(sim_owner, 'sim_owner = ?', sim_owner);
    push(subscription_type, 'subscription_type = ?', subscription_type);
    push(date, 'date = ?', date);
    push(zone, 'zone = ?', zone);
    push(department, 'department = ?', department);
    push(data_plan, 'data_plan = ?', data_plan);
    push(pin_code, 'pin_code = ?', pin_code);
    push(puk_code, 'puk_code = ?', puk_code);
    push(status, 'status = ?', status);
    push(remarque, 'remarque = ?', remarque);
    push(poste_activite, 'poste_activite = ?', poste_activite);
    push(company, 'company = ?', company);
    push(phone_name, 'phone_name = ?', phone_name);
    push(ram_gb, 'ram_gb = ?', ram_gb);
    push(imei, 'imei = ?', imei);
    push(storage_gb, 'storage_gb = ?', storage_gb);

    if (fields.length > 0) {
      values.push(id);
      const sql = `UPDATE telecom_assets SET ${fields.join(', ')} WHERE id = ?`;
      this.run(sql, values);
    }
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
    // In schema, projects refer to manager via manager_id
    return this.all('SELECT * FROM projects WHERE manager_id = ? ORDER BY id DESC', [userId]);
  }

  public async createProject(projectData: any): Promise<any> {
    const { name, description, status, priority = 'medium', start_date, end_date, budget = 0, manager_id } = projectData;
    const result = this.run(
      'INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, manager_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [name, description, status, priority, start_date, end_date, budget, manager_id]
    );
    return { id: result.lastInsertRowid, ...projectData };
  }

  public async updateProject(id: number, projectData: any): Promise<any> {
    const { name, description, status, priority, start_date, end_date, budget, manager_id } = projectData;
    const fields: string[] = [];
    const values: any[] = [];
    const push = (cond: any, clause: string, value: any) => { if (cond !== undefined) { fields.push(clause); values.push(value); } };
    push(name, 'name = ?', name);
    push(description, 'description = ?', description);
    push(status, 'status = ?', status);
    push(priority, 'priority = ?', priority);
    push(start_date, 'start_date = ?', start_date);
    push(end_date, 'end_date = ?', end_date);
    push(budget, 'budget = ?', budget);
    push(manager_id, 'manager_id = ?', manager_id);
    if (fields.length > 0) {
      values.push(id);
      this.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return { id, ...projectData };
  }

  public async deleteProject(id: number): Promise<void> {
    this.run('DELETE FROM projects WHERE id = ?', [id]);
  }

  // Task management
  public async getAllTasks(): Promise<any[]> {
    return this.all(`
      SELECT 
        t.*,
        p.name as project_name,
        u1.username as assigned_user_name,
        u1.email as assigned_user_email,
        u2.username as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.assigned_user_id = u1.id
      LEFT JOIN users u2 ON t.created_by_id = u2.id
      ORDER BY t.id DESC
    `);
  }

  public async getTasksByUserId(userId: number): Promise<any[]> {
    return this.all(`
      SELECT 
        t.*,
        p.name as project_name,
        u1.username as assigned_user_name,
        u1.email as assigned_user_email,
        u2.username as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.assigned_user_id = u1.id
      LEFT JOIN users u2 ON t.created_by_id = u2.id
      WHERE t.assigned_user_id = ?
      ORDER BY t.id DESC
    `, [userId]);
  }

  public async createTask(taskData: any): Promise<any> {
    const { title, description, status = 'todo', priority = 'medium', project_id, assigned_user_id, assigned_user_email, created_by_id, due_date, estimated_hours = 0, actual_hours = 0, progress_percentage = 0 } = taskData;
    const result = this.run(
      'INSERT INTO tasks (title, description, status, priority, project_id, assigned_user_id, assigned_user_email, created_by_id, due_date, estimated_hours, actual_hours, progress_percentage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [title, description, status, priority, project_id, assigned_user_id, assigned_user_email, created_by_id, due_date, estimated_hours, actual_hours, progress_percentage]
    );
    return { id: result.lastInsertRowid, ...taskData };
  }

  public async updateTask(id: number, taskData: any): Promise<any> {
    const { title, description, status, priority, project_id, assigned_user_id, assigned_user_email, created_by_id, due_date, estimated_hours, actual_hours, progress_percentage } = taskData;
    const fields: string[] = [];
    const values: any[] = [];
    const push = (cond: any, clause: string, value: any) => { if (cond !== undefined) { fields.push(clause); values.push(value); } };
    push(title, 'title = ?', title);
    push(description, 'description = ?', description);
    push(status, 'status = ?', status);
    push(priority, 'priority = ?', priority);
    push(project_id, 'project_id = ?', project_id);
    push(assigned_user_id, 'assigned_user_id = ?', assigned_user_id);
    push(assigned_user_email, 'assigned_user_email = ?', assigned_user_email);
    push(created_by_id, 'created_by_id = ?', created_by_id);
    push(due_date, 'due_date = ?', due_date);
    push(estimated_hours, 'estimated_hours = ?', estimated_hours);
    push(actual_hours, 'actual_hours = ?', actual_hours);
    push(progress_percentage, 'progress_percentage = ?', progress_percentage);
    if (fields.length > 0) {
      values.push(id);
      this.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return { id, ...taskData };
  }

  public async deleteTask(id: number): Promise<void> {
    this.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // System monitoring
  public async getSystemMonitoringData(deviceId: number, hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return this.all(
      'SELECT * FROM system_monitoring WHERE device_id = ? AND recorded_at > ? ORDER BY recorded_at DESC',
      [deviceId, since]
    );
  }

  // Audit logging
  public async addAuditLog(auditData: any): Promise<void> {
    const { userId, user_id, action, resourceType, resource_type, resourceId, resource_id, oldValues, old_values, newValues, new_values, ipAddress, ip_address, userAgent, user_agent } = auditData;
    this.run(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [userId || user_id, action, resourceType || resource_type, resourceId || resource_id, oldValues || old_values, newValues || new_values, ipAddress || ip_address, userAgent || user_agent]
    );
  }

  // Permissions
  public async getUserPermissions(userId: number): Promise<string[]> {
    const rows = this.all('SELECT permission_type, granted FROM permissions WHERE user_id = ?', [userId]);
    return rows.filter((r: any) => r.granted === 1).map((r: any) => r.permission_type);
  }

  public async setUserPermission(userId: number, permissionType: string, granted: boolean): Promise<void> {
    // Upsert
    const existing = this.get('SELECT id FROM permissions WHERE user_id = ? AND permission_type = ?', [userId, permissionType]);
    if (existing && existing.id) {
      this.run('UPDATE permissions SET granted = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [granted ? 1 : 0, existing.id]);
    } else {
      this.run('INSERT INTO permissions (user_id, permission_type, granted, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [userId, permissionType, granted ? 1 : 0]);
    }
  }

  public async getAllUsersWithPermissions(): Promise<any[]> {
    // Return users with aggregated permissions list
    const users = this.all('SELECT id, username, first_name, last_name, email, role FROM users ORDER BY id ASC');
    return users.map((u: any) => {
      const perms = this.all('SELECT permission_type, granted FROM permissions WHERE user_id = ?', [u.id])
        .filter((r: any) => r.granted === 1)
        .map((r: any) => r.permission_type);
      return { ...u, permissions: perms };
    });
  }

  // Import/Export methods
  public async importITAssets(filePath: string, format: string): Promise<any> {
    // Simple implementation - in real app you'd handle CSV/Excel parsing
    // For now, return success without actual import
    return { success: true, imported: 0 };
  }

  public async importTelecomAssets(filePath: string, format: string): Promise<any> {
    // Simple implementation - in real app you'd handle CSV/Excel parsing
    // For now, return success without actual import
    return { success: true, imported: 0 };
  }

  // Additional methods needed by services
  public async getUserByEmail(email: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  public async getUserByUsername(username: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  public async getUserById(id: number): Promise<any> {
    return this.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  public async logAIAction(actionData: any): Promise<void> {
    // Align with ai_agent_logs schema: action_type, description, user_id, device_id, task_id, project_id, ai_response
    const { user_id, action_type, description, device_id, task_id, project_id, ai_response } = actionData;
    this.run(
      'INSERT INTO ai_agent_logs (action_type, description, user_id, device_id, task_id, project_id, ai_response, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [action_type || 'action', description || '', user_id || null, device_id || null, task_id || null, project_id || null, ai_response || null]
    );
  }

  public async addSystemMonitoringData(deviceId: number, data: any): Promise<void> {
    const { cpu_usage, memory_usage, disk_usage, network_usage, temperature } = data;
    // Convert network_usage to network_in and network_out, or use 0 if not provided
    const network_in = network_usage || 0;
    const network_out = network_usage || 0;
    this.run(
      'INSERT INTO system_monitoring (device_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, temperature, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [deviceId, cpu_usage, memory_usage, disk_usage, network_in, network_out, temperature]
    );
  }

  public async exportITAssets(format: string): Promise<any> {
    // Simple implementation - return all IT assets
    return this.all('SELECT * FROM it_assets');
  }

  public async exportTelecomAssets(format: string): Promise<any> {
    // Simple implementation - return all telecom assets
    return this.all('SELECT * FROM telecom_assets');
  }

  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

export const database = new Database();
