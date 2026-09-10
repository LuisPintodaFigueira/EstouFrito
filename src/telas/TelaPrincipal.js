import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Cabecalho, Linha, stylesTabelas } from '../tabelas/dados.js';

export function TelaPrincipal({
  estoque,
  vendasDia,
  quantidades,
  lucro,
  gruposVenda,
  total,
  totalVendas,
  totalVendasPasteis,
  totalVendasCaldoCana,
  totaisPersonalizados,
  totalSelecionados,
  alterarQuantidade,
  venderSelecionados,
  resetarDia,
  irPara,
}) {
  return (
    <>
      <View style={stylesTabelas.relatorio}>
        <Text style={stylesTabelas.tituloRelatorio}>Relatório de Estoque</Text>
        <Text style={stylesTabelas.textoRelatorio}> Total de itens: {total} </Text>
      </View>

      <View style={stylesTabelas.tabelaContainer}>
        <Cabecalho tabelaEstoque></Cabecalho>
        <FlatList
          data={estoque}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          renderItem={function (objeto) {
            return (
              <Linha
                item={objeto.item}
                quantidade={quantidades[objeto.item.id] || 0}
                aoAlterarQuantidade={alterarQuantidade}
                tabelaEstoque
              />
            );
          }}
          keyExtractor={function (item) { return item.id.toString(); }}
        />
      </View>

      <View>
        <Text style={stylesTabelas.tituloRelatorio}>relatório de vendas</Text>
        <Text style={stylesTabelas.textoRelatorio}> total vendas: {totalVendas} </Text>
        <Text style={stylesTabelas.textoRelatorio}> total vendas pasteis: {totalVendasPasteis} </Text>
        <Text style={stylesTabelas.textoRelatorio}> total vendas caldo de cana: {totalVendasCaldoCana} </Text>
        {totaisPersonalizados.map(function (grupo) {
          return (
            <Text key={grupo.id} style={stylesTabelas.textoRelatorio}>
              {' '}total de vendas {grupo.nome}: {grupo.quantidade}{' '}
            </Text>
          );
        })}

        <Text style={stylesTabelas.textoRelatorio}> lucro: R$ {lucro.toFixed(2)} </Text>

        <View style={stylesTabelas.tabelaContainer}>
          <Cabecalho></Cabecalho>
          <FlatList
            data={vendasDia}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            renderItem={function (objeto) {
              return <Linha item={objeto.item}></Linha>
            }}
            keyExtractor={function (item) { return item.id.toString(); }}
          />
        </View>
      </View>

      <View style={stylesTabelas.linhaBotoesRodape}>
        <TouchableOpacity
          style={[stylesTabelas.botao, totalSelecionados === 0 && stylesTabelas.botaoDesabilitado]}
          onPress={venderSelecionados}
          disabled={totalSelecionados === 0}
        >
          <Text style={stylesTabelas.textoBotao}> Vender ({totalSelecionados}) </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[stylesTabelas.botao, stylesTabelas.botaoEncerrar]} onPress={resetarDia}>
          <Text style={stylesTabelas.textoBotao}> Encerrar o dia </Text>
        </TouchableOpacity>
      </View>

      <View style={stylesTabelas.linhaBotoesRodape}>
        <TouchableOpacity style={stylesTabelas.botao} onPress={function () { irPara('registros'); }}>
          <Text style={stylesTabelas.textoBotao}> Registros diários </Text>
        </TouchableOpacity>

        <TouchableOpacity style={stylesTabelas.botao} onPress={function () { irPara('configurarEstoque'); }}>
          <Text style={stylesTabelas.textoBotao}> Configurar estoque </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}