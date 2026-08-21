const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { dbRun, dbGet, dbAll } = require('../utils/db');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../public/uploads');

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await dbRun(
      'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description || '', image_url || '']
    );

    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [result.id]);
    res.status(201).json(category);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await dbRun(
      'UPDATE categories SET name = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || category.name, description !== undefined ? description : category.description, image_url || category.image_url, req.params.id]
    );

    const updated = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete category image if exists
    if (category.image_url && category.image_url.includes('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', category.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Check if category has products
    const productCount = await dbGet('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
    if (productCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products' });
    }

    await dbRun('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;