import { verifyToken, extractTokenFromRequest } from '../auth';
import { patients, queueLogs, users } from '../nedb';

export async function withAuth(request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  const user = await users.findOne({ id: decoded.userId });
  if (!user) {
    return { error: 'User not found', status: 401 };
  }

  return { user, decoded };
}