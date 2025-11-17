const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const Ledger = require("../models/Ledger");

const {
  createEntry,
  getLedgerByUser,
  getEntry,
  deleteEntry,
  updateEntry,
  getAllUsersLedgerSummary,
  getLedgerSummary,
  getMonthlyLedgerSummary
} = require("../controllers/ledgerController");

const { sendWhatsAppMessage } = require('../services/whatsappService');

// -------------------
// STATIC / SPECIFIC ROUTES FIRST
// -------------------

// GET summary for all users
router.get('/summary-all', auth, getAllUsersLedgerSummary);

// GET monthly summary for a single user
router.get('/summary-monthly/:userId', auth, getMonthlyLedgerSummary);

// GET summary for a single user
router.get('/summary/:userId', auth, getLedgerSummary);

// GET single ledger entry
router.get('/single/:id', auth, getEntry);


// Send WhatsApp message for a ledger entry
router.post('/send-message/:ledgerId', auth, async (req, res, next) => {
  try {
    const ledger = await Ledger.findById(req.params.ledgerId).populate('userId');
    if (!ledger) return res.status(404).json({ msg: 'Ledger not found' });

    const userPhone = ledger.userId.phone; // must include country code, e.g., 91XXXXXXXXXX
    if (!userPhone) return res.status(400).json({ msg: 'User phone number not found' });

    const message = `Ledger Details:
Flower: ${ledger.flowerType || '-'}
Quantity: ${ledger.quantity || '-'} kg
Price: ${ledger.price || '-'}
Total: ${ledger.total || '-'}
Balance: ${ledger.balanceAtThatTime || '-'}
Date: ${ledger.date.toDateString()}`;

    await sendWhatsAppMessage(userPhone, message);

    ledger.sentMessage = { content: message, sentAt: new Date() };
    await ledger.save();

    res.json({ msg: 'WhatsApp message sent successfully' });
  } catch (err) {
    console.error("WhatsApp sending error:", err.message);
    next(err);
  }
});


// -------------------
// DYNAMIC ROUTES LAST
// -------------------

// CREATE ledger entry
router.post("/:userId", auth, createEntry);

// GET all ledger entries for a user
router.get("/:userId", auth, getLedgerByUser);

// DELETE a ledger entry
router.delete("/:id", auth, deleteEntry);

// UPDATE a ledger entry
router.put("/:id", auth, updateEntry);

module.exports = router;
