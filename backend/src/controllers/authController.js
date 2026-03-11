const { body } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/apiResponse');

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('role').optional().isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, companyId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'User already exists with this email', 400);
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return ApiResponse.error(res, 'Company not found', 404);
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'Employee',
      company: companyId,
    });

    const token = generateToken(user._id);

    return ApiResponse.created(res, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      token,
    }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('company', 'name');
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account is deactivated', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return ApiResponse.success(res, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('company', 'name industry');
    return ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
};
