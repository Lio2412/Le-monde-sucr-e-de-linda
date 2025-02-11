import { NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { LoginFormData } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const data: LoginFormData = await request.json();

    const response = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });

    const { user, token } = response.data;

    return NextResponse.json({
      user,
      token
    });
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erreur lors de la connexion';
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}