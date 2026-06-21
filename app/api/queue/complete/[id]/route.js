import { NextResponse } from 'next/server';
import { patients, queueLogs, resetDB } from '../../../../../lib/nedb';
import logger from '../../../../../lib/logger';

export async function POST(request, { params }) {
  const { id } = params;

  try {
    // Find the patient - ONLY allow completion if they are currently 'serving'
    // This prevents accidental completion of patients who are waiting or already completed
    const patient = await patients.findOne({
      id: id,
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
      { id: id },
      { status: 'completed', completedAt: new Date() },
      {}
    );

    // Get the updated patient data (with 'completed' status and completedAt timestamp)
    const updatedPatient = await patients.findOne({ id });

    // Log the completion action for audit trail
    await queueLogs.insert({
      action: 'completed',
      patientId: patient.id,
      details: `Completed ${patient.token}`,
    });

    logger.info(`Patient completed: ${patient.token}`);

    // Check if there are any remaining waiting or serving patients
    const remainingPatients = await patients.find({
      where: {
        status: { $in: ['waiting', 'serving'] },
      },
    });

    // If no more patients, reset the entire DB
    if (remainingPatients.length === 0) {
      resetDB();
      logger.info('All patients completed - DB reset to initial state');
    }

    return NextResponse.json(updatedPatient);
  } catch (error) {
    logger.error('Complete patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}