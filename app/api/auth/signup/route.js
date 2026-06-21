import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { users } from '../../../../lib/nedb';
import { signToken } from '../../../../lib/auth';
import { signupSchema } from '../../../../lib/validation';
import logger from '../../../../lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clinicName, email, password } = signupSchema.parse(body);

    // Check if user exists
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.insert({
      clinicName,
      email,
      password: hashedPassword,
    });

    const token = signToken(user.id, user.email, user.clinicName);
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`New user registered: ${user.email}`);

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error.name === 'ZodError' && error.errors && error.errors.length > 0) {
      const errorMessages = error.errors.map(err => err.message);
      return NextResponse.json(
        { message: errorMessages.join('. ') },
        { status: 400 }
      );
    }
    logger.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}