import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import { queryOne } from '../lib/database.js';

/**
 * Initialize Local (email/password) authentication strategy
 */
export function initializeLocal() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await queryOne(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
          );

          if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

/**
 * Serialize user to session
 */
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await queryOne(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
