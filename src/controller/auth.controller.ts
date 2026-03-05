import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { IUser, IOAuthUserResponse } from "model/user.model.js";
import { UserService } from "service/user.service.js";
import { Logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

const userService = new UserService();
const logger = Logger.getInstance();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export class AuthController {
  // Google login
  googleLogin(req: Request, res: Response, next: NextFunction) {
    logger.info("Initiating Google login");
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next,
    );
  }

  // Google callback
  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google",
      { session: false },
      async (err, user: IOAuthUserResponse | false, info) => {
        try {
          if (err || !user) {
            logger.warn("Google login failed", { error: err || info });
            return res.status(401).json({
              success: false,
              message: "Google login failed",
              error: err || info,
            });
          }

          const { user: userData, account } = user;
          logger.info("Google login successful", { email: userData.email });

          if (account.access_token) {
            res.cookie("accessToken", account.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
          }
          res.redirect(`${FRONTEND_URL}/`);
          // res.json({
          //   success: true,
          //   data: userData,
          //   accessToken: account.access_token,
          // });
        } catch (error) {
          logger.error("Google callback error", { error });
          next(error);
        }
      },
    )(req, res, next);
  }

  // Facebook login
  facebookLogin(req: Request, res: Response, next: NextFunction) {
    logger.info("Initiating Facebook login");
    passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
  }

  facebookCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "facebook",
      { session: false },
      async (err, user: IOAuthUserResponse | false, info) => {
        try {
          if (err || !user) {
            logger.warn("Facebook login failed", { error: err || info });
            return res.status(401).json({
              success: false,
              message: "Facebook login failed",
              error: err || info,
            });
          }

          const { user: userData, account } = user;
          logger.info("Facebook login successful", { email: userData.email });

          if (account.access_token) {
            res.cookie("accessToken", account.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 24 * 60 * 60 * 1000,
            });
          }
          res.redirect(`${FRONTEND_URL}/`);
          // res.json({
          //   success: true,
          //   data: userData,
          //   accessToken: account.access_token,
          // });
        } catch (error) {
          logger.error("Facebook callback error", { error });
          next(error);
        }
      },
    )(req, res, next);
  }

  // GitHub login
  githubLogin(req: Request, res: Response, next: NextFunction) {
    logger.info("Initiating GitHub login");
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  }

  githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "github",
      { session: false },
      async (err, user: IOAuthUserResponse | false, info) => {
        try {
          if (err || !user) {
            logger.warn("GitHub login failed", { error: err || info });
            return res.status(401).json({
              success: false,
              message: "GitHub login failed",
              error: err || info,
            });
          }

          const { user: userData, account } = user;
          logger.info("GitHub login successful", { email: userData.email });

          if (account.access_token) {
            res.cookie("accessToken", account.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 24 * 60 * 60 * 1000,
            });
          }
          res.redirect(`${FRONTEND_URL}/?login=success`);
          // res.json({
          //   success: true,
          //   data: userData,
          //   accessToken: account.access_token,
          // });
        } catch (error) {
          logger.error("GitHub callback error", { error });
          next(error);
        }
      },
    )(req, res, next);
  }

  // Logout
  logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      req.logout({ keepSessionInfo: false }, (err) => {
        if (err) {
          logger.error("Logout failed", { error: err });
          return next(err);
        }

        logger.info("User logged out successfully", {
          sessionId: req.sessionID,
        });
        res
          .status(200)
          .json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      logger.error("Logout exception", { error });
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Get refreshToken from cookie
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "No refresh token provided",
        });
      }

      // Verify refresh token
      const secret = process.env.JWT_REFRESH_SECRET!;
      let payload: any;
      try {
        payload = jwt.verify(refreshToken, secret);
      } catch (err) {
        logger.warn("Invalid refresh token", { error: err });
        return res.status(403).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Find user in DB
      const user: IUser | null = await userService.getUserById(payload.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: "15m" },
      );

      // Optional: refresh the refresh token as well
      const newRefreshToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" },
      );

      // Send tokens in cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info("Access token refreshed", { userId: user.id });

      res.json({
        success: true,
        data: { user },
        accessToken,
      });
    } catch (error) {
      logger.error("Refresh token error", { error });
      next(error);
    }
  }
}
