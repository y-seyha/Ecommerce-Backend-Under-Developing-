import { IGoogleUserResponse } from "model/user.model.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "service/user.service.js";

const userService = new UserService();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in Google profile"));
        }

        const email = profile.emails[0].value;
        const name = profile.displayName || "";
        const googleId = profile.id;

        // Get or create user
        const user = await userService.findOrCreateGoogleUser({
          email,
          name,
          googleId,
        });

        // Build response with default values
        const response: IGoogleUserResponse = {
          ...user,
          googleId: user.googleId || googleId,
          provider: user.provider || "google",
          is_verified: user.is_verified ?? true,
          accessToken, 
        };

        return done(null, response); // return the response with token
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(new Error("Google login failed"), false);
      }
    },
  ),
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  // Only save minimal info in session
  done(null, { id: user.id, email: user.email, role: user.role });
});

// Deserialize user from session
passport.deserializeUser(async (userSession: any, done) => {
  try {
    // You can fetch full user from DB if needed
    const user = await userService.getUserById(userSession.id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
