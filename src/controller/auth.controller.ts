import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { IGoogleUserResponse } from "model/user.model.js";

export class AuthController {

  googleLogin(req: Request, res: Response, next: NextFunction) {
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
      async (err, user: IGoogleUserResponse | false, info) => {
        try {
          if (err || !user) {
            return res.status(401).json({
              success: false,
              message: "Google login failed",
              error: err || info,
            });
          }

          // user now has accessToken
          const { accessToken, ...userData } = user;

          // Set cookie
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
          });

          // Send response
          res.json({ success: true, data: userData, accessToken });
        } catch (error) {
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
        if (err) return next(err);
        res
          .status(200)
          .json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      next(error);
    }
  }
}
