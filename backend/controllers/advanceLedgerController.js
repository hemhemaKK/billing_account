const Ledger = require('../models/AdvanceLedger');

// Helper: Recalculate entire ledger for a user
async function recalcLedger(userId) {
    const entries = await Ledger.find({ userId }).sort({ date: 1 });

    let balance = 0;
    for (let entry of entries) {
        balance += entry.type === "credit" ? entry.amount : -entry.amount;
        entry.balanceAtThatTime = balance;
        await entry.save({ validateBeforeSave: false });
    }
}

// CREATE ENTRY
exports.createEntry = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { type, amount, description } = req.body;

        if (!type) return res.status(400).json({ message: "Type is required" });
        if (!amount) return res.status(400).json({ message: "Amount is required" });

        const last = await Ledger.findOne({ userId }).sort({ date: -1 });
        const previousBalance = last ? last.balanceAtThatTime : 0;

        const entryAmount = Number(amount);
        const newBalance =
            type === "credit"
                ? previousBalance + entryAmount
                : previousBalance - entryAmount;

        const entry = await Ledger.create({
            userId,
            type,
            amount: entryAmount,
            description,
            date: new Date(),
            balanceAtThatTime: newBalance
        });

        res.status(201).json(entry);

    } catch (err) {
        next(err);
    }
};

// GET ALL ENTRIES
exports.getLedgerByUser = async (req, res, next) => {
    try {
        const entries = await Ledger.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        next(err);
    }
};

// GET SUMMARY
exports.getLedgerSummary = async (req, res, next) => {
    try {
        const entries = await Ledger.find({ userId: req.params.userId });

        let totalCredit = 0;
        let totalDebit = 0;

        for (let entry of entries) {
            if (entry.type === "credit") totalCredit += entry.amount;
            else totalDebit += entry.amount;
        }

        res.json({
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
            count: entries.length
        });

    } catch (err) {
        next(err);
    }
};

// GET SINGLE ENTRY
exports.getEntry = async (req, res, next) => {
    try {
        const entry = await Ledger.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: "Not found" });
        res.json(entry);
    } catch (err) {
        next(err);
    }
};

// DELETE ENTRY
exports.deleteEntry = async (req, res, next) => {
    try {
        const deleted = await Ledger.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Entry not found" });

        await recalcLedger(deleted.userId);
        res.json({ message: "Deleted" });

    } catch (err) {
        next(err);
    }
};

// UPDATE ENTRY
exports.updateEntry = async (req, res, next) => {
    try {
        const { type, amount, description } = req.body;

        const updated = await Ledger.findByIdAndUpdate(
            req.params.id,
            { type, amount, description },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Entry not found" });

        await recalcLedger(updated.userId);

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// SUMMARY OF ALL USERS
exports.getAllUsersLedgerSummary = async (req, res, next) => {
    try {
        const summaries = await Ledger.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalCredit: {
                        $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] }
                    },
                    totalDebit: {
                        $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] }
                    },
                    lastBalance: { $last: "$balanceAtThatTime" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "advanceusers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$user._id",
                    name: "$user.name",
                    phone: "$user.phone",
                    totalCredit: 1,
                    totalDebit: 1,
                    balance: "$lastBalance",
                    entryCount: "$count"
                }
            }
        ]);

        res.json(summaries);
    } catch (err) {
        next(err);
    }
};

// MONTHLY SUMMARY
exports.getMonthlyLedgerSummary = async (req, res, next) => {
    try {
        const summaries = await Ledger.aggregate([
            { $addFields: { month: { $month: "$date" }, year: { $year: "$date" } } },
            {
                $group: {
                    _id: { userId: "$userId", month: "$month", year: "$year" },
                    totalCredit: {
                        $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] }
                    },
                    totalDebit: {
                        $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] }
                    },
                    lastBalance: { $last: "$balanceAtThatTime" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "advanceusers",
                    localField: "_id.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$user._id",
                    name: "$user.name",
                    phone: "$user.phone",
                    month: "$_id.month",
                    year: "$_id.year",
                    totalCredit: 1,
                    totalDebit: 1,
                    balance: "$lastBalance",
                    entryCount: "$count"
                }
            },
            { $sort: { userId: 1, year: 1, month: 1 } }
        ]);

        res.json(summaries);
    } catch (err) {
        next(err);
    }
};
