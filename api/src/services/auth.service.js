import jwt from "jsonwebtoken"
import BlacklistJwtToken from "../models/blacklistJwtToken.model.js"

async function generateTokens(user) {
    const accessToken = jwt.sign(
        user,
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '2h' }
    );
    const refreshToken = jwt.sign(
        user,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '15d' }
    );
    return { accessToken, refreshToken };
}

async function createJwtToken(user) {
    const key = process.env.JWT_SECRET;
    const metaData = {
        expiresIn: "15d",
    }

    return jwt.sign(user, key, metaData);
}

async function verifyJwtToken(token) {
    const key = process.env.JWT_SECRET;
    return jwt.verify(token, key);
}

async function verifyRefreshToken(token) {
    const key = process.env.JWT_REFRESH_SECRET;
    return jwt.verify(token, key);
}

async function calculateRemainingTime(token) {
    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) return 0;
    const expiresIn = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(expiresIn - currentTime, 0);
}

async function blacklistJwtToken(token) {
    const remainingTime = await calculateRemainingTime(token);

    const blacklistToken = new BlacklistJwtToken({
        token: token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + remainingTime * 1000)
    });

    await blacklistToken.save();

    // if (remainingTime > 0) {
    //     await redis.set(token, "blacklisted", "EX", remainingTime);
    // }
}

async function isTokenBlacklisted(token) {
    const blacklistToken = await BlacklistJwtToken.findOne({ token });
    return blacklistToken;
    // return await redis.get(token);
}

async function deleteBlacklistedToken(token) {
    const blacklistToken = await BlacklistJwtToken.findOne({ token });
    await blacklistToken.deleteOne();
    // await redis.del(token);
}

export {
    createJwtToken,
    verifyJwtToken,
    verifyRefreshToken,
    blacklistJwtToken,
    isTokenBlacklisted,
    deleteBlacklistedToken,
    generateTokens
}
