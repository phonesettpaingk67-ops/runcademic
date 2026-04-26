/**
 * Seed Demo Users to PostgreSQL
 * 
 * Usage:
 *   Direct: node src/seed-demo-users.js
 *   Via import: import { seedDemoUsers } from './seed-demo-users.js'
 * 
 * This will add demo login users to your PostgreSQL database
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Create connection pool for standalone use
let standalonePool = null;

function getPool(externalPool) {
  if (externalPool) return externalPool;
  if (!standalonePool) {
    standalonePool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'runcademic'
    });
  }
  return standalonePool;
}

async function seedDemoUsers(externalPool = null) {
  const pool = getPool(externalPool);
  const shouldClosePool = !externalPool && standalonePool;
  
  try {
    console.log('🌱 Seeding demo users to PostgreSQL...\n');

    // Demo users data
    const demoUsers = [
      {
        email: 'student@runcademic.com',
        name: 'Demo Student',
        role: 'student',
        password: 'student123'
      },
      {
        email: 'instructor@runcademic.com',
        name: 'Demo Instructor',
        role: 'instructor',
        password: 'instructor123'
      },
      {
        email: 'admin@runcademic.com',
        name: 'Demo Admin',
        role: 'admin',
        password: 'admin123'
      }
    ];

    // Insert each user
    for (const userData of demoUsers) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Check if user exists
        const existsResult = await pool.query(
          'SELECT user_id, role FROM users WHERE email = $1',
          [userData.email]
        );

        if (existsResult.rows.length === 0) {
          // Generate username from email (first part)
          const username = userData.email.split('@')[0];
          
          // Insert new user
          const [firstName, ...lastNameParts] = userData.name.split(' ');
          const lastName = lastNameParts.join(' ') || 'User';
          
          await pool.query(
            `INSERT INTO users (email, username, first_name, last_name, password_hash, role, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [userData.email, username, firstName, lastName, hashedPassword, userData.role]
          );
          console.log(`✅ Created ${userData.role}: ${userData.email}`);
        } else {
          // Check if role needs updating
          const existingRole = existsResult.rows[0].role;
          if (existingRole !== userData.role) {
            await pool.query(
              'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2',
              [userData.role, userData.email]
            );
            console.log(`🔄 Updated role ${existingRole} -> ${userData.role}: ${userData.email}`);
          } else {
            console.log(`⏭️  Already exists: ${userData.email}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error seeding ${userData.email}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 DEMO LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\n🎓 Student Account:');
    console.log('   Email: student@runcademic.com');
    console.log('   Password: student123\n');
    
    console.log('👨‍🏫 Instructor Account:');
    console.log('   Email: instructor@runcademic.com');
    console.log('   Password: instructor123\n');
    
    console.log('🔑 Admin Account:');
    console.log('   Email: admin@runcademic.com');
    console.log('   Password: admin123\n');
    
    console.log('='.repeat(60));
    console.log('🔗 Login at: http://localhost:5176/login');
    console.log('='.repeat(60) + '\n');

    if (shouldClosePool) {
      await standalonePool.end();
      standalonePool = null;
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (shouldClosePool) {
      await standalonePool.end();
      standalonePool = null;
    }
    throw error;
  }
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoUsers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { seedDemoUsers };
