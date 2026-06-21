import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // use service role for server-side access

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Maps a NeDB-style query object (supports basic operators) onto a Supabase query builder
function applyFilters(builder, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Handle simple Mongo-style operators
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case '$gt': builder = builder.gt(key, opVal); break
          case '$gte': builder = builder.gte(key, opVal); break
          case '$lt': builder = builder.lt(key, opVal); break
          case '$lte': builder = builder.lte(key, opVal); break
          case '$ne': builder = builder.neq(key, opVal); break
          case '$in': builder = builder.in(key, opVal); break
          default: break
        }
      }
    } else if (Array.isArray(value)) {
      builder = builder.in(key, value)
    } else {
      builder = builder.eq(key, value)
    }
  }
  return builder
}

function normalizeQuery(options) {
  // Supports both `{ where: {...} }` and a bare query object, same as the old wrapper
  return options && options.where ? options.where : (options || {})
}

function wrapCollection(table) {
  return {
    find: async (options) => {
      const query = normalizeQuery(options)
      let builder = supabase.from(table).select('*')
      builder = applyFilters(builder, query)
      const { data, error } = await builder
      if (error) throw error
      return data
    },

    findOne: async (options) => {
      const query = normalizeQuery(options)
      let builder = supabase.from(table).select('*')
      builder = applyFilters(builder, query)
      const { data, error } = await builder.limit(1).maybeSingle()
      if (error) throw error
      return data || null
    },

    insert: async (data) => {
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return inserted
    },

    update: async (options, data) => {
      const query = normalizeQuery(options)
      let builder = supabase.from(table).update(data)
      builder = applyFilters(builder, query)
      const { data: updated, error } = await builder.select()
      if (error) throw error
      return updated ? updated.length : 0
    },

    remove: async (options) => {
      const query = normalizeQuery(options)
      let builder = supabase.from(table).delete()
      builder = applyFilters(builder, query)
      const { data: removed, error } = await builder.select()
      if (error) throw error
      return removed ? removed.length : 0
    },

    count: async (query = {}) => {
      let builder = supabase.from(table).select('*', { count: 'exact', head: true })
      builder = applyFilters(builder, query)
      const { count, error } = await builder
      if (error) throw error
      return count || 0
    }
  }
}

// Export wrapped collections — table names use snake_case per Postgres convention
export const patients = wrapCollection('patients')
export const queueLogs = wrapCollection('queue_logs')
export const users = wrapCollection('users')