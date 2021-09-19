const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// json парсер & x-www-form-urlencoded &  cookie parser & cors
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: config.get('CLIENT_URL') }));

// Константы из config
const PORT = process.env.PORT || config.get('PORT') || 5000;
const MONGODB_URI = config.get('MONGODB_URI');

// Маршрутизация
app.use('/', require('./routes'));

// Start Function
// Подключение к базе и запуск сервера
const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    app.listen(PORT, () => {
      console.log(`App listening at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
