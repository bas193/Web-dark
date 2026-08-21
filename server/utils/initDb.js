const { dbRun, dbGet } = require('./db');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    // Create tables
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        category_id INTEGER NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists
    const adminExists = await dbGet('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      // Hash password: admin123
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await dbRun(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin@webdark.local']
      );
      console.log('✓ Admin user created (username: admin, password: admin123)');
    }

    // Initialize default settings if they don't exist
    const settings = [
      { key: 'store_name', value: 'Web Dark Store' },
      { key: 'store_logo', value: '/uploads/default-logo.png' },
      { key: 'store_banner', value: '/uploads/default-banner.png' },
      { key: 'store_description', value: 'Toko online modern dengan sistem admin panel yang lengkap' },
      { key: 'theme_color_primary', value: '#1f2937' },
      { key: 'theme_color_secondary', value: '#3b82f6' },
      { key: 'currency_symbol', value: 'Rp' },
      { key: 'phone_number', value: '+62-xxx-xxx-xxx' },
      { key: 'email_address', value: 'info@webdark.local' },
      { key: 'address', value: 'Jalan Utama No. 1, Indonesia' }
    ];

    for (const setting of settings) {
      const exists = await dbGet('SELECT * FROM settings WHERE setting_key = ?', [setting.key]);
      if (!exists) {
        await dbRun(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }
    }

    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('✗ Database initialization error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;