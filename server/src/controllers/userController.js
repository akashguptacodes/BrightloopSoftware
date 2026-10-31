import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { validatePassword } from '../utils/passwordValidation.js';

/**
 * @desc    Create a new staff user (ADMIN only)
 * @route   POST /api/users/staff
 */
export async function createStaff(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.errors.join('. '),
      });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with STAFF role
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Staff user created successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all users (ADMIN only)
 * @route   GET /api/users
 */
export async function getAllUsers(req, res, next) {
  try {
    // Support optional role filter via query params (?role=STAFF or ?role=STAFF&role=CUSTOMER)
    const { role } = req.query;
    const where = {};

    if (role) {
      // role can be a string or array of strings
      const roles = Array.isArray(role) ? role : [role];
      // Validate roles
      const validRoles = ['ADMIN', 'STAFF', 'CUSTOMER'];
      const filteredRoles = roles.filter((r) => validRoles.includes(r.toUpperCase()));

      if (filteredRoles.length > 0) {
        where.role = { in: filteredRoles.map((r) => r.toUpperCase()) };
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update user active status (ADMIN only)
 * @route   PATCH /api/users/:id/status
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate isActive is provided and is a boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value.',
      });
    }

    // Don't allow admin to deactivate themselves
    if (id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update only isActive status (no role changes through this endpoint)
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
