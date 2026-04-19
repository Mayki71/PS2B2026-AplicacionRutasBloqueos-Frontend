import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Example: fetch blockages reported near a coordinate
export const fetchBlockages = async (lat: number, lng: number, radiusKm = 2) => {
  const { data, error } = await supabase
    .from('blockages') // adjust table name as needed
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;
  return data;
};

// Example: save a new route search to history
export const saveRouteSearch = async (userId: string, origin: string, destination: string) => {
  const { data, error } = await supabase
    .from('route_searches')
    .insert([{ user_id: userId, origin, destination }]);

  if (error) throw error;
  return data;
};