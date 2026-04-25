/**
 * Mock Database - In-Memory Storage for Testing
 * Use this temporarily while PostgreSQL is being set up
 * All data is lost when server restarts
 */

// In-memory storage
const users = new Map();
const tickets = new Map();
const comments = new Map();

let userIdCounter = 1;
let ticketIdCounter = 1;
let commentIdCounter = 1;

/**
 * Query helper - returns single user by email or other criteria
 */
function queryOne(text, params = []) {
  // Direct email lookup (most common case)
  if (text.includes('SELECT * FROM users WHERE email')) {
    const email = params[0];
    const user = users.get(email);
    return user || null;
  }
  if (text.includes('SELECT user_id FROM users WHERE email')) {
    const email = params[0];
    const user = users.get(email);
    return user ? { user_id: user.user_id } : null;
  }
  if (text.includes('SELECT * FROM users WHERE user_id')) {
    const userId = params[0];
    for (let user of users.values()) {
      if (user.user_id === userId) return user;
    }
    return null;
  }
  if (text.includes('SELECT COUNT(*) as count FROM users')) {
    if (text.includes('WHERE')) {
      if (text.includes('WHERE role = $1')) {
        const role = params[0];
        let count = 0;
        for (let user of users.values()) {
          if (user.role === role) count++;
        }
        return { count };
      }
    } else {
      return { count: users.size };
    }
  }
  if (text.includes('SELECT COUNT(*) as count FROM tickets')) {
    if (text.includes('WHERE')) {
      let count = 0;
      for (let ticket of tickets.values()) {
        count++;
      }
      return { count };
    } else {
      return { count: tickets.size };
    }
  }
  if (text.includes('SELECT COUNT(*) as count FROM comments')) {
    return { count: comments.size };
  }
  return null;
}

/**
 * Insert helper - adds new user
 */
function insert(table, data) {
  if (table === 'users') {
    const user = {
      user_id: userIdCounter++,
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };
    users.set(data.email, user);
    return user;
  }
  return null;
}

/**
 * Update helper - updates user
 */
function update(table, data, id) {
  if (table === 'users') {
    for (let user of users.values()) {
      if (user.user_id === id) {
        const updated = { ...user, ...data, updated_at: new Date() };
        users.set(user.email, updated);
        return updated;
      }
    }
  }
  return null;
}

/**
 * Delete helper
 */
function deleteRow(table, id) {
  if (table === 'users') {
    for (let [email, user] of users.entries()) {
      if (user.user_id === id) {
        users.delete(email);
        return true;
      }
    }
  }
  return false;
}

/**
 * Query multiple rows
 */
function queryMany(text, params = []) {
  if (text.includes('SELECT * FROM users')) {
    const userArray = Array.from(users.values());
    
    // Apply email filter
    if (text.includes('WHERE email = $1')) {
      const email = params[0];
      return userArray.filter(u => u.email === email);
    }
    
    // Apply role filter
    if (text.includes('WHERE role = $1')) {
      const role = params[0];
      return userArray.filter(u => u.role === role);
    }
    
    // Apply ordering
    if (text.includes('ORDER BY')) {
      userArray.sort((a, b) => b.created_at - a.created_at);
    }
    
    // Apply limit
    if (text.includes('LIMIT')) {
      const limitMatch = text.match(/LIMIT \$(\d+)/);
      if (limitMatch) {
        const limit = params[params.length - 2];
        return userArray.slice(0, limit);
      }
    }
    
    return userArray;
  }
  
  // Handle tickets queries
  if (text.includes('FROM tickets') || text.includes('FROM t')) {
    return Array.from(tickets.values());
  }
  
  // Handle comments queries
  if (text.includes('FROM comments') || text.includes('FROM co')) {
    return Array.from(comments.values());
  }
  
  return [];
}

/**
 * Test connection
 */
function testConnection() {
  console.log('✓ Mock Database (In-Memory) initialized');
  return true;
}

/**
 * Seed with demo user
 */
function seedDemoUser() {
  const demoUser = {
    user_id: userIdCounter++,
    email: 'demo@runcademic.com',
    password_hash: '$2b$10$yKVSJGwg11rKqAowy7Hpf.jsR/6xCIpM0Glv1qWOBr9orxax601ti', // "password123" hashed
    username: 'demo',
    first_name: 'Demo',
    last_name: 'User',
    role: 'student',
    created_at: new Date(),
    updated_at: new Date()
  };
  users.set(demoUser.email, demoUser);
  console.log('✓ Demo user created: demo@runcademic.com / password123');

  const adminUser = {
    user_id: userIdCounter++,
    email: 'admin@runcademic.com',
    password_hash: '$2b$10$yKVSJGwg11rKqAowy7Hpf.jsR/6xCIpM0Glv1qWOBr9orxax601ti', // "password123" hashed
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  };
  users.set(adminUser.email, adminUser);
  console.log('✓ Admin user created: admin@runcademic.com / password123');
}

export {
  queryOne,
  insert,
  update,
  deleteRow,
  queryMany,
  testConnection,
  seedDemoUser
};
