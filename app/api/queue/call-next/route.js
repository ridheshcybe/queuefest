import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/middleware/auth';
import { patients, queueLogs, users } from '../../../../lib/nedb';
import logger from '../../../../lib/logger';

export async function POST(request) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    // Find the next waiting patient (highest priority, then oldest)
    const waitingPatients = await patients.find({
      userId: auth.user.id,
      status: 'waiting',
    });

    const priorityWeight = {
      'Emergency': 3,
      'Urgent': 2,
      'Normal': 1,
    };

    waitingPatients.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) {
        return weightB - weightA; // Higher weight first
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    });

    const nextPatient = waitingPatients[0];

    if (!nextPatient) {
      return NextResponse.json(
        { message: 'No patients waiting' },
        { status: 404 }
      );
    }

    // Update patient to 'serving'
    await patients.update(
      { _id: nextPatient._id },
      { status: 'serving' },
      {}
    );

    // Log
    await queueLogs.insert({
      action: 'called',
      patientId: nextPatient._id,
      userId: auth.user.id,
      details: `Called ${nextPatient.token}`,
    });

    logger.info(`Called next patient: ${nextPatient.token}`);

    // Also ensure any other serving patient is set back to waiting? Not needed if we complete properly.
    return NextResponse.json(nextPatient);
  } catch (error) {
    logger.error('Call next error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}