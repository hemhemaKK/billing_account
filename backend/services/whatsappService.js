const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

let client;

// Folder to store WhatsApp session tokens
const SESSION_DIR = path.join(__dirname, '_session');

async function initWhatsApp() {
  client = await wppconnect.create({
    session: 'mySession',              // session name, not folder path
    folderNameToken: '_session',       // folder to store session tokens
    catchQR: (qrCode, asciiQR, attempt, urlCode) => {
      console.log('Scan this QR to log in:');
      console.log(asciiQR);            // QR in terminal
    },
    statusFind: (statusSession, session) => {
      console.log('Status Session:', statusSession);
    },
    headless: true,
  });

  client.onMessage((message) => {
    console.log('Received WhatsApp message:', message.body);
  });

  console.log('WhatsApp initialized successfully!');
}

async function sendWhatsAppMessage(phone, message) {
  if (!client) throw new Error('WhatsApp client not initialized');

  const formattedPhone = phone.includes('@c.us') ? phone : `${phone}@c.us`;

  return await client.sendText(formattedPhone, message);
}

module.exports = { initWhatsApp, sendWhatsAppMessage };
