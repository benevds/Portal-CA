// Importa a função de criar o cliente direto do CDN do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
/* =============================================================
 * ESTE É O ÚNICO LUGAR ONDE SUAS CHAVES VÃO FICAR
 * =============================================================
 */
const SUPABASE_URL = 'https://raguhvpkjhzffnpacmyo.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ3VodnBramh6ZmZucGFjbXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE3NzQsImV4cCI6MjA3ODQ1Nzc3NH0.XekO8B1Zf1DxhRLr3Cj0CAqt1Bv9j63L-mckanReOk0';
/* ============================================================= */

// Cria a conexão...
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ...E "exporta" ela para quem quiser usar
export { _supabase };