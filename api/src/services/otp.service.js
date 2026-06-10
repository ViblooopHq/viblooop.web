import * as OTPAuth from "otpauth";
import nodemailer from 'nodemailer';
import { OTP } from '../models/otp.model.js';
import dotenv from "dotenv";
import { otpTemplate } from "../template/gmail.template.js";

dotenv.config();

// 1. Setup Mailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * PRODUCTION OTP SERVICE
 */
class OtpService {
    constructor() {
        this.issuer = 'Viblooop-2';
        this.tokenExpiry = 300; // 5 Minutes
    }

    /**
     * GENERATE AND SEND
     */
    async generateAndSendOTP(email) {
        // Create a unique secret for this specific request
        const secret = new OTPAuth.Secret({ size: 20 });

        const totp = new OTPAuth.TOTP({
            issuer: this.issuer,
            label: email,
            algorithm: 'SHA1',
            digits: 4,
            period: this.tokenExpiry,
            secret: secret
        });

        const token = totp.generate();

        // Save secret to MongoDB (Upsert ensures one record per email)
        await OTP.findOneAndUpdate(
            { email },
            {
                secret: secret.base32,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Send Email
        const mailOptions = {
            from: `"Viblooop" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Your ${this.issuer} Verification Code`,
            html: otpTemplate(token)
        };

        return transporter.sendMail(mailOptions);
    }

    /**
     * VERIFY
     */
    async verifyOTPWithSecret(email, userEnteredOtp) {
        const record = await OTP.findOne({ email });

        if (!record) {
            throw new Error('OTP expired or not requested');
        }

        // Initialize TOTP with the stored secret
        const totp = new OTPAuth.TOTP({
            issuer: this.issuer,
            label: email,
            algorithm: 'SHA1',
            digits: 4,
            period: this.tokenExpiry,
            secret: OTPAuth.Secret.fromBase32(record.secret)
        });

        // Validate using window: 1 (allows for ± 5 mins clock drift/delay)
        const delta = totp.validate({
            token: userEnteredOtp,
            window: 1
        });

        // If delta is null, verification failed
        if (delta === null) {
            throw new Error('Invalid or expired code');
        }

        // SUCCESS: Delete OTP record immediately to prevent reuse (Replay Attack)
        await OTP.deleteOne({ email });

        return true;
    }
}

export const otpService = new OtpService();