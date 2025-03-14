import { NextResponse } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(null);
    }

    try {
      const decoded = verify(token.value, JWT_SECRET) as any;
      
      // For testing purposes, we'll return a fixed response
      // In production, we would query the database
      return NextResponse.json({
        id: decoded.id,
        roles: ['ADMIN']
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('Error in session route:', error);
    return NextResponse.json(null);
  }
}

export async function POST() {
  try {
    // In a real application, you would validate credentials here
    // For testing purposes, we'll just create a session
    const token = sign({ id: 'admin-id' }, JWT_SECRET);
    
    const userData = {
      id: 'admin-id',
      roles: ['ADMIN']
    };
    
    const response = NextResponse.json(userData);

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(null);
  }
}
