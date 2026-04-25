import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import { queryOne, insert } from '../lib/database.js';

// Configure GitHub OAuth Strategy
export function initializeGitHub() {
  const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL,
  } = process.env;

  // Skip GitHub OAuth if credentials not provided
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('⚠️  GitHub OAuth not configured — skipping. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable.');
    return;
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
        scope: ['repo', 'user', 'gist'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await queryOne(
            'SELECT * FROM users WHERE github_id = $1',
            [profile.id.toString()]
          );

          if (!user) {
            const newUser = await insert('users', {
              github_id: profile.id.toString(),
              github_username: profile.username,
              email: profile.emails?.[0]?.value || `github-${profile.id}@example.com`,
              username: profile.username,
              first_name: profile.displayName?.split(' ')[0] || profile.username,
              last_name: profile.displayName?.split(' ')[1] || '',
              avatar_url: profile.photos[0]?.value,
              role: 'student',
            });
            user = newUser;
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  console.log('✅ GitHub OAuth initialized');
}

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

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
