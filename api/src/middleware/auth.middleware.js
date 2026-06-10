import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../services/auth.service.js";
import User from "../models/user/user.model.js";

export async function authMiddleware(req, res, next) {
  let token = req.cookies.access_token;
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  // check if token is blacklisted
  // if (await isTokenBlacklisted(token)) {
  //   return res.status(401).json({ error: "Token is blacklisted" });
  // }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

export async function checkIsAccountActive(req, res, next) {
  const user = await User.findById(req.user.id);
  if (!user.isActive) {
    return res.status(403).json({ error: "Account is not active" });
  }
  next();
}

// export async function authMiddleware(req, res, next) {
//   let token = req.header("Authorization")?.split(" ")[1];
//   if (!token)
//     return res.status(401).json({ msg: "No token, authorization denied" });

//   // check if token is blacklisted
//   if (await isTokenBlacklisted(token)) {
//     return res.status(401).json({ error: "Token is blacklisted" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ error: "Token expired" });
//       }
//       return res.status(403).json({ error: "Invalid token" });
//     }
//     req.user = user;
//     next();
//   });
// }
