
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Rating } from '../types';

// LAS CONSTANTES SOLICITADAS
export const URL_SUPABASE = 'https://sjngoernactzmqfqypnq.supabase.co'; 
export const KEY_SUPABASE = 'sb_publishable_RQqgzBaMkxHvSQijp3KK4A_dLPpaLQq'; 

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
      // Fix: Access error.message to avoid logging [object Object]
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
