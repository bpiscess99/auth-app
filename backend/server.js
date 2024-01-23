require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const bodyParser = require("body-parser")
const userRoute = require('./routes/userRoute');
const errorHandler = require("./middlewares/errorMiddleware");



const app = express();

// Middleware

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json())
app.use(cookieParser())

// Error Middleware
app.use(errorHandler)

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