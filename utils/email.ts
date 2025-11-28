import { createTransport } from 'nodemailer';
import { env } from '../envSchema.ts';
import type { MailOptions } from 'nodemailer/lib/sendmail-transport/index.js';

export const sendEmail = async (options: Omit<MailOptions, 'from'>) => {
  const mailOptions = {
    from: env.EMAIL_SENDER_ADDRESS,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  const transporter = createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail(mailOptions);
};
