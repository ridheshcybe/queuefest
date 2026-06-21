// Simple in-memory database replacement for Supabase-backed `nedb` wrapper.
// Keeps the same API: `find`, `findOne`, `insert`, `update`, `remove`, `count`.

import fs from 'fs/promises'
import path from 'path'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'db.json')

const collections = {
  patients: [],
  queue_logs: [],
  users: []
}

const idCounters = {
  patients: 1,
  queue_logs: 1,
  users: 1
}

async function saveToDisk() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true })
    const payload = { collections, idCounters }
    await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2), 'utf8')
  } catch (err) {
    // don't crash the app for persistence errors, but log if available
    try { console.error('Failed saving DB:', err) } catch (e) {}
  }
}

async function loadFromDisk() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && parsed.collections) {
      for (const k of Object.keys(collections)) {
        if (Array.isArray(parsed.collections[k])) collections[k] = parsed.collections[k]
      }
    }
    if (parsed && parsed.idCounters) {
      for (const k of Object.keys(idCounters)) {
        if (typeof parsed.idCounters[k] === 'number') idCounters[k] = parsed.idCounters[k]
      }
    }
  } catch (err) {
    // ignore missing file or parse errors
  }
}

// load existing DB on startup (best-effort)

loadFromDisk().then(console.log).catch(console.error)

function normalizeQuery(options) {
  return options && options.where ? options.where : (options || {})
}

function matchItem(item, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    const actual = item[key]
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case '$gt': if (!(actual > opVal)) return false; break
          case '$gte': if (!(actual >= opVal)) return false; break
          case '$lt': if (!(actual < opVal)) return false; break
          case '$lte': if (!(actual <= opVal)) return false; break
          case '$ne': if (actual === opVal) return false; break
          case '$in': if (!Array.isArray(opVal) || !opVal.includes(actual)) return false; break
          default: return false
        }
      }
    } else if (Array.isArray(value)) {
      if (!value.includes(actual)) return false
    } else {
      if (actual !== value) return false
    }
  }
  return true
}

function wrapCollection(table) {
  const store = collections[table]

  return {
    find: async (options) => {
      const query = normalizeQuery(options)
      if (!query || Object.keys(query).length === 0) return [...store]
      return store.filter(item => matchItem(item, query))
    },

    findOne: async (options) => {
      const query = normalizeQuery(options)
      if (!query || Object.keys(query).length === 0) return store[0] || null
      const found = store.find(item => matchItem(item, query))
      return found || null
    },

    insert: async (data) => {
      if (Array.isArray(data)) {
        const inserted = data.map(d => {
          const copy = { ...d,id: copy.id ?? idCounters[table]++, }
          if (copy.id == null) copy.id = idCounters[table]++
          store.push(copy)
          return copy
        })
        await saveToDisk()
        return inserted
      }
      const copy = { ...data }
      if (copy.id == null) copy.id = idCounters[table]++
      store.push(copy)
      await saveToDisk()
      return copy
    },

    update: async (options, data) => {
      const query = normalizeQuery(options)
      let updatedCount = 0
      for (let i = 0; i < store.length; i++) {
        const item = store[i]
        if (matchItem(item, query)) {
          store[i] = { ...item, ...data }
          updatedCount++
        }
      }
      if (updatedCount > 0) await saveToDisk()
      return updatedCount
    },

    remove: async (options) => {
      const query = normalizeQuery(options)
      let removedCount = 0
      for (let i = store.length - 1; i >= 0; i--) {
        if (matchItem(store[i], query)) {
          store.splice(i, 1)
          removedCount++
        }
      }
      if (removedCount > 0) await saveToDisk()
      return removedCount
    },

    count: async (query = {}) => {
      if (!query || Object.keys(query).length === 0) return store.length
      return store.filter(item => matchItem(item, query)).length
    }
  }
}

export const patients = wrapCollection('patients')
export const queueLogs = wrapCollection('queue_logs')
export const users = wrapCollection('users')

// Manual persist function (can be called from routes before redirect)
export async function persist() {
  await saveToDisk()
}

// Best-effort save on process termination
if (typeof process !== 'undefined' && process && process.on) {
  process.on('SIGINT', async () => { await saveToDisk(); process.exit(0) })
  process.on('SIGTERM', async () => { await saveToDisk(); process.exit(0) })
}