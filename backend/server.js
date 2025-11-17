require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const yearRoutes = require('./routes/yearRoutes');
const userRoutes = require('./routes/userRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const advanceyearRoutes = require('./routes/advanceyearRoutes');
const cityRoutes = require('./routes/cityRoutes'); // Cities
const advanceUserRoutes = require('./routes/advanceUserRoutes'); // Users under city
const advanceledgerRoutes = require('./routes/advanceLedgerRoutes');

// WhatsApp service
const { sendWhatsAppMessage } = require('./services/whatsappService');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // your frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ledger', ledgerRoutes);

// Advance routes
app.use('/api/advanceyears', advanceyearRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/advanceUsers', advanceUserRoutes);
app.use('/api/advanceledger', advanceledgerRoutes);

// WhatsApp test endpoint (optional, for testing)
app.post('/api/test-whatsapp', async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ msg: "Phone and message required" });

    const result = await sendWhatsAppMessage(phone, message);
    res.json({ msg: "Message sent", result });
  } catch (err) {
    console.error("WhatsApp send error:", err.message);
    next(err);
  }
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/yearcity')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("Ready to send WhatsApp messages using sandbox/test number");
  })
  .catch(err => {
    console.error('DB connect failed', err);
    process.exit(1);
  });
