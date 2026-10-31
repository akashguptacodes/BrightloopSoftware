import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate a JWT access token for a user.
 * @param {object} user - User object with id, email, role
 * @returns {string} JWT token
 */
export function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Generate a random reset token and its SHA-256 hash.
 * @returns {{ token: string, tokenHash: string }}
 */
export function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  return { token, tokenHash };
}
