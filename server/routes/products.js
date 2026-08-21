const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { dbRun, dbGet, dbAll } = require('../utils/db');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await dbAll(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await dbGet(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create product (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category_id, stock, discount_percent, image_url } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const result = await dbRun(
      `INSERT INTO products (name, description, price, category_id, stock, discount_percent, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', price, category_id, stock || 0, discount_percent || 0, image_url || '']
    );

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update product (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, price, category_id, stock, discount_percent, image_url } = req.body;

    const existingProduct = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await dbRun(
      `UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ?, discount_percent = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || existingProduct.name, description !== undefined ? description : existingProduct.description, price || existingProduct.price, category_id || existingProduct.category_id, stock !== undefined ? stock : existingProduct.stock, discount_percent !== undefined ? discount_percent : existingProduct.discount_percent, image_url || existingProduct.image_url, req.params.id]
    );

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product image if exists
    if (product.image_url && product.image_url.includes('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', product.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;