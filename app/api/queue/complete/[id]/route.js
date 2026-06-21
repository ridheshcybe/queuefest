import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/middleware/auth';
import { patients, queueLogs, users } from '../../../../../lib/nedb';
import logger from '../../../../../lib/logger';

export async function POST(request, { params }) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = params;

  try {
    // Find the patient - ONLY allow completion if they are currently 'serving'
    // This prevents accidental completion of patients who are waiting or already completed
    const patient = await patients.findOne({
      _id: id,
      userId: auth.user.id,
      status: 'serving',
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found or not serving - can only complete patients who are currently being served' },
        { status: 404 }
      );
    }

    // Explicitly set status to 'completed' - this is the ONLY way a patient should be marked as completed
    // Patients are NOT automatically completed when added or when served
    // Completion only happens when an admin explicitly clicks the "complete" button
    await patients.update(
      { _id: id },
      { status: 'completed' },
      {}
    );

    // Log the completion action for audit trail
    await queueLogs.insert({
      action: 'completed',
      patientId: patient._id,
      userId: auth.user.id,
      details: `Completed ${patient.token}`,
    });

    logger.info(`Patient completed: ${patient.token}`);

    return NextResponse.json(patient);
  } catch (error) {
    logger.error('Complete patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}