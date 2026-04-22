import nodemailer from "nodemailer";
import { env } from "../config/env";

const transportOptions: any = {
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
};

if (env.EMAIL_SERVICE) {
  if (env.EMAIL_SERVICE.includes(".")) {
    transportOptions.host = env.EMAIL_SERVICE;
    transportOptions.port = Number(env.EMAIL_PORT) || 587;
    transportOptions.secure = env.EMAIL_SECURE === "true";
  } else {
    transportOptions.service = env.EMAIL_SERVICE;
  }
} else if (env.EMAIL_HOST) {
  transportOptions.host = env.EMAIL_HOST;
  transportOptions.port = Number(env.EMAIL_PORT) || 587;
  transportOptions.secure = env.EMAIL_SECURE === "true";
}

const transporter = nodemailer.createTransport(transportOptions);

const brand = {
  background: "#eef8ff",
  card: "#ffffff",
  border: "rgba(56, 160, 255, 0.14)",
  primary: "#1298f0",
  primaryDark: "#0e609f",
  text: "#16324f",
  muted: "#47617d",
};

const buildEmailHtml = (headline: string, message: string, actionText?: string, actionUrl?: string) => `
<html lang="en">
  <body style="margin:0;padding:0;background:${brand.background};font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${brand.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.background};padding:24px 0;min-height:100vh;width:100%;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:${brand.card};border:1px solid ${brand.border};border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(48,120,187,0.12);">
            <tr>
              <td style="background:${brand.primary};padding:32px 40px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.02em;">${headline}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;color:${brand.text};">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:${brand.muted};">${message}</p>
                ${actionText && actionUrl ? `<p style="text-align:center;margin:32px 0 0;"><a href="${actionUrl}" style="display:inline-block;padding:14px 28px;background:${brand.primary};color:#ffffff;border-radius:12px;text-decoration:none;font-weight:600;box-shadow:0 10px 20px rgba(18,152,240,0.18);">${actionText}</a></p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;color:${brand.muted};font-size:14px;line-height:1.7;">
                <p style="margin:0;">If you have questions, reply to this email and our support team will help.</p>
                <p style="margin:24px 0 0;font-weight:600;color:${brand.text};">Best regards,<br />The UmuravaAI Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// register email
export const sendRegistrationEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Welcome to UmuravaAI!",
        html: buildEmailHtml(
          `Welcome to UmuravaAI, ${name}!`,
          `Thank you for registering at UmuravaAI! We're excited to have you on board, and we're here to support you as you explore job opportunities and career growth.`,
          "Visit your dashboard",
          env.corsOrigin || "#"
        ),
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

// password reset email
export const sendPasswordResetEmail = async (to: string, name: string, resetLink: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Password Reset Request",
        html: buildEmailHtml(
          "Password reset request",
          `We received a request to reset your password for your UmuravaAI account. Click the button below to securely choose a new password. If you did not request this, please ignore this email.`,
          "Reset password",
          resetLink
        ),
    };
    try{
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

// email verification
export const sendEmailVerificationEmail = async (to: string, name: string, verificationLink: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Email Verification",
        html: buildEmailHtml(
          "Verify your email address",
          `Thank you for joining UmuravaAI, ${name}! Please confirm your email address to activate your account and continue using our talent matching tools.`,
          "Verify email",
          verificationLink
        ),
    };
    await transporter.sendMail(mailOptions);
};

// recruited email ( will be sent when a user applied for  a job and got recruited or came in top ten for all users in this range but will depend on the recruiter's consent to send them an email or not)
export const sendRecruitedEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Congratulations! You've been recruited by UmuravaAI!",
        html: buildEmailHtml(
          "You’ve been recruited!",
          `Congratulations ${name}! You've been selected by UmuravaAI. We're excited for the next steps and will contact you soon with more details.`,
          "View offer",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

// application received email ( will be sent when a user applied for a job and got recruited or came in top ten for all users in this range but will depend on the recruiter's consent to send them an email or not)
export const sendApplicationReceivedEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Your application has been received by UmuravaAI!",
        html: buildEmailHtml(
          "Application received",
          `Thanks for applying, ${name}! We've received your submission and our team is reviewing it. We'll update you as soon as we have news.`,
          "Check status",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

// application rejected email ( will be sent when a user applied for a job and got rejected or came in top ten for all users in this range but will depend on the recruiter's consent to send them an email or not)
export const sendApplicationRejectedEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Your application has been rejected by UmuravaAI",
        html: buildEmailHtml(
          "Application update",
          `Hi ${name}, thank you for applying. We reviewed your submission and it was not selected at this time. Please keep an eye out for future roles that may fit your experience.`,
          "Browse jobs",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

// application shortlisted email ( will be sent when a user applied for a job and got shortlisted or came in top ten for all users in this range but will depend on the recruiter's consent to send them an email or not)
export const sendApplicationShortlistedEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Your application has been shortlisted by UmuravaAI!",
        html: buildEmailHtml(
          "You’ve been shortlisted!",
          `Great news, ${name}! Your application has been shortlisted and our team will continue the review process. We'll share next steps very soon.`,
          "View application",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

// application accepted email ( will be sent when a user applied for a job and got accepted or came in top ten for all users in this range but will depend on the recruiter's consent to send them an email or not)
export const sendApplicationAcceptedEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Congratulations! Your application has been accepted by UmuravaAI!",
        html: buildEmailHtml(
          "Application accepted",
          `Fantastic news, ${name}! Your application has been accepted by UmuravaAI. We'll follow up with the next steps shortly.`,
          "See details",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

// unrecognized login attempt email ( will be sent when a user tries to login with an unrecognized device or location)
export const sendUnrecognizedLoginAttemptEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: "Unrecognized Login Attempt Detected on Your UmuravaAI Account",
        html: buildEmailHtml(
          "Security alert",
          `We detected an unrecognized login attempt on your UmuravaAI account, ${name}. If this was not you, please change your password immediately and review your account activity.`,
          "Review your account",
          env.corsOrigin || "#"
        ),
    };
    await transporter.sendMail(mailOptions);
};

