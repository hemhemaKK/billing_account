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

// SEND WhatsApp message for a ledger entry using Cloud API
router.post('/send-message/:ledgerId', auth, async (req, res, next) => {
  try {
    const ledger = await Ledger.findById(req.params.ledgerId).populate('userId');
    if (!ledger) return res.status(404).json({ msg: 'Ledger not found' });

    const userPhone = ledger.userId.phone; // make sure it includes country code (e.g., 91XXXXXXXXXX)
    if (!userPhone) return res.status(400).json({ msg: 'User phone number not found' });

    const message = `Flower Details: ${ledger.flowerType || '-'}
kg: ${ledger.quantity || '-'}
Price: ${ledger.price || '-'}
Total: ${ledger.total || '-'}
Balance: ${ledger.balanceAtThatTime || '-'}
Date: ${ledger.date.toDateString()}`;

    await sendWhatsAppMessage(userPhone, message);

    // Optional: mark the ledger entry as "message sent"
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
