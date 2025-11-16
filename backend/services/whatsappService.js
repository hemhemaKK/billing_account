const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

let client;

// Folder to store WhatsApp session
const SESSION_DIR = path.join(__dirname, '_session');

// Initialize WhatsApp
async function initWhatsApp() {
  client = await wppconnect.create({
    session: SESSION_DIR,        // folder to store session
    catchQR: (qrCode, asciiQR, attempt, urlCode) => {
      console.log('Scan this QR to log in:');
      console.log(qrCode); // or asciiQR for terminal
    },
    statusFind: (statusSession, session) => {
      console.log('Status Session:', statusSession);
    },
    headless: true,             // no browser window
  });

  client.onMessage((message) => {
    console.log('Received WhatsApp message:', message.body);
  });

  console.log('WhatsApp initialized successfully!');
}

// Send WhatsApp message
async function sendWhatsAppMessage(phone, message) {
  if (!client) throw new Error('WhatsApp client not initialized');

  // Ensure phone has country code, e.g., '91XXXXXXXXXX'
  const formattedPhone = phone.includes('@c.us') ? phone : `${phone}@c.us`;

  return await client.sendText(formattedPhone, message);
}

module.exports = {
  initWhatsApp,
  sendWhatsAppMessage,
};
