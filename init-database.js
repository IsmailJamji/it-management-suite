const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    console.log('Starting database initialization...');
    // Create database connection
    const dbPath = path.join(__dirname, 'it_management.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('✓ Database connection established');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'electron', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (const statement of statements) {
      await new Promise((resolve, reject) => {
        db.run(statement, (err) => {
          if (err) {
            console.error('✗ SQL statement failed:', err.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('✓ All SQL statements executed successfully');
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO users (username, email, password_hash, role, first_name, last_name, department, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@company.com', adminPassword, 'admin', 'System', 'Administrator', 'IT', 1],
        function(err) {
          if (err) {
            console.error('✗ Admin user creation failed:', err);
            reject(err);
          } else {
            console.log('✓ Default admin user created (username: admin, password: admin123)');
            resolve();
          }
        }
      );
    });
    
    // Close database
    db.close((err) => {
      if (err) {
        console.error('✗ Database close failed:', err);
      } else {
        console.log('✓ Database closed successfully');
        console.log('Database initialization completed!');
      }
    });
    
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
  }
}

initializeDatabase();
