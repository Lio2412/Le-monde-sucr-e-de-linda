import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Vérifier si l'email existe
    const { data: subscription, error: checkError } = await supabase
      .from('newsletter')
      .select('email')
      .eq('email', email)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Cet email n\'est pas inscrit à la newsletter' },
        { status: 404 }
      );
    }

    // Mettre à jour l'inscription
    const { error } = await supabase
      .from('newsletter')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      throw new Error(`Erreur lors de la désinscription de la newsletter: ${error.message}`);
    }

    return NextResponse.json({
      message: 'Désinscription de la newsletter réussie'
    });
  } catch (error: any) {
    console.error('Erreur lors de la désinscription de la newsletter:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la désinscription de la newsletter' },
      { status: 500 }
    );
  }
}