const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

// Модели
const User = require('../models/User');
const Token = require('../models/Token');

// DTOs
const UserDto = require('../dtos/user.dto');

// Константы
const ACCESS_SECRET = config.get('JWT_ACCESS_SECRET');
const REFRESH_SECRET = config.get('JWT_REFRESH_SECRET');

class UsersController {
  // Регистрация +
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
      }

      const { username, password, lastName, firstName } = req.body;

      const candidate = await User.findOne({ username });
      if (candidate) {
        res.status(400).json({ message: 'User exists' });
        return;
      }

      const hash = await bcrypt.hash(password, 8);

      const user = await new User({
        username,
        firstName,
        lastName,
        password: hash,
      });
      user.save();
      const userDto = new UserDto(user);
      const accessToken = jwt.sign({ userDto }, ACCESS_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ userDto }, REFRESH_SECRET, {
        expiresIn: '30d',
      });

      await Token.create({ user: userDto.id, refreshToken });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.status(201).json({
        message: 'Successfully registered',
        user: userDto,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Авторизация +
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
      }

      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        res.status(400).json({ message: 'User does not exist' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ message: 'Invalid password' });
        return;
      }
      const userDto = new UserDto(user);
      const accessToken = jwt.sign({ userDto }, ACCESS_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ userDto }, REFRESH_SECRET, {
        expiresIn: '30d',
      });

      const tokenData = await Token.findOne({ user: userDto.id });
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        tokenData.save();
      } else {
        await Token.create({ user: userDto.id, refreshToken });
      }

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.status(200).json({
        message: 'Successfully logged in',
        user: userDto,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized!' });
      }
      const userData = jwt.verify(refreshToken, REFRESH_SECRET);
      const tokenFromDb = await Token.findOne({ refreshToken });
      if (!userData || !tokenFromDb) {
        return res.status(401).json({ message: 'Unauthorized!' });
      }
      const user = await User.findById(userData.userDto.id);
      const userDto = new UserDto(user);
      const signedAccessToken = jwt.sign({ userDto }, ACCESS_SECRET, {
        expiresIn: '15m',
      });
      const signedRefreshToken = jwt.sign({ userDto }, REFRESH_SECRET, {
        expiresIn: '30d',
      });

      const tokenData = await Token.findOne({ user: userDto.id });

      if (tokenData) {
        tokenData.refreshToken = signedRefreshToken;
        tokenData.save();
      } else {
        await Token.create({ user: userDto.id, signedRefreshToken });
      }

      res.cookie('refreshToken', signedRefreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json({
        user: userDto,
        accessToken: signedAccessToken,
        refreshToken: signedRefreshToken,
      });
    } catch (e) {
      return res.status(500).json({ message: 'Refresh token expired.' });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const token = await Token.deleteOne({ refreshToken });
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
}

module.exports = new UsersController();
