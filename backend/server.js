require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute')


const app = express();

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/users", userRoute)
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
