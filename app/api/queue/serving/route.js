import { NextResponse } from 'next/server';
import { patients, queueLogs, users } from '../../../../lib/nedb';

export async function GET(request) {
  // No auth required for display? Actually we can allow public access for display.
  // But we need to know which clinic? For simplicity, we'll return the first serving patient globally.
  // In production, you'd scope by clinic/user.
  // Let's make it public for display.
  try {
    const serving = await patients.findOne({ status: 'serving' });
    return NextResponse.json(serving);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}