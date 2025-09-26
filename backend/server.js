// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models/user'); // register model
const usersRouter = require('./routes/users');

const app = express();
app.use(cors()); // development: allow all origins. Production: batasi origin.
app.use(express.json());

app.use('/api/users', usersRouter);
app.get("/", (req, res) => {
  res.send("✅ Backend API running");
});


const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
    // sync only in dev. For production use migrations.
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  }
}
start();
