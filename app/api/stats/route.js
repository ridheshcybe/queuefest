import { NextResponse } from 'next/server';
import { patients } from '../../../lib/nedb';
import logger from '../../../lib/logger';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId'); // optional clinic scope

    const baseQuery = userId ? { userId } : {};

    // Count completed
    const completedCount = await patients.count({
      ...baseQuery,
      status: 'completed',
    });

    const waitingCount = await patients.count({
      ...baseQuery,
      status: 'waiting',
    });

    // Average wait time (only if there are completed patients)
    let averageWait = 0;
    if (completedCount > 0) {
      const completedPatients = await patients.find({
        where: {
          ...baseQuery,
          status: 'completed',
        },
      });

      let totalWaitMinutes = 0;
      let validCount = 0;
      for (const patient of completedPatients) {
        const created = patient.createdAt;
        const completed = patient.completedAt;
        if (created && completed) {
          const waitMs = new Date(completed).getTime() - new Date(created).getTime();
          totalWaitMinutes += waitMs / 1000 / 60;
          validCount++;
        }
      }
      if (validCount > 0) {
        averageWait = totalWaitMinutes / validCount;
      } else {
        // Fallback: use a default if no valid timestamps
        averageWait = 12;
      }
    }

    return NextResponse.json({
      waiting: waitingCount,
      completed: completedCount,
      averageWait: Math.round(averageWait * 10) / 10,
    });
  } catch (error) {
    logger.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}