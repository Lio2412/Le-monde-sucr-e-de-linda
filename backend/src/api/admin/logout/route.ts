import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Déconnexion admin...');
    
    // Déconnexion de Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur lors de la déconnexion Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 500 }
      );
    }
    
    console.log('Déconnexion admin réussie');
    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
