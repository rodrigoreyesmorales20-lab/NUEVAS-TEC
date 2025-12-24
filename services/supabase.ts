
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Rating } from '../types';

// LAS CONSTANTES SOLICITADAS
export const URL_SUPABASE = 'https://grkuifbhcmfuydfloygy.supabase.co'; 
export const KEY_SUPABASE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdya3VpZmJoY21mdXlkZmxveWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTQ3MDYsImV4cCI6MjA4MjE3MDcwNn0.s-Fq7MGFC8yI3msdonRR7cRqE_GooMvHZjNNC_XuoMI'; 
const supabase = (URL_SUPABASE && KEY_SUPABASE) 
  ? createClient(URL_SUPABASE, KEY_SUPABASE)
  : null;

export const fetchRatings = async (): Promise<Rating[]> => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('clasificacion')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ratings:', error.message);
      console.debug('Full Supabase error object:', error);
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.error('Unexpected exception in fetchRatings:', err.message || err);
    return [];
  }
};

export const saveRating = async (nombre: string, puntuacion: number): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return false;
  }
  try {
    const { error } = await supabase
      .from('clasificacion')
      .insert([{ nombre, puntuacion }]);
    
    if (error) {
      console.error('Error saving rating:', error.message);
      console.debug('Full Supabase error object:', error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Unexpected exception in saveRating:', err.message || err);
    return false;
  }
};

export const isConfigured = () => !!supabase;
