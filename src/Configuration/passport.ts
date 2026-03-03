import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "service/user.service.js";
import { IOAuthUserResponse } from "model/user.model.js";

const userService = new UserService();

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
        const providerAccountId = profile.id;

        // Use the new service method
        const user = await userService.findOrCreateGoogleUser({
          email,
          name,
          provider: "google",
          providerAccountId,
          accessToken,
          refreshToken,
        });

        // Build response combining user + account
        const response: IOAuthUserResponse = {
          user,
          account: {
            userId: user.id!,
            provider: "google",
            provider_account_id: providerAccountId,
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        };

        return done(null, response);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(new Error("Google login failed"), false);
      }
    },
  ),
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, {
    id: user.user.id,
    email: user.user.email,
    role: user.user.role,
  });
});

// Deserialize user from session
passport.deserializeUser(async (userSession: any, done) => {
  try {
    const user = await userService.getUserById(userSession.id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
