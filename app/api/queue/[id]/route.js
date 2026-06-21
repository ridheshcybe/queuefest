import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/middleware/auth';
import { patients, queueLogs } from '../../../../lib/nedb';
import logger from '../../../../lib/logger';

export async function DELETE(request, { params }) {
  const auth = await withAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = params;

  try {
    const patient = await patients.findOne({
      id: id,
      userId: auth.user.id,
      status: 'waiting',   // Only waiting patients can be deleted
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found or not waiting' },
        { status: 404 }
      );
    }

    await patients.remove({ id: id });

    await queueLogs.insert({
      action: 'deleted',
      patientId: patient.id,
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

    if (!status || !['waiting', 'serving', 'completed'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be waiting, serving, or completed' },
        { status: 400 }
      );
    }

    const patient = await patients.findOne({
      id: id,
      userId: auth.user.id,
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Business rules: only allow valid transitions
    const validTransitions = {
      waiting: ['serving'],
      serving: ['completed'],
      completed: [], // cannot change from completed
    };
    if (!validTransitions[patient.status]?.includes(status)) {
      return NextResponse.json(
        { message: `Cannot transition from ${patient.status} to ${status}` },
        { status: 400 }
      );
    }

    await patients.update(
      { id: id },
      { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      {}
    );

    await queueLogs.insert({
      action: `status_changed_to_${status}`,
      patientId: patient.id,
      userId: auth.user.id,
      details: `Changed status from ${patient.status} to ${status} for token ${patient.token}`,
    });

    logger.info(`Patient status updated: ${patient.token} -> ${status}`);

    const updatedPatient = await patients.findOne({ id: id });
    return NextResponse.json(updatedPatient);
  } catch (error) {
    logger.error('Update patient error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}