import Datastore from '@seald-io/nedb'
import fs from 'fs';
import path from 'path';

// Determine a writable data directory
let dataDir = `${process.cwd()}/data`;
try {
  // Check if the data directory is writable
  fs.accessSync(dataDir, fs.constants.W_OK);
} catch (err) {
  // Fall back to /tmp/data for Vercel serverless functions
  dataDir = path.join('/tmp', 'data');
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Create NeDB instances
const patientsInstance = new Datastore({ filename: path.join(dataDir, 'patients.db'), autoload: true })
const queueLogsInstance = new Datastore({ filename: path.join(dataDir, 'queueLogs.db'), autoload: true })
const usersInstance = new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true })

function wrapCollection(db) {
  return {
    find: (options) => {
      let query = options.where ? options.where : options
      // Convert id to _id for NeDB if present
      if (query.id) {
        query = { ...query, _id: query.id }
        delete query.id
      }
      return new Promise((resolve, reject) => {
        db.find(query, (err, docs) => {
          if (err) return reject(err)
          // Map _id to id in returned documents for consistency (keep both)
          const mappedDocs = docs.map(doc => ({
            ...doc,
            id: doc._id
          }))
          resolve(mappedDocs)
        })
      })
    },
    findOne: (options) => {
      let query = options.where ? options.where : options
      // Convert id to _id for NeDB if present
      if (query.id) {
        query = { ...query, _id: query.id }
        delete query.id
      }
      return new Promise((resolve, reject) => {
        db.findOne(query, (err, doc) => {
          if (err) return reject(err)
          if (!doc) return resolve(null)
          // Map _id to id in returned document for consistency (keep both)
          const mappedDoc = {
            ...doc,
            id: doc._id
          }
          resolve(mappedDoc)
        })
      })
    },
    insert: (data) => {
      return new Promise((resolve, reject) => {
        db.insert(data, (err, newDoc) => {
          if (err) return reject(err)
          // Map _id to id in returned document for consistency (keep both)
          const mappedDoc = {
            ...newDoc,
            id: newDoc._id
          }
          resolve(mappedDoc)
        })
      })
    },
    update: (options, data) => {
      let query = options.where ? options.where : options
      // Convert id to _id for NeDB if present
      if (query.id) {
        query = { ...query, _id: query.id }
        delete query.id
      }
      return new Promise((resolve, reject) => {
        db.update(query, { $set: data }, {}, (err, numReplaced) => {
          if (err) return reject(err)
          resolve(numReplaced)
        })
      })
    },
    remove: (options) => {
      let query = options.where ? options.where : options
      // Convert id to _id for NeDB if present
      if (query.id) {
        query = { ...query, _id: query.id }
        delete query.id
      }
      return new Promise((resolve, reject) => {
        db.remove(query, { multi: true }, (err, numRemoved) => {
          if (err) return reject(err)
          resolve(numRemoved)
        })
      })
    },
    count: (data)=>{
      return new Promise((resolve, reject) => {
         db.count(data, (err, count) => {
           if (err) return reject(err)
           resolve(count)
         });
      });
    }
  }
}

// Export wrapped collections
export const patients = wrapCollection(patientsInstance)
export const queueLogs = wrapCollection(queueLogsInstance)
export const users = wrapCollection(usersInstance)