import { View, Text, StyleSheet, SafeAreaView, Button, onPress, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import CheckBox from 'expo-checkbox';

// Largura da tela do celular (limitada a 430 para não ficar gigante em tablet ou navegador)
const larguraTela = Math.min(Dimensions.get('window').width, 430);
// Largura de TODAS as tabelas: a tela inteira, com 2px de folga de cada lado
const larguraTabela = larguraTela - 4;

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
        !tabelaEstoque && stylesTabelas.colNomeVendas,
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
          !tabelaEstoque && stylesTabelas.colNomeVendas,
          stylesTabelas.textoCabecalho,
        ]}
      >
        Nome
      </Text>

      <Text
        style={[
          stylesTabelas.celulaHeader,
          tabelaEstoque && stylesTabelas.colQuantidade,
          tabelaEstoque && stylesTabelas.celulaComBorda,
          stylesTabelas.textoCabecalho,
        ]}
      >
        Quantidade
      </Text>

      <Text
        style={[
          stylesTabelas.celulaHeader,
          tabelaEstoque && stylesTabelas.colLucro,
          stylesTabelas.textoCabecalho,
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
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colNome, stylesTabelas.celulaComBorda, stylesTabelas.textoCabecalho]}>
        Nome
      </Text>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colEstoqueConfig, stylesTabelas.celulaComBorda, stylesTabelas.textoCabecalho]}>
        Estoque
      </Text>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.celulaComBorda, stylesTabelas.espacadorSeletor, stylesTabelas.textoCabecalho]}>
        Adicionar
      </Text>
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colPrecoConfig, stylesTabelas.textoCabecalho]}>
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
      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colNome, stylesTabelas.celulaComBorda, stylesTabelas.nomeProdutoTexto, stylesTabelas.nomeProdutoTextoConfig]}>
        {item.nome}
      </Text>

      <Text style={[stylesTabelas.celulaHeader, stylesTabelas.colEstoqueConfig, stylesTabelas.celulaComBorda]}>
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
        style={stylesTabelas.botaoRemoverTabela}
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
    width: 36,
    height: 36,
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
    marginHorizontal: 3,
    fontSize: 17,
    minWidth: 22,
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
    width: larguraTabela,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },

  linha: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
  },

  linhaEstoque: {
    paddingVertical: 14,
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
    fontSize: 16,
  },

  colId: {
    width: 22,
    fontSize: 13,
  },

  colNome: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 4,
    fontSize: 14,
  },

  nomeProdutoTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  colQuantidade: {
    flex: 0,
    width: 80,
    fontSize: 17,
  },

  colLucro: {
    flex: 0,
    width: 68,
    fontSize: 15,
  },

  // --- estilos novos, usados só dentro das tabelas ---

  colNomeVendas: {
    flex: 2,
  },

  textoCabecalho: {
    fontSize: 14,
  },

  nomeProdutoTextoConfig: {
    fontSize: 15,
  },

  colEstoqueConfig: {
    flex: 0,
    width: 56,
    fontSize: 16,
  },

  colPrecoConfig: {
    flex: 0,
    width: 68,
  },

  botaoRemoverTabela: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c62828',
    marginLeft: 4,
  },

  celulaComBorda: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  espacadorSeletor: {
    flex: 0,
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
    width: 64,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 2,
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 4,
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
    width: 40,
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