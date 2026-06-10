import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        function (accessToken, refreshToken, profile, cb) {
            try {
                if (!profile || !profile.id) {
                    return cb(new Error("No profile discovered from Google"), null);
                }

                const user = {
                    googleUserId: profile.id,
                    username: profile.displayName || "Anonymous",
                    email: (profile.emails && profile.emails.length > 0)
                        ? profile.emails[0].value
                        : null,
                    profileImage: (profile.photos && profile.photos.length > 0)
                        ? profile.photos[0].value
                        : null
                };

                return cb(null, user);
            } catch (error) {
                return cb(error, null);
            }
        }
    )
);

export default passport;