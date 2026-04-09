// we want to send emails to all the users (registration.type == new and )

import nodemailer from 'nodemailer';
export async function sendEmail(to: string, subject: string, html: string) {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // Replace with your SMTP server
        port: 587, // Replace with your SMTP port
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"UmuravaAI" <process.env.EMAIL_USER>', // sender address
        to,
        subject,
        html,
    });

    console.log('Message sent: %s', info.messageId); 