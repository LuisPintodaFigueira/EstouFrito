import { supabase } from '../supabase/supabaseClient.js';

export async function inserirResumoDiario(total_vendas, total_vendas_pasteis, total_vendas_caldo_cana, lucro) {
  return await supabase
    .from('resumos_diarios')
    .insert({
      total_vendas: total_vendas,
      total_vendas_pasteis: total_vendas_pasteis,
      total_vendas_caldo_cana: total_vendas_caldo_cana,
      lucro: lucro,
    });
}

export async function buscarResumosDiarios() {
  return await supabase
    .from('resumos_diarios')
    .select('*')
    .order('criado_em', { ascending: false });
}