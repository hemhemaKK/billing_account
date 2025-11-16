const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity
} = require('../controllers/cityController');

// CREATE CITY UNDER ADVANCE YEAR
router.post('/:advanceYearId', auth, createCity);

// GET CITIES UNDER ADVANCE YEAR
router.get('/:advanceYearId', auth, getCities);

// GET SINGLE CITY
router.get('/single/:cityId', auth, getCityById);

// UPDATE CITY
router.put('/:cityId', auth, updateCity);

// DELETE CITY
router.delete('/:cityId', auth, deleteCity);

module.exports = router;
