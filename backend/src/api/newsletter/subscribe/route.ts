import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Vérifier si l'email existe déjà
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter')
      .select('email')
      .eq('email', email)
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Cet email est déjà inscrit à la newsletter' },
        { status: 400 }
      );
    }

    // Créer l'inscription
    const { error } = await supabase
      .from('newsletter')
      .insert({
        email,
        is_active: true,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Erreur lors de l'inscription à la newsletter: ${error.message}`);
    }

    return NextResponse.json({
      message: 'Inscription à la newsletter réussie'
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'inscription à la newsletter' },
      { status: 500 }
    );
  }
}