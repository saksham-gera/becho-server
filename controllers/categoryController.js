import pool from '../db.js';

export const getCategories = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories', error: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'ID is required' });
    try {
        const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving category', error: error.message });
    }
};

export const addCategory = async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    try {
        const { rows } = await pool.query('INSERT INTO categories (title) VALUES ($1) RETURNING *', [title]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding category', error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'ID is required' });
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    const { id, title } = req.body;
    if (!id || !title) return res.status(400).json({ message: 'ID and Title are required' });
    try {
        const { rows } = await pool.query(
            'UPDATE categories SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [title, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};