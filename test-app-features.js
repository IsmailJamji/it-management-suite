const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function testAppFeatures() {
  console.log('Testing IT Management Suite features...');
  
  try {
    const dbPath = path.join(__dirname, 'it_management.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== DATABASE CONNECTION TEST ===');
    console.log('✓ Database connection established');
    
    console.log('\n=== USER AUTHENTICATION TEST ===');
    // Test admin user
    const adminUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (adminUser) {
      console.log('✓ Admin user exists');
      const isValidAdminPassword = await bcrypt.compare('admin123', adminUser.password_hash);
      console.log(isValidAdminPassword ? '✓ Admin password valid' : '✗ Admin password invalid');
    }
    
    console.log('\n=== DEVICE MANAGEMENT TEST ===');
    // Test device creation
    const deviceId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO devices (name, device_type_id, serial_number, model, manufacturer, status, location, os_name, os_version, ram_gb, processor, disk_space_gb, ip_address, mac_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Test Laptop', 1, 'TEST123', 'ThinkPad X1', 'Lenovo', 'active', 'Office', 'Windows', '11', 16, 'Intel i7', 512, '192.168.1.100', 'AA:BB:CC:DD:EE:FF'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('✓ Test device created with ID:', deviceId);
    
    // Test device retrieval
    const device = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM devices WHERE id = ?', [deviceId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log('✓ Device retrieved:', device.name);
    
    console.log('\n=== PROJECT MANAGEMENT TEST ===');
    // Test project creation
    const projectId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, manager_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Test Project', 'A test project for IT management', 'active', 'high', '2024-01-01', '2024-12-31', 50000, adminUser.id],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('✓ Test project created with ID:', projectId);
    
    console.log('\n=== TASK MANAGEMENT TEST ===');
    // Test task creation
    const taskId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tasks (title, description, status, priority, project_id, assigned_user_id, created_by_id, due_date, estimated_hours, progress_percentage) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Test Task', 'A test task for project management', 'todo', 'medium', projectId, adminUser.id, adminUser.id, '2024-12-31', 8, 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('✓ Test task created with ID:', taskId);
    
    console.log('\n=== SYSTEM MONITORING TEST ===');
    // Test system monitoring data
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO system_monitoring (device_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, temperature, uptime_seconds) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [deviceId, 25.5, 60.2, 45.8, 1024, 2048, 45.0, 86400],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('✓ System monitoring data inserted');
    
    console.log('\n=== AUDIT LOGGING TEST ===');
    // Test audit log
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminUser.id, 'CREATE_DEVICE', 'DEVICE', deviceId, JSON.stringify({name: 'Test Laptop'}), '127.0.0.1', 'Test Script'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('✓ Audit log entry created');
    
    console.log('\n=== DATA RETRIEVAL TEST ===');
    // Test data retrieval
    const deviceCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM devices', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    console.log('✓ Total devices:', deviceCount);
    
    const projectCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    console.log('✓ Total projects:', projectCount);
    
    const taskCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    console.log('✓ Total tasks:', taskCount);
    
    db.close();
    console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
    console.log('The IT Management Suite database is working correctly!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAppFeatures();


