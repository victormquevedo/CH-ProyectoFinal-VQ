import crypto from 'crypto';
import config from '../utils/config.js';

const secretKey = config.ENCRYPT_QUERY_PARAM_KEY;
const iv = config.ENCRYPT_QUERY_INIT_VECTOR;

export const encryptQueryParam = (data) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

  return encryptedData;
};

export const decryptQueryParam = (encryptedData) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');

  return decryptedData;
};
