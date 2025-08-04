let pages = {};
let currentPageId = null;
let isEditing = false;

const pageTreeEl = document.getElementById('pageTree');
const pageTitleEl = document.getElementById('pageTitle');
const pageContentEl = document.getElementById('pageContent');
const editorEl = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const toggleEditBtn = document.getElementById('toggleEdit');

// Sidebar mobile elements
const sidebarEl = document.getElementById('sidebar');
const sidebarOverlayEl = document.getElementById('sidebarOverlay');
const sidebarBarEl = document.getElementById('sidebarBar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

function isMobile() {
  return window.innerWidth <= 640;
}

function toggleSidebar(open) {
  if (isMobile()) {
    if (open) {
      sidebarEl.classList.add('sidebar-mobile-open');
      sidebarEl.classList.remove('sidebar-mobile-closed');
      sidebarOverlayEl.style.display = '';
      sidebarOverlayEl.classList.remove('mobile-hide');
      sidebarBarEl.classList.add('sidebarbar-hide');
    } else {
      sidebarEl.classList.remove('sidebar-mobile-open');
      sidebarEl.classList.add('sidebar-mobile-closed');
      sidebarOverlayEl.style.display = 'none';
      sidebarOverlayEl.classList.add('mobile-hide');
      sidebarBarEl.classList.remove('sidebarbar-hide');
    }
  }
}

// Hide sidebar on page load if mobile
window.addEventListener('DOMContentLoaded', () => {
  if (isMobile()) {
    toggleSidebar(false);
  }
});

// Hide sidebar on resize if mobile
window.addEventListener('resize', () => {
  if (isMobile()) {
    toggleSidebar(false);
    document.querySelector('main').style.marginLeft = "40px";
  } else {
    sidebarEl.classList.remove('sidebar-mobile-open', 'sidebar-mobile-closed');
    sidebarOverlayEl.style.display = 'none';
    sidebarOverlayEl.classList.add('mobile-hide');
    sidebarBarEl.classList.remove('sidebarbar-hide');
    document.querySelector('main').style.marginLeft = "0";
  }
});

// Sidebar bar button event
sidebarToggleBtn.onclick = function() {
  toggleSidebar(true);
};

async function loadPages() {
  const res = await fetch('/api/pages');
  const data = await res.json();
  pages = {};
  data.forEach(p => pages[p.id] = { ...p, children: [], collapsed: false });

  // Build hierarchy
  const rootPages = [];
  for (const page of Object.values(pages)) {
    if (page.parentId && pages[page.parentId]) {
      pages[page.parentId].children.push(page);
    } else {
      rootPages.push(page);
    }
  }

  renderTree(rootPages);
}

function renderTree(rootPages) {
  pageTreeEl.innerHTML = '';
  rootPages.forEach(page => renderNode(page, pageTreeEl, 0));
}

function renderNode(page, container, level) {
  const wrapper = document.createElement('div');
  wrapper.className = `pl-${level * 4} space-y-1`;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 group';

  // Collapse toggle
  const toggle = document.createElement('button');
  toggle.textContent = page.children.length ? (page.collapsed ? '▶' : '▼') : '';
  toggle.className = 'text-sm';
  toggle.onclick = () => {
    page.collapsed = !page.collapsed;
    renderTree(Object.values(pages).filter(p => !p.parentId));
  };

  // Page title (editable)
  const titleSpan = document.createElement('span');
  titleSpan.contentEditable = true;
  titleSpan.className = 'flex-1 rounded px-1 hover:bg-gray-200 cursor-text text-base sm:text-lg';
  titleSpan.textContent = page.title;

  titleSpan.onblur = async () => {
    const newTitle = titleSpan.innerText.trim();
    if (newTitle !== page.title) {
      page.title = newTitle;
      await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: page.content })
      });
      if (page.id === currentPageId) pageTitleEl.textContent = newTitle;
    }
  };

  // Open page
  const openBtn = document.createElement('button');
  openBtn.textContent = '📄';
  openBtn.onclick = () => {
    loadPage(page.id);
    if (isMobile()) toggleSidebar(false); // Hide sidebar when page opened on mobile
  };

  // Add subpage
  const addSubBtn = document.createElement('button');
  addSubBtn.textContent = '+';
  addSubBtn.className = 'text-sm text-gray-500 hover:text-black';
  addSubBtn.onclick = () => createPage('New Subpage', page.id);
  
  // Delete page
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.className = 'text-sm text-red-400 hover:text-red-600';
  deleteBtn.onclick = async () => {
    if (!confirm(`Delete "${page.title}" and all subpages?`)) return;
    await fetch(`/api/pages/${page.id}`, { method: 'DELETE' });
    delete pages[page.id];
    loadPages();
  };

  row.appendChild(toggle);
  row.appendChild(openBtn);
  row.appendChild(titleSpan);
  row.appendChild(addSubBtn);
  row.appendChild(deleteBtn);

  wrapper.appendChild(row);
  container.appendChild(wrapper);

  // Children
  if (!page.collapsed) {
    page.children.forEach(child => renderNode(child, container, level + 1));
  }
}

async function createPage(title, parentId = null) {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, parentId })
  });
  const page = await res.json();
  pages[page.id] = { ...page, children: [], collapsed: false };

  // Attach to parent
  if (parentId && pages[parentId]) {
    pages[parentId].children.push(pages[page.id]);
  }

  loadPage(page.id);
  renderTree(Object.values(pages).filter(p => !p.parentId));
}

async function loadPage(id) {
  const res = await fetch(`/api/pages/${id}`);
  const page = await res.json();
  currentPageId = id;
  pageTitleEl.textContent = page.title;
  pageContentEl.innerHTML = DOMPurify.sanitize(marked.parse(page.content || ''));
  editorEl.value = page.content || '';
  saveBtn.classList.add('hidden');
  editorEl.classList.add('hidden');
  pageContentEl.classList.remove('hidden');
  isEditing = false;
}

saveBtn.onclick = async () => {
  const content = editorEl.value;
  const page = pages[currentPageId];

  await fetch(`/api/pages/${currentPageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: page.title,
      parentId: page.parentId,
      content,
    }),
  });
  pages[currentPageId].content = content;
  pageContentEl.innerHTML = DOMPurify.sanitize(marked.parse(content));
  toggleEditor(false);
};

toggleEditBtn.onclick = () => {
  toggleEditor(!isEditing);
};

function toggleEditor(state) {
  isEditing = state;
  if (state) {
    editorEl.classList.remove('hidden');
    pageContentEl.classList.add('hidden');
    saveBtn.classList.remove('hidden');
  } else {
    editorEl.classList.add('hidden');
    pageContentEl.classList.remove('hidden');
    saveBtn.classList.add('hidden');
  }
}

loadPages();