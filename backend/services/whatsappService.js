const axios = require("axios");

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Your Cloud API token
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // Your WhatsApp Cloud Phone Number ID

/**
 * Send WhatsApp message via Cloud API
 * @param {string} phone - Phone number with country code, e.g., 91XXXXXXXXXX
 * @param {string} message - Message to send
 */
async function sendWhatsAppMessage(phone, message) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error("WhatsApp Cloud API credentials not set");
  }

  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phone, // must include country code
    type: "text",
    text: { body: message },
  };

  try {
    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (err) {
    console.error("WhatsApp API error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendWhatsAppMessage };
