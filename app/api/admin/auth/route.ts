import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  validateLogin,
  createSessionToken,
  verifySessionToken,
  saveCredentials,
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/auth';

// GET: Check if admin is currently authenticated
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const isValid = verifySessionToken(token);

    if (isValid) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Internal error' }, { status: 500 });
  }
}

// POST: Log in with username and password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Brugernavn og adgangskode skal udfyldes' },
        { status: 400 }
      );
    }

    const isValid = await validateLogin(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Ugyldigt brugernavn eller adgangskode' },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const response = NextResponse.json({
      success: true,
      message: 'Login gennemført',
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Der opstod en fejl under login' }, { status: 500 });
  }
}

// DELETE: Log out
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logget ud',
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}

// PUT: Change password
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!verifySessionToken(token)) {
      return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, username } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Både nuværende og ny adgangskode skal angives' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Ny adgangskode skal være mindst 8 tegn' },
        { status: 400 }
      );
    }

    // Verify current password first
    const isCurrentValid = await validateLogin(username || 'admin', currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Nuværende adgangskode er forkert' },
        { status: 400 }
      );
    }

    await saveCredentials(username || 'admin', newPassword);

    // Issue refreshed session cookie
    const newToken = createSessionToken(username || 'admin');
    const response = NextResponse.json({
      success: true,
      message: 'Adgangskoden er opdateret',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke ændre adgangskode' }, { status: 500 });
  }
}

