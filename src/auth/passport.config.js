import passport from 'passport';
import LocalStrategy from 'passport-local';
import GithubStrategy from 'passport-github2';
import { generateRandomPassword } from '../utils/randomPass.js';
import bcrypt from 'bcrypt';
import { FactoryUsers } from '../dao/factory.js';
import config from '../utils/config.js';

const userManager = new FactoryUsers();

const initializePassport = () => {
  passport.use(
    'authRegistration',
    new LocalStrategy({ usernameField: 'login_email', passwordField: 'login_password' }, async (login_email, login_password, done) => {
      try {
        const user = await userManager.getUserByEmail(login_email);
        if (user) {
          return done(null, false, { message: 'User already exists' });
        } else {
          return done(null, { _id: 0 });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'login_email', passwordField: 'login_password' }, async (login_email, login_password, done) => {
      try {
        const user = await userManager.getUserByEmail(login_email);
        if (!user) {
          return done(null, false, { message: `User doesn't exist` });
        }
        const isValid = await bcrypt.compare(login_password, user.password);
        if (!isValid) {
          return done(null, false, { message: `Incorrect user or password` });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    'github',
    new GithubStrategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackUrl: config.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userManager.getUserByEmail(profile._json.email);
          if (!user) {
            const randomPassword = generateRandomPassword(8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            await userManager.addUser({ email: profile._json.email, password: hashedPassword });
            return done(null, user);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userManager.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default initializePassport;
