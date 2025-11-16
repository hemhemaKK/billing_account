const Ledger = require('../models/Ledger');

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

// CREATE ENTRY (unchanged)
exports.createEntry = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { type, amount, flowerType, quantity, price, description } = req.body;

        if (!type) return res.status(400).json({ message: "Type is required" });

        let entryAmount;
        if (type === "credit") {
            if (!amount) return res.status(400).json({ message: "Amount required for credit" });
            entryAmount = Number(amount);
        } else if (type === "debit") {
            if (!flowerType || !quantity || !price) {
                return res.status(400).json({ message: "Flower type, quantity & price required for debit" });
            }
            entryAmount = Number(quantity) * Number(price);
        }

        const last = await Ledger.findOne({ userId }).sort({ date: -1 });
        const previousBalance = last ? last.balanceAtThatTime : 0;
        const newBalance = type === "credit" ? previousBalance + entryAmount : previousBalance - entryAmount;

        const entry = await Ledger.create({
            userId,
            type,
            amount: entryAmount,
            flowerType: type === "debit" ? flowerType : undefined,
            quantity: type === "debit" ? quantity : undefined,
            price: type === "debit" ? price : undefined,
            total: type === "debit" ? entryAmount : undefined,
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
        const { userId } = req.params;
        const entries = await Ledger.find({ userId }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        next(err);
    }
};

// GET SUMMARY
exports.getLedgerSummary = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const entries = await Ledger.find({ userId });

        let totalCredit = 0;
        let totalDebit = 0;

        for (let entry of entries) {
            if (entry.type === "credit") totalCredit += entry.amount;
            if (entry.type === "debit") totalDebit += entry.amount;
        }

        const balance = totalCredit - totalDebit;

        res.json({
            totalCredit,
            totalDebit,
            balance,
            count: entries.length
        });

    } catch (err) {
        next(err);
    }
};

// SINGLE ENTRY (unchanged)
exports.getEntry = async (req, res, next) => {
    try {
        const entry = await Ledger.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: "Not found" });
        res.json(entry);
    } catch (err) {
        next(err);
    }
};

// DELETE ENTRY (unchanged)
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

// UPDATE ENTRY (unchanged except recalcLedger)
exports.updateEntry = async (req, res, next) => {
    try {
        const { type, amount, flowerType, quantity, price, description } = req.body;

        let entryAmount;
        if (type === "credit") entryAmount = Number(amount);
        else entryAmount = Number(quantity) * Number(price);

        const updated = await Ledger.findByIdAndUpdate(
            req.params.id,
            {
                type,
                amount: entryAmount,
                flowerType: type === "debit" ? flowerType : undefined,
                quantity: type === "debit" ? quantity : undefined,
                price: type === "debit" ? price : undefined,
                total: type === "debit" ? entryAmount : undefined,
                description
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Entry not found" });

        await recalcLedger(updated.userId);

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// GET SUMMARY FOR ALL USERS
exports.getAllUsersLedgerSummary = async (req, res, next) => {
    try {
        // Aggregate ledger entries grouped by userId
        const summaries = await Ledger.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalCredit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0]
                        }
                    },
                    totalDebit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0]
                        }
                    },
                    lastBalance: { $last: "$balanceAtThatTime" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
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


// GET MONTHLY SUMMARY FOR ALL USERS
exports.getMonthlyLedgerSummary = async (req, res, next) => {
    try {
        const summaries = await Ledger.aggregate([
            {
                // Add month and year fields
                $addFields: {
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                }
            },
            {
                $group: {
                    _id: { userId: "$userId", month: "$month", year: "$year" },
                    totalCredit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0]
                        }
                    },
                    totalDebit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0]
                        }
                    },
                    lastBalance: { $last: "$balanceAtThatTime" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
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
