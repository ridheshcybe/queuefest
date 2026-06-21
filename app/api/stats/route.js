import { NextResponse } from 'next/server';
import { withAuth } from '../../../lib/middleware/auth';
import { patients, queueLogs, users } from '../../../lib/nedb';
import logger from '../../../lib/logger';

export async function GET(request) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const completed = await patients.count({
      userId: auth.user.id,
      status: 'completed',
    });

    const total = await patients.count({
      userId: auth.user.id,
    });

    const waiting = await patients.count({
      userId: auth.user.id,
      status: 'waiting',
    });

    return NextResponse.json({
      total,
      waiting,
      completed,
    });
  } catch (error) {
    logger.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}