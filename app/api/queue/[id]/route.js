import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/middleware/auth';
import { patients, queueLogs, users } from '../../../../lib/nedb';
import logger from '../../../../lib/logger';

export async function DELETE(request, { params }) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = params;

  try {
    const patient = await patients.findOne({
      _id: id,
      userId: auth.user.id,
      status: 'waiting', // only allow deleting waiting patients
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found or not waiting' },
        { status: 404 }
      );
    }

    await patients.remove({ _id: id });

    await queueLogs.insert({
      action: 'deleted',
      patientId: patient._id,
      userId: auth.user.id,
      details: `Token ${patient.token} deleted`,
    });

    logger.info(`Patient deleted: ${patient.token}`);

    return NextResponse.json({ message: 'Patient removed' });
  } catch (error) {
    logger.error('Delete patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status transition
    if (!status || !['waiting', 'serving', 'completed'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be waiting, serving, or completed' },
        { status: 400 }
      );
    }

    // Find the patient
    const patient = await patients.findOne({
      _id: id,
      userId: auth.user.id,
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Prevent invalid status transitions
    // Only allow: waiting -> serving, serving -> completed, waiting -> completed (emergency skip?)
    // For now, allow any transition but log it
    // In a more sophisticated system, you'd enforce business rules here

    await patients.update(
      { _id: id },
      { $set: { status } },
      {}
    );

    // Log the status change
    await queueLogs.insert({
      action: `status_changed_to_${status}`,
      patientId: patient._id,
      userId: auth.user.id,
      details: `Changed status from ${patient.status} to ${status} for token ${patient.token}`,
    });

    logger.info(`Patient status updated: ${patient.token} -> ${status}`);

    // Return updated patient
    const updatedPatient = await patients.findOne({ _id: id });
    return NextResponse.json(updatedPatient);
  } catch (error) {
    logger.error('Update patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}