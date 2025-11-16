const City = require('../models/City');

// CREATE CITY UNDER ADVANCE YEAR
exports.createCity = async (req, res, next) => {
  try {
    const { advanceYearId } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'City name required' });

    const city = await City.create({ advanceYearId, name });
    res.status(201).json(city);
  } catch (err) {
    next(err);
  }
};

// GET CITIES UNDER ADVANCE YEAR
exports.getCities = async (req, res, next) => {
  try {
    const { advanceYearId } = req.params;
    const cities = await City.find({ advanceYearId }).sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    next(err);
  }
};

// GET SINGLE CITY
exports.getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.cityId);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (err) {
    next(err);
  }
};

// UPDATE CITY
exports.updateCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.cityId, req.body, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (err) {
    next(err);
  }
};

// DELETE CITY
exports.deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.cityId);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
