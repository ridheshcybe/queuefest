import { NextResponse } from 'next/server';
import { patients, queueLogs } from '../../../../lib/nedb';
import logger from '../../../../lib/logger';

export async function POST(request) {
  try {
    // Only fetch waiting patients
    const waitingPatients = await patients.find({
      where: {
        status: 'waiting',
      },
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
        return weightB - weightA;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
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
      { id: nextPatient.id },
      { status: 'serving' },
      {}
    );

    await queueLogs.insert({
      action: 'called',
      patientId: nextPatient.id,
      details: `Called ${nextPatient.token}`,
    });

    logger.info(`Called next patient: ${nextPatient.token}`);

    const updated = await patients.findOne({ id: nextPatient.id });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error('Call next error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}