// Simple in-memory database with synchronous file persistence
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Load data or initialize empty
let db = { collections: { patients: [], queue_logs: [], users: [] }, idCounters: { patients: 1, queue_logs: 1, users: 1 } };

try {
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  if (parsed.collections) db.collections = parsed.collections;
  if (parsed.idCounters) db.idCounters = parsed.idCounters;
} catch (err) {
  // File doesn't exist or is corrupt – use defaults
  console.warn('DB file not found or invalid, starting fresh.');
}

function saveToDisk() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Utility to normalize query
function normalizeQuery(options) {
  return options && options.where ? options.where : (options || {});
}

function matchItem(item, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    const actual = item[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case '$gt': if (!(actual > opVal)) return false; break;
          case '$gte': if (!(actual >= opVal)) return false; break;
          case '$lt': if (!(actual < opVal)) return false; break;
          case '$lte': if (!(actual <= opVal)) return false; break;
          case '$ne': if (actual === opVal) return false; break;
          case '$in': if (!Array.isArray(opVal) || !opVal.includes(actual)) return false; break;
          default: return false;
        }
      }
    } else if (Array.isArray(value)) {
      if (!value.includes(actual)) return false;
    } else {
      if (actual !== value) return false;
    }
  }
  return true;
}

function wrapCollection(table) {
  const store = db.collections[table];

  return {
    find: async (options) => {
      const query = normalizeQuery(options);
      if (!query || Object.keys(query).length === 0) return [...store];
      return store.filter(item => matchItem(item, query));
    },

    findOne: async (options) => {
      const query = normalizeQuery(options);
      if (!query || Object.keys(query).length === 0) return store[0] || null;
      const found = store.find(item => matchItem(item, query));
      return found || null;
    },

    insert: async (data) => {
      if (Array.isArray(data)) {
        const inserted = [];
        for (const d of data) {
          const copy = { ...d };
          if (copy.id == null) copy.id = db.idCounters[table]++;
          store.push(copy);
          inserted.push(copy);
        }
        saveToDisk();
        return inserted;
      }
      const copy = { ...data };
      if (copy.id == null) copy.id = db.idCounters[table]++;
      store.push(copy);
      saveToDisk();
      return copy;
    },

    update: async (options, data) => {
      const query = normalizeQuery(options);
      let updatedCount = 0;
      for (let i = 0; i < store.length; i++) {
        if (matchItem(store[i], query)) {
          store[i] = { ...store[i], ...data };
          updatedCount++;
        }
      }
      if (updatedCount > 0) saveToDisk();
      return updatedCount;
    },

    remove: async (options) => {
      const query = normalizeQuery(options);
      let removedCount = 0;
      for (let i = store.length - 1; i >= 0; i--) {
        if (matchItem(store[i], query)) {
          store.splice(i, 1);
          removedCount++;
        }
      }
      if (removedCount > 0) saveToDisk();
      return removedCount;
    },

    count: async (query = {}) => {
      if (!query || Object.keys(query).length === 0) return store.length;
      return store.filter(item => matchItem(item, query)).length;
    }
  };
}

export const patients = wrapCollection('patients');
export const queueLogs = wrapCollection('queue_logs');
export const users = wrapCollection('users');