import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import CheckBox from 'expo-checkbox';
import { CabecalhoConfig, LinhaConfig, stylesTabelas } from '../tabelas/dados.js';

export function TelaConfigurarEstoque({
  estoque,
  quantidadesReposicao,
  precosEditados,
  salvandoEstoque,
  novoNome, setNovoNome,
  novoQuantidade, setNovoQuantidade,
  novoPreco, setNovoPreco,
  adicionandoProduto,
  gruposVenda,
  novoGrupoNome, setNovoGrupoNome,
  novoGrupoProdutosSelecionados,
  salvandoGrupo,
  alterarQuantidadeReposicao,
  alterarPrecoEditado,
  removerProduto,
  salvarConfiguracaoEstoque,
  adicionarNovoProduto,
  alternarProdutoNoNovoGrupo,
  salvarNovoGrupoVenda,
  removerGrupoVenda,
  voltar,
}) {

  let textoBotaoSalvarEstoque;
  if (salvandoEstoque) {
    textoBotaoSalvarEstoque = 'Salvando...';
  } else {
    textoBotaoSalvarEstoque = 'Salvar';
  }

  let textoBotaoAdicionarProduto;
  if (adicionandoProduto) {
    textoBotaoAdicionarProduto = 'Adicionando...';
  } else {
    textoBotaoAdicionarProduto = 'Adicionar produto';
  }

  let textoBotaoSalvarGrupo;
  if (salvandoGrupo) {
    textoBotaoSalvarGrupo = 'Salvando...';
  } else {
    textoBotaoSalvarGrupo = 'Salvar total';
  }

  return (
    <View style={stylesTabelas.relatorio}>
      <Text style={stylesTabelas.tituloRelatorio}>Configurar Estoque</Text>
      <Text style={stylesTabelas.textoRelatorio}>
        Use os botões para adicionar produtos recebidos e o campo de texto para atualizar o preço. As mudanças só valem depois de apertar "Salvar".
      </Text>

      <View style={stylesTabelas.tabelaContainer}>
        <CabecalhoConfig />
        <FlatList
          data={estoque}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          renderItem={function (objeto) {
            let novoPrecoValor;
            if (precosEditados[objeto.item.id] !== undefined) {
              novoPrecoValor = precosEditados[objeto.item.id];
            } else {
              novoPrecoValor = '';
            }
            return (
              <LinhaConfig
                item={objeto.item}
                quantidadeAdicionar={quantidadesReposicao[objeto.item.id] || 0}
                aoAlterarQuantidade={alterarQuantidadeReposicao}
                novoPreco={novoPrecoValor}
                aoAlterarPreco={alterarPrecoEditado}
                aoRemover={removerProduto}
              />
            );
          }}
          keyExtractor={function (item) { return item.id.toString(); }}
        />
      </View>

      <View style={stylesTabelas.formNovoProduto}>
        <Text style={stylesTabelas.tituloFormNovoProduto}>Adicionar novo produto</Text>

        <TextInput
          style={stylesTabelas.inputNovoProduto}
          placeholder="Nome do produto"
          value={novoNome}
          onChangeText={setNovoNome}
        />

        <TextInput
          style={stylesTabelas.inputNovoProduto}
          placeholder="Quantidade inicial"
          keyboardType="number-pad"
          value={novoQuantidade}
          onChangeText={setNovoQuantidade}
        />

        <TextInput
          style={stylesTabelas.inputNovoProduto}
          placeholder="Preço (lucro) por unidade"
          keyboardType="decimal-pad"
          value={novoPreco}
          onChangeText={setNovoPreco}
        />

        <TouchableOpacity
          style={[stylesTabelas.botao, adicionandoProduto && stylesTabelas.botaoDesabilitado]}
          onPress={adicionarNovoProduto}
          disabled={adicionandoProduto}
        >
          <Text style={stylesTabelas.textoBotao}>
            {textoBotaoAdicionarProduto}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={stylesTabelas.formNovoProduto}>
        <Text style={stylesTabelas.tituloFormNovoProduto}>Calcular totais</Text>
        <Text style={stylesTabelas.textoRelatorio}>
          Crie um total personalizado escolhendo um nome e quais produtos entram nele (ex: "Coxinha" somando "coxinha de frango" e "coxinha de carne").
        </Text>

        {gruposVenda.length === 0 && (
          <Text style={stylesTabelas.textoRelatorio}>Nenhum total personalizado criado ainda.</Text>
        )}

        {gruposVenda.map(function (grupo) {
          let sufixoProduto;
          if (grupo.produtos_ids.length === 1) {
            sufixoProduto = '';
          } else {
            sufixoProduto = 's';
          }
          return (
            <View key={grupo.id} style={stylesTabelas.linhaGrupoVenda}>
              <Text style={stylesTabelas.textoRelatorio}>
                {grupo.nome} ({grupo.produtos_ids.length} produto{sufixoProduto})
              </Text>
              <TouchableOpacity
                style={stylesTabelas.botaoRemoverProduto}
                onPress={function () { removerGrupoVenda(grupo.id, grupo.nome); }}
              >
                <Text style={stylesTabelas.textoBotaoSeletor}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={[stylesTabelas.tituloFormNovoProduto, { marginTop: 16 }]}>Novo total</Text>

        <TextInput
          style={stylesTabelas.inputNovoProduto}
          placeholder="Nome do total (ex: Coxinha)"
          value={novoGrupoNome}
          onChangeText={setNovoGrupoNome}
        />

        <Text style={stylesTabelas.textoRelatorio}>Marque os produtos que entram nesse total:</Text>

        {estoque.map(function (item) {
          return (
            <View key={item.id} style={stylesTabelas.linhaCheckboxProduto}>
              <CheckBox
                value={novoGrupoProdutosSelecionados.includes(item.id)}
                onValueChange={function () { alternarProdutoNoNovoGrupo(item.id); }}
              />
              <Text style={stylesTabelas.textoCheckboxProduto}>{item.nome}</Text>
            </View>
          );
        })}

        <TouchableOpacity
          style={[stylesTabelas.botao, salvandoGrupo && stylesTabelas.botaoDesabilitado]}
          onPress={salvarNovoGrupoVenda}
          disabled={salvandoGrupo}
        >
          <Text style={stylesTabelas.textoBotao}>
            {textoBotaoSalvarGrupo}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={stylesTabelas.linhaBotoesRodape}>
        <TouchableOpacity
          style={[stylesTabelas.botao, salvandoEstoque && stylesTabelas.botaoDesabilitado]}
          onPress={salvarConfiguracaoEstoque}
          disabled={salvandoEstoque}
        >
          <Text style={stylesTabelas.textoBotao}>{textoBotaoSalvarEstoque}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={stylesTabelas.botao} onPress={voltar}>
          <Text style={stylesTabelas.textoBotao}> Voltar </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}