const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/userModel');

// --- Google Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ googleId: profile.id });

      if (user) return done(null, user);

      // If no user by googleId, check if one exists by email
      user = await User.findOne({ email });
      if (user) {
        user.googleId = profile.id; // Link account
        await user.save();
        return done(null, user);
      }

      // Create a new user if none exists
      const newUser = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
      });
      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }
));

// --- Facebook Strategy ---
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails'] // Request email permission
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ facebookId: profile.id });

      if (user) return done(null, user);
      
      // If no user by facebookId, check if one exists by email
      user = await User.findOne({ email });
      if (user) {
        user.facebookId = profile.id; // Link account
        await user.save();
        return done(null, user);
      }

      // Create a new user if none exists
      const newUser = await User.create({
        facebookId: profile.id,
        name: profile.displayName,
        email,
      });
      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }
));