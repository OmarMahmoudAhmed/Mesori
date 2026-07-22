// scripts/seed.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // ده بيقرأ ملف .env

// هنا بنستخدم المفتاح السري (وده مش هيوصل للمتصفح أبداً)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // <- المفتاح السري
);
