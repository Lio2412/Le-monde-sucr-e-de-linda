import { NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { RegisterFormData } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const data: RegisterFormData = await request.json();

    const response = await apiClient.post('/auth/register', {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName
    });

    const { user, token } = response.data;

    return NextResponse.json({
      user,
      token
    });
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}