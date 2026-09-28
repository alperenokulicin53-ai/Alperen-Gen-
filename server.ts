import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'journal.json');

const TOTAL_WEEKS = 30;

function getInitialData() {
  const weeks: Record<number, { weekNumber: number; customTitle?: string; status: 'not_started' | 'in_progress' | 'completed' }> = {};
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    weeks[i] = {
      weekNumber: i,
      status: 'not_started',
    };
  }
  return {
    weeks,
    items: [],
    comments: [],
  };
}

function readData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const init = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf-8');
      return init;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure all 30 weeks are initialized in meta
    if (!parsed.weeks) parsed.weeks = {};
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
      if (!parsed.weeks[i]) {
        parsed.weeks[i] = { weekNumber: i, status: 'not_started' };
      }
    }
    if (!Array.isArray(parsed.items)) parsed.items = [];
    if (!Array.isArray(parsed.comments)) parsed.comments = [];
    return parsed;
  } catch (err) {
    console.error('Error reading data file:', err);
    return getInitialData();
  }
}

function writeData(data: unknown) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS middleware for multi-device cross-origin support
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Endpoints
  app.get('/api/journal', (_req, res) => {
    const data = readData();
    res.json(data);
  });

  app.post('/api/items', (req, res) => {
    const { weekNumber, type, title, content, driveUrl, formattedDate } = req.body;
    if (!weekNumber || !type || !title || !content) {
      return res.status(400).json({ error: 'Eksik alanlar var.' });
    }

    const data = readData();
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      weekNumber: Number(weekNumber),
      type,
      title: title.trim(),
      content: content.trim(),
      driveUrl: driveUrl ? driveUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
      formattedDate: formattedDate || new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
    };

    data.items.unshift(newItem);

    // If week is not_started, automatically mark as in_progress
    if (data.weeks[newItem.weekNumber] && data.weeks[newItem.weekNumber].status === 'not_started') {
      data.weeks[newItem.weekNumber].status = 'in_progress';
    }

    writeData(data);
    res.status(201).json(newItem);
  });

  app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, driveUrl } = req.body;

    const data = readData();
    const index = data.items.findIndex((it: { id: string }) => it.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Yenilik bulunamadı.' });
    }

    data.items[index] = {
      ...data.items[index],
      title: title ? title.trim() : data.items[index].title,
      content: content ? content.trim() : data.items[index].content,
      driveUrl: driveUrl !== undefined ? driveUrl.trim() : data.items[index].driveUrl,
      updatedAt: new Date().toISOString(),
    };

    writeData(data);
    res.json(data.items[index]);
  });

  app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const itemToDelete = data.items.find((it: { id: string }) => it.id === id);
    if (!itemToDelete) {
      return res.status(404).json({ error: 'Yenilik bulunamadı.' });
    }

    data.items = data.items.filter((it: { id: string }) => it.id !== id);

    // If no items remain for this week and status was in_progress, revert to not_started
    const remainingInWeek = data.items.filter((it: { weekNumber: number }) => it.weekNumber === itemToDelete.weekNumber);
    if (remainingInWeek.length === 0 && data.weeks[itemToDelete.weekNumber]?.status === 'in_progress') {
      data.weeks[itemToDelete.weekNumber].status = 'not_started';
    }

    writeData(data);
    res.json({ success: true, id });
  });

  app.put('/api/weeks/:weekNumber', (req, res) => {
    const weekNumber = Number(req.params.weekNumber);
    const { status, customTitle } = req.body;

    const data = readData();
    if (!data.weeks[weekNumber]) {
      data.weeks[weekNumber] = { weekNumber, status: 'not_started' };
    }

    if (status) data.weeks[weekNumber].status = status;
    if (customTitle !== undefined) data.weeks[weekNumber].customTitle = customTitle.trim();

    writeData(data);
    res.json(data.weeks[weekNumber]);
  });

  app.post('/api/comments', (req, res) => {
    const { weekNumber, authorName, content, formattedDate } = req.body;
    if (!weekNumber || !authorName || !content || !authorName.trim() || !content.trim()) {
      return res.status(400).json({ error: 'Ad ve yorum alanları zorunludur.' });
    }

    const data = readData();
    const newComment = {
      id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      weekNumber: Number(weekNumber),
      authorName: authorName.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      formattedDate: formattedDate || new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
    };

    data.comments.unshift(newComment);
    writeData(data);
    res.status(201).json(newComment);
  });

  app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const beforeCount = data.comments.length;
    data.comments = data.comments.filter((c: { id: string }) => c.id !== id);
    if (data.comments.length === beforeCount) {
      return res.status(404).json({ error: 'Yorum bulunamadı.' });
    }
    writeData(data);
    res.json({ success: true, id });
  });

  app.post('/api/journal/import', (req, res) => {
    const { weeks, items, comments } = req.body;
    if (!weeks || !Array.isArray(items) || !Array.isArray(comments)) {
      return res.status(400).json({ error: 'Geçersiz veri yapısı.' });
    }
    const data = {
      weeks,
      items,
      comments,
    };
    writeData(data);
    res.json({ success: true, data });
  });

  // Vite middleware mounting in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
