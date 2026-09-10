import { supabase } from '../supabase/supabaseClient.js';

export async function buscarGruposVenda() {
  return await supabase
    .from('grupos_venda')
    .select('*')
    .order('id', { ascending: true });
}

export async function inserirGrupoVenda(nome, produtos_ids) {
  return await supabase
    .from('grupos_venda')
    .insert({ nome: nome, produtos_ids: produtos_ids });
}

export async function deletarGrupoVenda(id) {
  return await supabase
    .from('grupos_venda')
    .delete()
    .eq('id', id);
}