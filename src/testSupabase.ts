import { supabase } from "./services/supabaseClient";

export const testConnection = async () => {
  const { data, error } = await supabase
    .from("test")
    .select("*");

  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    console.log("✅ Conexión exitosa:", data);
  }
};