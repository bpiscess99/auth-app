const dotenv = require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const Task = require("./models/taskModel");
const taskRoutes = require("./routes/taskRoute")

const app = express();

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/tasks",taskRoutes);

// Routes
app.get('/', (req, res) => {
    res.send('home page')
  });

  mongoose.set('strictQuery', false);
  const PORT = process.env.PORT || 5000;
  

  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
}).catch((err) => console.log(err))
