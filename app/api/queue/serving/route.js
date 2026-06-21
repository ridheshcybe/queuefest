import { NextResponse } from 'next/server';
import { patients } from '../../../../lib/nedb';
import logger from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    const query = { status: 'serving' };
    if (userId) query.userId = userId;

    const serving = await patients.findOne(query);
    return NextResponse.json(serving);
  } catch (error) {
    logger.error('Serving error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}