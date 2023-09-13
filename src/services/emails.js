import nodemailer from 'nodemailer';
import { encryptQueryParam } from './queryParamsEncryption.js';

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: 'victor.quevedo.1801@gmail.com',
    pass: 'cslnbdulmehkyelm'
  }
});

export const sendRecoverEmail = async (userEmail, baseUrl, userId) => {
  const linkDurationMinutes = 60;
  const expiration = new Date().getTime() + linkDurationMinutes * 60 * 1000;

  const encryptedExpiration = encryptQueryParam(expiration.toString());
  const encryptedUserId = encryptQueryParam(userId.toString());

  const recoveryUrl = `${baseUrl}/passwordrestore?uid=${encryptedUserId}&et=${encryptedExpiration}`;

  await transport.sendMail({
    from: 'victor quevedo <victor.quevedo.1801@gmail.com>',
    to: userEmail,
    subject: 'Password Recovery',
    html: `
            <h1>Password Recovery</h1>
            <p>Enter <a href=${recoveryUrl}>this link</a> to recover your password</p>
            <p>The link will be available for only 1 hour</p>
        `
  });
};

export const sendRemovedProductEmail = async (product) => {
  await transport.sendMail({
    from: 'victor quevedo <victor.quevedo.1801@gmail.com>',
    to: product.owner,
    subject: 'Removed Product',
    html: `
            <h1>Removed Product</h1>
            <p>The following product of your own have been removed:</p>
            <ul>
              <li>Product: ${product.title}</li>
              <li>Code: ${product.code}</li>
            </ul>
        `
  });
};
