import { View, Text, StyleSheet, SafeAreaView, Button, onPress, TouchableOpacity, TextInput } from 'react-native';
import CheckBox from 'expo-checkbox';

export const dadosIniciais = [
  {
    id: 1, nome: "pastel de carne", quantidade: 9, lucro: 8.00
  },
  {
    id: 2, nome: "pastel de queijo", quantidade: 0, lucro: 8.00
  },
  {
    id: 3, nome: "pastel de frango", quantidade: 9, lucro: 8.00
  },
  {
    id: 4, nome: "pastel de pizza", quantidade: 10, lucro: 8.00
  },
  {
    id: 5, nome: "pastel de salame", quantidade: 0, lucro: 8.00
  },
  {
    id: 6, nome: "pastel de carne com ovo", quantidade: 10, lucro: 8.00
  },
  {
    id: 7, nome: "pastel de carne com queijo", quantidade: 9, lucro: 8.00
  },
  {
    id: 8, nome: "caldo de cana 500ml", quantidade: 0, lucro: 6.00
  },
  {
    id: 9, nome: "caldo de cana 1L", quantidade: 0, lucro: 12.00
  },
  {
    id: 10, nome: "caldo de cana 2L", quantidade: 0, lucro: 25.00
  },

  {
    id: 11, nome: "refrigerante 350ml", quantidade: 20, lucro: 6.00
  },

  {
    id: 12, nome: "refrigerante 2L", quantidade: 7, lucro: 14.00
  }

];

export function Linha({ item, aoSelecionar, selecionado, quantidade, aoAlterarQuantidade, tabelaEstoque }) {
  let quantidadeExibida;
  if (item.quantidade !== undefined) {
    if (item.nome.toLowerCase().includes("caldo de cana")) {
      quantidadeExibida = '∞';
    } else {
      quantidadeExibida = item.quantidade;
    }
  } else {
    quantidadeExibida = item.quantidadeVendida;
  }

  let lucroExibido;
  if (item.lucro !== undefined) {
    lucroExibido = `R$ ${item.lucro.toFixed(2)}`;
  } else {
    lucroExibido = null;
  }

  return (
    <View style={[stylesTabelas.linha, tabelaEstoque && stylesTabelas.linhaEstoque]}>
      <Text style={[
        stylesTabelas.celulaHeader,
        tabelaEstoque && stylesTabelas.colNome,
        tabelaEstoque && stylesTabelas.celulaComBorda,
        tabelaEstoque && stylesTabelas.nomeProdutoTexto,
      ]}>
        {item.nome}
      </Text>

      <Text style={[
        stylesTabelas.celulaHeader,
        tabelaEstoque && stylesTabelas.colQuantidade,
        tabelaEstoque && stylesTabelas.celulaComBorda,
      ]}>
        {quantidadeExibida}
      </Text>

      <Text style={[
        stylesTabelas.celulaHeader,
        tabelaEstoque && stylesTabelas.colLucro,
        tabelaEstoque && stylesTabelas.celulaComBorda,
      ]}>
        {lucroExibido}
      </Text>

      {aoAlterarQuantidade && (
        <View style={stylesTabelas.seletor}>
          <TouchableOpacity
            style={[stylesTabelas.botaoSeletor, stylesTabelas.botaoSeletorMenos]}
            onPress={function () { aoAlterarQuantidade(item.id, -1); }}
          >
            <Text style={stylesTabelas.textoBotaoSeletor}>-</Text>
          </TouchableOpacity>

          <Text style={stylesTabelas.valorSeletor}>{quantidade}</Text>

          <TouchableOpacity
            style={[stylesTabelas.botaoSeletor, stylesTabelas.botaoSeletorMais]}
            onPress={function () { aoAlterarQuantidade(item.id, 1); }}
          >
            <Text style={stylesTabelas.textoBotaoSeletor}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {aoSelecionar && (
        <CheckBox
          value={selecionado}
          onValueChange={function () { aoSelecionar(item.id); }}
        />
      )}
    </View>
  );
}

export function Cabecalho({ tabelaEstoque }) {
  return (
    <View style={[stylesTabelas.linha, stylesTabelas.cabecalho]}>
      <Text
        style={[
          stylesTabelas.celulaHeader,
          tabelaEstoque && stylesTabelas.colNome,
          tabelaEstoque && stylesTabelas.celulaComBorda,
        ]}
      >
        Nome
      </Text>

      <Text
        style={[
          stylesTabelas.celulaHeader,
          tabelaEstoque && stylesTabelas.colQuantidade,
          tabelaEstoque && stylesTabelas.celulaComBorda,
        ]}
      >
        Quantidade
      </Text>

      <Text
        style={[
          stylesTabelas.celulaHeader,
          tabelaEstoque && stylesTabelas.colLucro,
        ]}
      >
        Lucro
      </Text>

      {tabelaEstoque && (
        <View style={stylesTabelas.espacadorSeletor} />
      )}
    </View>
  );
}

export function CabecalhoConfig() {
  return (
    <View style={[stylesTabelas.linha, stylesTabelas.cabecalho]}>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colNome, stylesTabelas.celulaComBorda]}>
        Nome
      </Text>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colQuantidade, stylesTabelas.celulaComBorda]}>
        Estoque
      </Text>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.celulaComBorda, stylesTabelas.espacadorSeletor]}>
        Adicionar
      </Text>
      <Text style={stylesTabelas.celulaHeader}>
        Novo preço
      </Text>
      <View style={stylesTabelas.espacadorBotaoRemover} />
    </View>
  );
}

export function LinhaConfig({ item, quantidadeAdicionar, aoAlterarQuantidade, novoPreco, aoAlterarPreco, aoRemover }) {
  const ehCaldoDeCana = item.nome.toLowerCase().includes("caldo de cana");

  let quantidadeExibida;
  if (ehCaldoDeCana) {
    quantidadeExibida = '∞';
  } else {
    quantidadeExibida = item.quantidade;
  }

  let seletorOuTraco;
  if (ehCaldoDeCana) {
    seletorOuTraco = <Text style={[stylesTabelas.celulaHeader, stylesTabelas.espacadorSeletor]}>—</Text>;
  } else {
    seletorOuTraco = (
      <View style={stylesTabelas.seletor}>
        <TouchableOpacity
          style={[stylesTabelas.botaoSeletor, stylesTabelas.botaoSeletorMenos]}
          onPress={function () { aoAlterarQuantidade(item.id, -1); }}
        >
          <Text style={stylesTabelas.textoBotaoSeletor}>-</Text>
        </TouchableOpacity>

        <Text style={stylesTabelas.valorSeletor}>{quantidadeAdicionar}</Text>

        <TouchableOpacity
          style={[stylesTabelas.botaoSeletor, stylesTabelas.botaoSeletorMais]}
          onPress={function () { aoAlterarQuantidade(item.id, 1); }}
        >
          <Text style={stylesTabelas.textoBotaoSeletor}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[stylesTabelas.linha, stylesTabelas.linhaEstoque]}>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colNome, stylesTabelas.celulaComBorda, stylesTabelas.nomeProdutoTexto]}>
        {item.nome}
      </Text>

      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colQuantidade, stylesTabelas.celulaComBorda]}>
        {quantidadeExibida}
      </Text>

      {seletorOuTraco}

      <TextInput
        style={stylesTabelas.inputPreco}
        keyboardType="decimal-pad"
        value={novoPreco}
        onChangeText={function (texto) { aoAlterarPreco(item.id, texto); }}
        placeholder={`R$ ${item.lucro.toFixed(2)}`}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={stylesTabelas.botaoRemoverProduto}
        onPress={function () { aoRemover(item.id, item.nome); }}
      >
        <Text style={stylesTabelas.textoBotaoSeletor}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export const stylesTabelas = StyleSheet.create({

  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },

  botaoSeletor: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoSeletorMenos: {
    backgroundColor: '#c62828',
  },

  botaoSeletorMais: {
    backgroundColor: '#2e7d32',
  },

  textoBotaoSeletor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  valorSeletor: {
    marginHorizontal: 6,
    fontSize: 15,
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  botao: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  botaoEncerrar: {
    backgroundColor: '#c62828',
  },

  botaoDesabilitado: {
    backgroundColor: '#a5a5a5',
    shadowOpacity: 0,
    elevation: 0,
  },

  textoBotao: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  linhaBotoesRodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 16,
    marginBottom: 10,
  },

  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },

  relatorio: {
    width: '90%',
    padding: 16,
    alignSelf: 'center',
  },

  tituloRelatorio: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  textoRelatorio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },

  tabelaContainer: {
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },

  linha: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },

  linhaEstoque: {
    paddingVertical: 10,
    alignItems: 'center',
  },

  cabecalho: {
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
    borderColor: '#333',
  },

  celula: {
    flex: 1,
    textAlign: 'center',
  },

  celulaHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  colId: {
    width: 22,
    fontSize: 13,
  },

  colNome: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 6,
    fontSize: 13,
  },

  nomeProdutoTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  colQuantidade: {
    width: 30,
    fontSize: 13,
  },

  colLucro: {
    width: 58,
    fontSize: 13,
  },

  celulaComBorda: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  espacadorSeletor: {
    width: 100,
  },

  cardRegistro: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },

  textoRegistroData: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },

  inputPreco: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
    marginLeft: 6,
  },

  formNovoProduto: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },

  tituloFormNovoProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  inputNovoProduto: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    marginBottom: 10,
  },

  botaoRemoverProduto: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c62828',
    marginLeft: 8,
  },

  espacadorBotaoRemover: {
    width: 42,
  },

  linhaGrupoVenda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  linhaCheckboxProduto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  textoCheckboxProduto: {
    marginLeft: 8,
    fontSize: 14,
  },

});