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
    const completedCount = await patients.count({
      userId: auth.user.id,
      status: 'completed',
    });

    const total = await patients.count({
      userId: auth.user.id,
    });

    const waiting = await patients.count({
      userId: auth.user.id,
        $in: ['waiting', 'serving'] ,
    });

    // Calculate average wait time from completed patients
    let averageWait = 0;
    if (completedCount > 0) {
      const completedPatients = await patients.find({
        where: {
          userId: auth.user.id,
          status: 'completed',
        },
      });

      const totalWaitMinutes = completedPatients.reduce((sum, patient) => {
        const created = patient.createdAt;
        const completed = patient.completedAt;
        if (created && completed) {
          const waitMs = completed - created;
          const waitMinutes = waitMs / 1000 / 60;
          return sum + waitMinutes;
        }
        return sum;
      }, 0);

      averageWait = totalWaitMinutes / completedCount;
    }

    return NextResponse.json({
      total,
      waiting,
      completed: completedCount,
      averageWait: Math.round(averageWait * 10) / 10, // one decimal place
    });
  } catch (error) {
    logger.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}