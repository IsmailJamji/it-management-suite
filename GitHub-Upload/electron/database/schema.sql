-- IT Management Suite Database Schema

-- Users table for authentication and role management
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
);

-- Device types enumeration
CREATE TABLE IF NOT EXISTS device_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Insert default device types
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
('mouse', 'Input mouse');

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    device_type_id INTEGER,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    hostname VARCHAR(100),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance', 'retired')),
    assigned_user_id INTEGER,
    location VARCHAR(100),
    specifications TEXT,
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
    installed_apps TEXT, -- JSON string of installed applications
    system_info TEXT, -- JSON string of additional system information
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_type_id) REFERENCES device_types(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

-- Projects table
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
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    project_id INTEGER,
    assigned_user_id INTEGER,
    assigned_user_email VARCHAR(255),
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
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI Agent logs table
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
);

-- System monitoring data
CREATE TABLE IF NOT EXISTS system_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_in DECIMAL(10,2),
    network_out DECIMAL(10,2),
    network_usage DECIMAL(10,2),
    temperature DECIMAL(5,2),
    uptime_seconds INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    granted BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit logs table
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
);

-- IT Assets table
CREATE TABLE IF NOT EXISTS it_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_type TEXT NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    -- Computer-specific fields
    ram_gb INTEGER,
    disk_gb INTEGER,
    processor VARCHAR(100),
    os VARCHAR(100),
    -- Peripheral fields
    peripheral_type VARCHAR(50),
    connection_type VARCHAR(50),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance', 'retired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Telecom Assets table
CREATE TABLE IF NOT EXISTS telecom_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL CHECK(provider IN ('IAM', 'INWI', 'ORANGE')),
    sim_number VARCHAR(20) UNIQUE NOT NULL,
    sim_owner VARCHAR(100) NOT NULL,
    subscription_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    zone VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    data_plan VARCHAR(50),
    pin_code VARCHAR(10),
    puk_code VARCHAR(10),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_assigned_user ON devices(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_system_monitoring_device ON system_monitoring(device_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_it_assets_owner ON it_assets(owner_name);
CREATE INDEX IF NOT EXISTS idx_it_assets_department ON it_assets(department);
CREATE INDEX IF NOT EXISTS idx_it_assets_status ON it_assets(status);
CREATE INDEX IF NOT EXISTS idx_it_assets_created_at ON it_assets(created_at);
CREATE INDEX IF NOT EXISTS idx_telecom_assets_provider ON telecom_assets(provider);
CREATE INDEX IF NOT EXISTS idx_telecom_assets_owner ON telecom_assets(sim_owner);
CREATE INDEX IF NOT EXISTS idx_telecom_assets_status ON telecom_assets(status);
CREATE INDEX IF NOT EXISTS idx_telecom_assets_created_at ON telecom_assets(created_at);
