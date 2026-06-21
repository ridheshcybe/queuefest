import { NextResponse } from 'next/server';
import { withAuth } from '../../../lib/middleware/auth';
import { patients, queueLogs, users } from '../../../lib/nedb';
import { addPatientSchema } from '../../../lib/validation';
import logger from '../../../lib/logger';

// Generate a 6-digit alphanumeric token (excluding confusing chars)
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function GET(request) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const patientsList = await patients.find({
      where: {
        userId: auth.user.id,
        status: { $in: ['waiting', 'serving'] },
      },
    });

    const priorityWeight = {
      'Emergency': 3,
      'Urgent': 2,
      'Normal': 1,
    };

    patientsList.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) {
        return weightB - weightA; // Higher weight first
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    });

    return NextResponse.json(patientsList);
  } catch (error) {
    logger.error('Queue list error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { name, priority } = addPatientSchema.parse(body);

    // Generate unique token
    let token = generateToken();
    let exists = await patients.findOne({ where: { token } });
    while (exists) {
      token = generateToken();
      exists = await patients.findOne({ where: { token } });
    }

    const patient = await patients.insert({
      token,
      name,
      priority,
      // Explicitly set status to 'waiting' when adding a patient
      // Patients are NOT automatically completed upon addition
      status: 'waiting',
      userId: auth.user.id,
      time: new Date().toLocaleTimeString(),
    });

    logger.info(`Patient added: ${patient.token} (${patient.name})`);

    // Optionally log to QueueLog
    await queueLogs.insert({
      action: 'added',
      patientId: patient.id,
      userId: auth.user.id,
      details: JSON.stringify({ name, priority }),
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error.name === 'ZodError' && error.errors && error.errors.length > 0) {
      const errorMessages = error.errors.map(err => err.message);
      return NextResponse.json(
        { message: errorMessages.join('. ') },
        { status: 400 }
      );
    }
    logger.error('Add patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}