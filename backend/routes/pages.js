const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getAllPages,
  getPageById,
  savePage,
  deletePage
} = require('../utils/pageUtil');

// GET /api/pages - list all pages
router.get('/', async (req, res) => {
  const pages = await getAllPages();
  res.json(pages);
});

// GET /api/pages/:id - get single page
router.get('/:id', async (req, res) => {
  const page = await getPageById(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

// POST /api/pages - create a new page
router.post('/', async (req, res) => {
  const { title = 'Untitled', parentId = null } = req.body;
  const newPage = await savePage(null, title, '', parentId);
  res.status(201).json(newPage);
});

// PUT /api/pages/:id - update page title/content
router.put('/:id', async (req, res) => {
  const { title, content, parentId } = req.body;
  const updated = await savePage(req.params.id, title, content, parentId);
  res.json(updated);
});

// DELETE /api/pages/:id - delete page
router.delete('/:id', async (req, res) => {
  await deletePage(req.params.id);
  res.json({ success: true });
});

module.exports = router;