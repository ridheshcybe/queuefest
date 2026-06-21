import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';
import { loginSchema } from '../../../../lib/validation';
import logger from '../../../../lib/logger';
import { users } from '../../../../lib/nedb'

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = signToken(user.id, user.email, user.clinicName);
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

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
    logger.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}