const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

let dbConnection;

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // Temporary connection (no database) to ensure DB exists
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log('Database created or already exists');
    await tempConnection.end();

    // Connect to the main database
    dbConnection = await mysql.createConnection(dbConfig);

    // Create tables
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role ENUM('admin', 'seller', 'customer', 'investor', 'affiliate') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Sellers table
      CREATE TABLE IF NOT EXISTS sellers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        business_address TEXT,
        id_number VARCHAR(100),
        bank_account VARCHAR(100),
        business_image VARCHAR(255),
        id_image VARCHAR(255),
        bank_proof_image VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Affiliates table
      CREATE TABLE IF NOT EXISTS affiliates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        website_url VARCHAR(255),
        affiliate_type VARCHAR(100),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        agreed_to_terms BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Investors table
      CREATE TABLE IF NOT EXISTS investors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bank_proof_image VARCHAR(255),
        agreed_to_terms BOOLEAN DEFAULT FALSE,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Password reset tokens table
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        stock_qty INT NOT NULL DEFAULT 0,
        images JSON,
        status ENUM('active', 'out_of_stock', 'violation', 'deleted') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Product reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product_review (user_id, product_id)
      );

      -- Favorites table
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_method ENUM('cash_on_delivery', 'card', 'bank_transfer') DEFAULT 'cash_on_delivery',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `;

    await dbConnection.query(createTablesSQL);
    console.log('Tables created successfully');

    // Add 'rejected' status to existing orders table if not present
    try {
      await dbConnection.query(`
        ALTER TABLE orders 
        MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected') DEFAULT 'pending'
      `);
      console.log('Orders table updated with rejected status');
    } catch (alterError) {
      console.log('Orders table already has rejected status or alter failed:', alterError.message);
    }

    // ✅ Safely create indexes only if they don't exist
    const indexes = [
      { name: 'idx_favorites_user_id', column: 'user_id', table: 'favorites' },
      { name: 'idx_favorites_product_id', column: 'product_id', table: 'favorites' },
      { name: 'idx_favorites_created_at', column: 'created_at', table: 'favorites' },
      { name: 'idx_orders_user_id', column: 'user_id', table: 'orders' },
      { name: 'idx_orders_status', column: 'status', table: 'orders' },
      { name: 'idx_orders_created_at', column: 'created_at', table: 'orders' },
      { name: 'idx_order_items_order_id', column: 'order_id', table: 'order_items' },
      { name: 'idx_order_items_product_id', column: 'product_id', table: 'order_items' },
      { name: 'idx_reviews_product_id', column: 'product_id', table: 'reviews' },
      { name: 'idx_reviews_user_id', column: 'user_id', table: 'reviews' },
      { name: 'idx_reviews_rating', column: 'rating', table: 'reviews' },
      { name: 'idx_reviews_created_at', column: 'created_at', table: 'reviews' }
    ];

    for (const idx of indexes) {
      const [rows] = await dbConnection.query(
        `SELECT COUNT(1) as count
         FROM information_schema.statistics
         WHERE table_schema = DATABASE()
         AND table_name = ?
         AND index_name = ?`,
        [idx.table, idx.name]
      );

      if (rows[0].count === 0) {
        await dbConnection.query(
          `CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`
        );
        console.log(`Created index: ${idx.name} on ${idx.table}`);
      }
    }

    // ✅ Admin user creation / update
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@digimart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SuperAdmin123!';
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [adminExists] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM users WHERE email = ? AND role = "admin"',
      [adminEmail]
    );

    if (adminExists[0].count === 0) {
      await dbConnection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Admin user created successfully');
    } else {
      await dbConnection.execute(
        'UPDATE users SET password = ? WHERE email = ? AND role = "admin"',
        [hashedPassword, adminEmail]
      );
      console.log('Admin user password updated');
    }

    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);

    return dbConnection;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Return active DB connection
const getDB = () => {
  if (!dbConnection) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dbConnection;
};

module.exports = { initializeDatabase, getDB, dbConfig };
