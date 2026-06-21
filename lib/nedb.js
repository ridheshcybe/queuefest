// lib/nedb.js
// WARNING: This uses an ephemeral file in the system's temp directory.
// Data is lost on cold starts, redeploys, or after the container is destroyed.
// For production, replace with a real database (e.g., MongoDB, Supabase, PostgreSQL).

import fs from 'fs';
import path from 'path';
import os from 'os';

// Use system temp directory (writable on Vercel, AWS Lambda, etc.)
const DB_DIR = path.join(os.tmpdir(), 'queue-cure-data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure the directory exists
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create DB directory, falling back to in-memory only:', err.message);
}

// In-memory store
let db = {
  collections: {
    patients: [],
    queue_logs: [],
    users: [],
  },
  idCounters: {
    patients: 1,
    queue_logs: 1,
    users: 1,
  },
};

// Track whether we've already loaded to avoid re-loading on module hot-reload
let dbLoaded = false;

// Attempt to load existing data (only once)
if (!dbLoaded) {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.collections) db.collections = parsed.collections;
      if (parsed.idCounters) db.idCounters = parsed.idCounters;
      console.log('Loaded DB from', DB_FILE);
    }
  } catch (err) {
    console.warn('Failed to load DB file, starting fresh:', err.message);
  }
  dbLoaded = true;
}

function saveToDisk() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write DB to disk (data will NOT persist):', err.message);
  }
}

// Utility to normalize query
function normalizeQuery(options) {
  return options && options.where ? options.where : (options || {});
}

function matchItem(item, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    let actual = item[key];
    let compareValue = value;
    
    // Coerce string numbers to actual numbers for ID matching (e.g., URL params '1' → 1)
    if (typeof actual === 'number' && typeof compareValue === 'string' && /^\d+$/.test(compareValue)) {
      compareValue = Number(compareValue);
    }
    
    if (compareValue !== null && typeof compareValue === 'object' && !Array.isArray(compareValue)) {
      for (const [op, opVal] of Object.entries(compareValue)) {
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
    } else if (Array.isArray(compareValue)) {
      if (!compareValue.includes(actual)) return false;
    } else {
      if (actual !== compareValue) return false;
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
      if (!found && Object.keys(query).length > 0) {
        console.log(`findOne(${table}) not found for query:`, JSON.stringify(query), 'Available items:', JSON.stringify(store.slice(0, 5)));
      }
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
      console.log(`Attempting to update ${table} with query:`, JSON.stringify(query), 'Available items:', JSON.stringify(store));
      let updatedCount = 0;
      for (let i = 0; i < store.length; i++) {
        if (matchItem(store[i], query)) {
          store[i] = { ...store[i], ...data };
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        console.log(`Updated ${updatedCount} ${table} with query:`, JSON.stringify(query), 'data:', JSON.stringify(data));
        saveToDisk();
      } else {
        console.log(`No ${table} found matching query:`, JSON.stringify(query));
      }
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
    },
  };
}

export const patients = wrapCollection('patients');
export const queueLogs = wrapCollection('queue_logs');
export const users = wrapCollection('users');

// Reset DB to initial state (no data, reset counters)
export function resetDB() {
  db.collections = {
    patients: [],
    queue_logs: [],
    users: [],
  };
  db.idCounters = {
    patients: 1,
    queue_logs: 1,
    users: 1,
  };
  saveToDisk();
  dbLoaded = false; // Allow next module import to reload from disk
  console.log('DB reset to initial state');
}
