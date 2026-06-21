import { NextResponse } from 'next/server';
import { patients, queueLogs, users } from '../../../../lib/nedb';
import { tokenLookupSchema } from '../../../../lib/validation';
import logger from '../../../../lib/logger';

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  try {
    const { token: validToken } = tokenLookupSchema.parse({ token });

    const patient = await patients.findOne({ token: validToken });

    if (!patient) {
      return NextResponse.json(
        { message: 'Token not found' },
        { status: 404 }
      );
    }

    // Get queue position and estimated wait (simplified)
    const allWaiting = await patients.find({
      userId: patient.userId,
      status: 'waiting',
    });

    const priorityWeight = {
      'Emergency': 3,
      'Urgent': 2,
      'Normal': 1,
    };

    allWaiting.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) {
        return weightB - weightA; // Higher weight first
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    });

    const pos = allWaiting.findIndex(p => p._id === patient._id) + 1;
    const avgWait = 12; // could be dynamic
    const wait = pos * avgWait;

    return NextResponse.json({
      pos,
      wait,
      patient,
    });
  } catch (error) {
    if (error.name === 'ZodError' && error.errors && error.errors.length > 0) {
      const errorMessages = error.errors.map(err => err.message);
      return NextResponse.json(
        { message: errorMessages.join('. ') },
        { status: 400 }
      );
    }
    logger.error('Lookup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}