import { verifyToken, extractTokenFromRequest } from '../auth';
import { users } from '../nedb';
import logger from '../logger';

export async function withAuth(request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    logger.warn('No token provided');
    return { error: 'Unauthorized', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    logger.warn('Invalid token');
    return { error: 'Invalid token', status: 401 };
  }

  try {
    // Ensure userId is a number (or string) – findOne handles both
    const user = await users.findOne({ id: decoded.userId });
    if (!user) {
      logger.warn(`User not found for id: ${decoded.userId}`);
      return { error: 'User not found', status: 401 };
    }
    return { user, decoded };
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return { error: 'Internal server error', status: 500 };
  }
}