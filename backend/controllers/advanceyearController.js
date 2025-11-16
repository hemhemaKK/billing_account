const Year = require('../models/AdvanceYear');

// CREATE YEAR
exports.createYear = async (req, res, next) => {
  try {
    const { year } = req.body;

    if (!year) return res.status(400).json({ message: 'year is required' });

    const exists = await Year.findOne({ year });
    if (exists) return res.status(400).json({ message: 'Year already exists' });

    const y = await Year.create({ year });
    res.status(201).json(y);

  } catch (err) {
    next(err);
  }
};

// GET ALL YEARS
exports.getYears = async (req, res, next) => {
  try {
    const years = await Year.find().sort({ year: -1 });
    res.json(years);
  } catch (err) {
    next(err);
  }
};

// GET YEAR BY ID
exports.getYearById = async (req, res, next) => {
  try {
    const y = await Year.findById(req.params.yearId);

    if (!y) return res.status(404).json({ message: 'Year not found' });

    res.json(y);

  } catch (err) {
    next(err);
  }
};

// UPDATE YEAR
exports.updateYear = async (req, res, next) => {
  try {
    const { year } = req.body;

    const updated = await Year.findByIdAndUpdate(
      req.params.yearId,
      { year },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Year not found' });

    res.json(updated);

  } catch (err) {
    next(err);
  }
};

// DELETE YEAR
exports.deleteYear = async (req, res, next) => {
  try {
    const deleted = await Year.findByIdAndDelete(req.params.yearId);

    if (!deleted) return res.status(404).json({ message: 'Year not found' });

    res.json({ message: "Deleted" });

  } catch (err) {
    next(err);
  }
};
