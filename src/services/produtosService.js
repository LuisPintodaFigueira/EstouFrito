import { supabase } from '../supabase/supabaseClient.js';

export async function buscarProdutos() {
  return await supabase
    .from('produtos')
    .select('*')
    .order('id', { ascending: true });
}

export async function atualizarProduto(id, quantidade, lucro) {
  return await supabase
    .from('produtos')
    .update({ quantidade: quantidade, lucro: lucro })
    .eq('id', id);
}

export async function inserirProduto(id, nome, quantidade, lucro) {
  return await supabase
    .from('produtos')
    .insert({ id: id, nome: nome, quantidade: quantidade, lucro: lucro });
}

export async function deletarProduto(id) {
  return await supabase
    .from('produtos')
    .delete()
    .eq('id', id);
}