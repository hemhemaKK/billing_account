require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// routes
const adminRoutes = require('./routes/adminRoutes');
const yearRoutes = require('./routes/yearRoutes');
const userRoutes = require('./routes/userRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const advanceyearRoutes = require('./routes/advanceyearRoutes');
const cityRoutes = require('./routes/cityRoutes'); // Cities
const advanceUserRoutes = require('./routes/advanceUserRoutes'); // Users under city
const advanceledgerRoutes = require('./routes/advanceLedgerRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // allow your React app
  credentials: true
}));
app.use(express.json());

// ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/advanceyears', advanceyearRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/advanceUsers', advanceUserRoutes);
app.use('/api/advanceledger', advanceledgerRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/yearcity')
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => {
    console.error('DB connect failed', err);
    process.exit(1);
  });
