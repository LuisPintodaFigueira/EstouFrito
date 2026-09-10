import { View, Text, TouchableOpacity } from 'react-native';
import { stylesTabelas } from '../tabelas/dados.js';

export function TelaRegistros({
  pedidosDia,
  registros,
  carregandoRegistros,
  voltar,
}) {
  return (
    <View style={stylesTabelas.relatorio}>

      <Text style={stylesTabelas.tituloRelatorio}>Pedidos do dia</Text>

      {pedidosDia.length === 0 && (
        <Text style={stylesTabelas.textoRelatorio}>Nenhum pedido registrado ainda.</Text>
      )}

      {pedidosDia.map(function (pedido) {
        return (
          <View key={pedido.id} style={stylesTabelas.cardRegistro}>
            <Text style={stylesTabelas.textoRegistroData}>Pedido às {pedido.hora}</Text>

            {pedido.itens.map(function (item, index) {
              return (
                <Text key={index} style={stylesTabelas.textoRelatorio}>
                  {item.quantidade}x {item.nome}
                </Text>
              );
            })}

            <Text style={stylesTabelas.textoRelatorio}>
              Lucro do pedido: R$ {pedido.lucroPedido.toFixed(2)}
            </Text>
          </View>
        );
      })}

      <Text style={stylesTabelas.tituloRelatorio}>Registros Diários</Text>

      <View style={stylesTabelas.linhaBotoesRodape}>
        <TouchableOpacity style={stylesTabelas.botao} onPress={voltar}>
          <Text style={stylesTabelas.textoBotao}> Voltar </Text>
        </TouchableOpacity>
      </View>

      {carregandoRegistros && (
        <Text style={stylesTabelas.textoRelatorio}>Carregando...</Text>
      )}

      {!carregandoRegistros && registros.length === 0 && (
        <Text style={stylesTabelas.textoRelatorio}>Nenhum registro encontrado.</Text>
      )}

      {registros.map(function (registro) {
        return (
          <View key={registro.id} style={stylesTabelas.cardRegistro}>
            <Text style={stylesTabelas.textoRegistroData}>
              {new Date(registro.criado_em).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={stylesTabelas.textoRelatorio}>Total de vendas: {registro.total_vendas}</Text>
            <Text style={stylesTabelas.textoRelatorio}>Pastéis vendidos: {registro.total_vendas_pasteis}</Text>
            <Text style={stylesTabelas.textoRelatorio}>Caldo de cana vendido: {registro.total_vendas_caldo_cana}</Text>
            <Text style={stylesTabelas.textoRelatorio}>Lucro: R$ {(registro.lucro || 0).toFixed(2)}</Text>
          </View>
        );
      })}
    </View>
  );
}