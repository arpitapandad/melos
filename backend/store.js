/**
 * store.js — Lightweight file-based user store
 * Replaces PostgreSQL for local development.
 * Users are persisted to users.json in the backend folder.
 */

const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'users.json');

// Load existing users from file, or start fresh
function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(users) {
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

const store = {
  // Find a single user matching a field/value pair
  findBy(field, value) {
    const users = load();
    return users.find(u => u[field] === value) || null;
  },

  // Find by id (resilient to string vs number mismatch)
  findById(id) {
    const users = load();
    return users.find(u => String(u.id) === String(id)) || null;
  },

  // Create a new user record
  create(data) {
    const users = load();
    const user  = {
      id:            generateId(),
      email:         data.email         || null,
      username:      data.username       || null,
      name:          data.name           || null,
      password_hash: data.password_hash  || null,
      google_id:     data.google_id      || null,
      spotify_id:    data.spotify_id     || null,
      avatar_url:    data.avatar_url     || null,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      last_login:    null,
    };
    users.push(user);
    save(users);
    return user;
  },

  // Update fields on a user by id
  update(id, data) {
    const users = load();
    const idx   = users.findIndex(u => String(u.id) === String(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, updated_at: new Date().toISOString() };
    save(users);
    return users[idx];
  },

  // List all users (for debugging)
  all() {
    return load();
  },
};

module.exports = store;
