// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['id', 'ASC']] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nama & email wajib diisi' });

  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email sudah digunakan' });

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    // optional: check email uniqueness if changed
    if (email && email !== user.email) {
      const other = await User.findOne({ where: { email } });
      if (other) return res.status(409).json({ error: 'Email sudah digunakan' });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    await user.destroy();
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
