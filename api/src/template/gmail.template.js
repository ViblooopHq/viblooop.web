export const otpTemplate = (otp) => {
    return `
<body style="margin:0; padding:0; background:#F5F7FB; font-family:Arial, Helvetica, sans-serif; color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB; padding:32px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:22px; overflow:hidden; border:1px solid #E5E7EB; box-shadow:0 12px 30px rgba(15,23,42,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 32px 24px;">
              <div style="font-size:34px; font-weight:800; letter-spacing:1px; color:#5B2EFF;">
                Viblooop
              </div>
              <div style="margin-top:8px; font-size:15px; color:#6B7280;">
                Find your vibe. Join the moment.
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px; background:#E5E7EB;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding:36px 40px 16px;">
              <h1 style="margin:0; font-size:28px; line-height:1.3; color:#111827;">
                Verify your email
              </h1>

              <p style="margin:16px 0 0; font-size:16px; line-height:1.6; color:#4B5563;">
                Use the code below to continue signing in to your Viblooop account.
              </p>
            </td>
          </tr>

          <!-- OTP -->
          <tr>
            <td align="center" style="padding:24px 40px;">
              <div style="
                display:inline-block;
                padding:22px 36px;
                border-radius:18px;
                border:1px solid #C4B5FD;
                background:#F5F3FF;
                color:#5B2EFF;
                font-size:42px;
                font-weight:800;
                letter-spacing:12px;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Expiry Info -->
          <tr>
            <td align="center" style="padding:4px 40px 28px;">
              <p style="margin:0; font-size:15px; line-height:1.6; color:#4B5563;">
                This code is valid for <strong style="color:#111827;">10 minutes</strong>.<br />
                Please don’t share it with anyone.
              </p>
            </td>
          </tr>

          <!-- Security Box -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:16px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0; font-size:15px; line-height:1.6; color:#4B5563;">
                      🛡️ If you didn’t request this code, you can safely ignore this email.
                      Your account is still secure.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 32px 32px; border-top:1px solid #E5E7EB;">
              <p style="margin:0; font-size:13px; color:#6B7280;">
                © 2026 Viblooop. All rights reserved.
              </p>
              <p style="margin:8px 0 0; font-size:13px; color:#9CA3AF;">
                Social events. Real people. Real moments.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
    `
}