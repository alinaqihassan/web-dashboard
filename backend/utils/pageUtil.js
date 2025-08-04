const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const VAULT_DIR = path.join(__dirname, '..', '..', 'data', 'pages');
const META_FILE = path.join(VAULT_DIR, 'metadata.json');

async function readMetadata() {
  try {
    const data = await fs.readFile(META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {}; // if file missing
  }
}

async function writeMetadata(meta) {
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2));
}

function getFilePath(id) {
  return path.join(VAULT_DIR, `${id}.md`);
}

async function getAllPages() {
  const meta = await readMetadata();
  const pages = [];

  for (const [id, info] of Object.entries(meta)) {
    const filePath = getFilePath(id);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      pages.push({ id, title: info.title, parentId: info.parentId, content });
    } catch (err) {
      console.warn(`Missing file for ${id}`);
    }
  }

  return pages;
}

async function getPageById(id) {
  const meta = await readMetadata();
  const filePath = getFilePath(id);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { id, title: meta[id]?.title || 'Untitled', parentId: meta[id]?.parentId || null, content };
  } catch {
    return null;
  }
}

async function savePage(id, title, content, parentId = null) {
  const meta = await readMetadata();
  if (!id) {
    id = crypto.randomUUID();
  }

  const filePath = getFilePath(id);
  const finalContent = content || `# ${title}`;
  await fs.writeFile(filePath, finalContent);

  meta[id] = {
    title: title || meta[id]?.title || 'Untitled',
    parentId: parentId !== undefined ? parentId : meta[id]?.parentId || null
  };

  await writeMetadata(meta);

  return {
    id,
    title: meta[id].title,
    parentId: meta[id].parentId,
    content: finalContent
  };
}

async function deletePage(id) {
  const meta = await readMetadata();
  const filePath = getFilePath(id);

  // Delete page file
  try {
    await fs.unlink(filePath);
  } catch {}

  // Remove page and children from metadata
  const childIds = Object.entries(meta)
    .filter(([_, info]) => info.parentId === id)
    .map(([childId]) => childId);

  delete meta[id];
  childIds.forEach(childId => delete meta[childId]);

  await writeMetadata(meta);
}

module.exports = {
  getAllPages,
  getPageById,
  savePage,
  deletePage
};
