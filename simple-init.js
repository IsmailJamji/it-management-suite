const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

console.log('Starting simple database initialization...');

const dbPath = path.join(__dirname, 'it_management.db');
const db = new sqlite3.Database(dbPath);

console.log('Database connection established');

// Create users table with corrected syntax
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  } else {
    console.log('✓ Users table created');
  }
});

// Create device_types table
db.run(`
CREATE TABLE IF NOT EXISTS device_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
)
`, (err) => {
  if (err) {
    console.error('Error creating device_types table:', err);
  } else {
    console.log('✓ Device types table created');
  }
});

// Insert default device types
db.run(`
INSERT OR IGNORE INTO device_types (name, description) VALUES 
('laptop', 'Portable computer device'),
('desktop', 'Desktop computer'),
('printer', 'Printing device'),
('phone', 'Mobile phone'),
('tablet', 'Tablet device'),
('server', 'Server machine'),
('network_device', 'Router, switch, or other network equipment'),
('monitor', 'Display monitor'),
('keyboard', 'Input keyboard'),
('mouse', 'Input mouse')
`, (err) => {
  if (err) {
    console.error('Error inserting device types:', err);
  } else {
    console.log('✓ Default device types inserted');
  }
});

// Create devices table
db.run(`
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    device_type_id INTEGER,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance', 'retired')),
    assigned_user_id INTEGER,
    location VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    ram_gb INTEGER,
    processor VARCHAR(100),
    disk_space_gb INTEGER,
    disk_used_gb INTEGER,
    last_seen DATETIME,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    antivirus_status VARCHAR(50),
    update_status VARCHAR(50),
    installed_apps TEXT,
    system_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_type_id) REFERENCES device_types(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating devices table:', err);
  } else {
    console.log('✓ Devices table created');
  }
});

// Create projects table
db.run(`
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    manager_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating projects table:', err);
  } else {
    console.log('✓ Projects table created');
  }
});

// Create tasks table
db.run(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    project_id INTEGER,
    assigned_user_id INTEGER,
    created_by_id INTEGER,
    due_date DATETIME,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating tasks table:', err);
  } else {
    console.log('✓ Tasks table created');
  }
});

// Create other tables...
db.run(`
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating task_comments table:', err);
  } else {
    console.log('✓ Task comments table created');
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS ai_agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    user_id INTEGER,
    device_id INTEGER,
    task_id INTEGER,
    project_id INTEGER,
    ai_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating ai_agent_logs table:', err);
  } else {
    console.log('✓ AI agent logs table created');
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS system_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_in DECIMAL(10,2),
    network_out DECIMAL(10,2),
    temperature DECIMAL(5,2),
    uptime_seconds INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating system_monitoring table:', err);
  } else {
    console.log('✓ System monitoring table created');
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    granted BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating permissions table:', err);
  } else {
    console.log('✓ Permissions table created');
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
`, (err) => {
  if (err) {
    console.error('Error creating audit_logs table:', err);
  } else {
    console.log('✓ Audit logs table created');
  }
});

// Create indexes
db.run(`CREATE INDEX IF NOT EXISTS idx_devices_assigned_user ON devices(assigned_user_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_system_monitoring_device ON system_monitoring(device_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

db.run(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)`, (err) => {
  if (err) console.error('Error creating index:', err);
});

// Create default admin user
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hashedPassword => {
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password_hash, role, first_name, last_name, department, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['admin', 'admin@company.com', hashedPassword, 'admin', 'System', 'Administrator', 'IT', 1], (err) => {
    if (err) {
      console.error('Error creating admin user:', err);
    } else {
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    }
    
    // Close database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('✓ Database closed successfully');
        console.log('Database initialization completed!');
      }
    });
  });
}).catch(err => {
  console.error('Error hashing password:', err);
});
