import { ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { stylesTabelas } from './src/tabelas/dados.js';
import { useAppState } from './src/hooks/useAppState.js';
import { TelaPrincipal } from './src/telas/TelaPrincipal.js';
import { TelaConfigurarEstoque } from './src/telas/TelaConfigurarEstoque.js';
import { TelaRegistros } from './src/telas/TelaRegistros.js';

function ConteudoApp() {

  const insets = useSafeAreaInsets();

  const [estoque, setEstoque] = useState([]);
  const [vendasDia, setVendasDia] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [lucro, setLucro] = useState(0);
  const [carregandoEstoque, setCarregandoEstoque] = useState(true);

  const [tela, setTela] = useState('principal');

  const app = useAppState(tela);
  const [quantidadesReposicao, setQuantidadesReposicao] = useState({});

  const [precosEditados, setPrecosEditados] = useState({});
  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoQuantidade, setNovoQuantidade] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [adicionandoProduto, setAdicionandoProduto] = useState(false);


  const [gruposVenda, setGruposVenda] = useState([]);
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [novoGrupoProdutosSelecionados, setNovoGrupoProdutosSelecionados] = useState([]);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);

  async function buscarEstoque() {
    setCarregandoEstoque(true);

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.log('erro ao buscar estoque: ', error.message);
      Alert.alert('Erro ao carregar estoque', error.message);
    } else {

      const estoqueFormatado = data.map(function (item) {
        return {
          id: item.id,
          nome: item.nome,
          quantidade: Number(item.quantidade),
          lucro: Number(item.lucro),
        };
      });

      setEstoque(estoqueFormatado);

      setVendasDia(function (vendasAtual) {
        return estoqueFormatado.map(function (item) {
          const vendaExistente = vendasAtual.find(function (v) { return v.id === item.id; });
          return {
            id: item.id,
            nome: item.nome,
            quantidadeVendida: vendaExistente ? vendaExistente.quantidadeVendida : 0,
          };
        });
      });
    }

    setCarregandoEstoque(false);
  }

  async function buscarGruposVenda() {
    const { data, error } = await supabase
      .from('grupos_venda')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.log('erro ao buscar totais personalizados: ', error.message);
    } else {
      setGruposVenda(data);
    }
  }

  useEffect(function () {
    buscarEstoque();
    buscarGruposVenda();
  }, []);

  function alterarQuantidade(id, delta) {
    const itemEstoque = estoque.find(function (item) { return item.id === id; });
    const ehInfinito = itemEstoque && itemEstoque.nome.toLowerCase().includes("caldo de cana");

    if (itemEstoque && !ehInfinito && itemEstoque.quantidade === 0) {
      if (delta > 0) {
        Alert.alert('Estoque zerado', 'não possível adicionar, zero produtos');
      }
      return;
    }

    setQuantidades(function (atual) {
      const quantidadeAtual = atual[id] || 0;
      let novaQuantidade = quantidadeAtual + delta;
      if (novaQuantidade < 0) {
        novaQuantidade = 0;
      }
      return { ...atual, [id]: novaQuantidade };
    });
  }

  function calcularLucro(lucroAtual, id, quantidade) {
    const itemVendido = estoque.find(function (item) {
      return item.id === id;
    });
    if (itemVendido) {
      const lucroUnitario = itemVendido.lucro !== undefined ? itemVendido.lucro : 0;
      return lucroAtual + (lucroUnitario * quantidade);
    }
    return lucroAtual;
  }

  async function estoqueProd(id, quantidade) {
    const itemAtual = estoque.find(function (item) { return item.id === id; });
    const ehCaldoDeCana = itemAtual && itemAtual.nome.toLowerCase().includes("caldo de cana");

    let novaQuantidade = itemAtual ? itemAtual.quantidade : 0;
    if (itemAtual && !ehCaldoDeCana) {
      novaQuantidade = itemAtual.quantidade - quantidade;
      if (novaQuantidade < 0) {
        novaQuantidade = 0;
      }
    }

    setEstoque(function (estoqueAtual) {
      const novoEstoque = [];
      for (let i = 0; i < estoqueAtual.length; i++) {
        const item = estoqueAtual[i];
        if (item.id === id) {
          if (item.nome.toLowerCase().includes("caldo de cana")) {
            novoEstoque.push(item);
          } else {
            novoEstoque.push({ id: item.id, nome: item.nome, quantidade: novaQuantidade, lucro: item.lucro });
          }
        } else {
          novoEstoque.push(item);
        }
      }
      return novoEstoque;
    });

    if (itemAtual && !ehCaldoDeCana) {
      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', id);

      if (error) {
        console.log('erro ao dar baixa no estoque: ', error.message);
        Alert.alert('Erro ao salvar venda no estoque', error.message);
      }
    }
  }

  async function savlvarResumoDia() {
    const { error } = await supabase
      .from('resumos_diarios')
      .insert({
        total_vendas: totalVendas,
        total_vendas_pasteis: totalVendasPasteis,
        total_vendas_caldo_cana: totalVendasCaldoCana,
        lucro: lucro,
      })

      if (error) {
        console.log('erro ao salvar resumo: ', error.message)
        Alert.alert('Erro ao salvar resumo do dia', error.message)
      }
  }

  async function buscarRegistros() {
    setCarregandoRegistros(true);

    const { data, error } = await supabase
      .from('resumos_diarios')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.log('erro ao buscar registros: ', error.message);
    } else {
      setRegistros(data);
    }

    setCarregandoRegistros(false);
  }

  useEffect(function () {
    if (tela === 'registros') {
      buscarRegistros();
    }
  }, [tela]);

  async function resetarDia() {
    await savlvarResumoDia();

    const vendasZeradas = [];

    for (const item of estoque) {
      vendasZeradas.push({id: item.id, nome: item.nome, quantidadeVendida: 0});
    }

    setVendasDia(vendasZeradas);
    setLucro(0);
    setQuantidades({});
    setPedidosDia([]);
  }

  function vendasProd(id, quantidade) {
    setVendasDia(function (vendasAtual) {
      const novaVenda = [];
      for (let i = 0; i < vendasAtual.length; i++) {
        const item = vendasAtual[i];
        if (item.id === id) {
          const novaQuantidadeVendida = item.quantidadeVendida + quantidade;

          const produtoOriginal = estoque.find(function (p) {
            return p.id === id;
          });
          const lucroUnitario = produtoOriginal && produtoOriginal.lucro !== undefined ? produtoOriginal.lucro : 0;
          novaVenda.push({
            id: item.id,
            nome: item.nome,
            quantidadeVendida: novaQuantidadeVendida,
            lucro: lucroUnitario * novaQuantidadeVendida
          });
        } else {
          novaVenda.push(item);
        }
      }
      return novaVenda;
    })
  }

  const totalVendasPasteis = vendasDia.filter(function (item) {
    return item.nome.toLowerCase().includes("pastel");
  })
  .reduce(function (soma, item) {
  return soma + item.quantidadeVendida;
  }, 0);

  const totalVendasCaldoCana = vendasDia.filter(function (item) {
    return item.nome.toLowerCase().includes("caldo de cana");
  })
  .reduce(function (soma, item) {
    return soma + item.quantidadeVendida;
  }, 0);

  const totalVendas = vendasDia.reduce(function (soma, item) {
    return soma + item.quantidadeVendida;
  }, 0);

  const totaisPersonalizados = gruposVenda.map(function (grupo) {
    const quantidade = vendasDia
      .filter(function (item) { return grupo.produtos_ids.includes(item.id); })
      .reduce(function (soma, item) { return soma + item.quantidadeVendida; }, 0);

    return { id: grupo.id, nome: grupo.nome, quantidade: quantidade };
  });

  let total = 0;
  for (const item of estoque) {
    if (!item.nome.toLowerCase().includes("caldo de cana")) {
      total = total + item.quantidade;
    }
  }

  useEffect(function () {

    if (!carregandoEstoque && total === 0) {
      Alert.alert('Produtos esgotados', 'Os produtos acabaram, é preciso reabastecer o estoque.');
    }
  }, [total, carregandoEstoque]);

  const totalSelecionados = Object.values(quantidades).filter(function (quantidade) {
    return quantidade > 0;
  }).length;

  function registrarVenda(id, quantidade) {
    estoqueProd(id, quantidade);
    vendasProd(id, quantidade);
    setLucro(function(lucroAtual) {
      return calcularLucro(lucroAtual, id, quantidade);
    });
  }

  function alternarSelecao(id) {
    setSelecionados(function (atual) {
      if (atual.includes(id)) {
        return atual.filter(function (itemId) { return itemId !== id; });
      } else {
        return [...atual, id];
      }
    })
  }

function venderSelecionados() {
  const itensDoPedido = [];

    for (const id in quantidades) {
      const quantidade = quantidades[id];
      if (quantidade > 0) {
        registrarVenda(Number(id), quantidade);

    const produto = estoque.find(function (item) { return item.id === Number(id); });

    if (produto) {
      itensDoPedido.push({
        nome: produto.nome,
        quantidade: quantidade,
        lucro: (produto.lucro || 0) * quantidade,
        });
      }
    }
  }

     if (itensDoPedido.length > 0) {
      const lucroPedido = itensDoPedido.reduce(function (soma, item) {
       return soma + item.lucro;
       }, 0);

     setPedidosDia(function (atual) {
       return [...atual, {
         id: Date.now(),
         hora: new Date().toLocaleTimeString('pt-BR'),
         itens: itensDoPedido,
         lucroPedido: lucroPedido,
       }];
     });
   }

    setQuantidades({});
  }

  function alterarQuantidadeReposicao(id, delta) {
    setQuantidadesReposicao(function (atual) {
      const atualQuantidade = atual[id] || 0;
      let nova = atualQuantidade + delta;
      if (nova < 0) {
        nova = 0;
      }
      return { ...atual, [id]: nova };
    });
  }

  function alterarPrecoEditado(id, texto) {
    setPrecosEditados(function (atual) {
      return { ...atual, [id]: texto };
    });
  }

  async function salvarConfiguracaoEstoque() {
    setSalvandoEstoque(true);

    const atualizacoes = [];

    for (const item of estoque) {
      const ehCaldoDeCana = item.nome.toLowerCase().includes("caldo de cana");
      const adicionar = quantidadesReposicao[item.id] || 0;
      const precoTexto = precosEditados[item.id];

      let novoPreco = item.lucro;
      if (precoTexto !== undefined && precoTexto.trim() !== '') {

        const precoConvertido = parseFloat(precoTexto.replace(',', '.'));
        if (!isNaN(precoConvertido)) {
          novoPreco = precoConvertido;
        }
      }

      const novaQuantidade = ehCaldoDeCana ? item.quantidade : item.quantidade + adicionar;
      const precoMudou = novoPreco !== item.lucro;
      const quantidadeMudou = adicionar !== 0;

      if (quantidadeMudou || precoMudou) {
        atualizacoes.push({ id: item.id, quantidade: novaQuantidade, lucro: novoPreco });
      }
    }

    if (atualizacoes.length === 0) {
      setSalvandoEstoque(false);
      Alert.alert('Nada para salvar', 'Nenhuma quantidade ou preço foi alterado.');
      return;
    }

    for (const atualizacao of atualizacoes) {
      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: atualizacao.quantidade, lucro: atualizacao.lucro })
        .eq('id', atualizacao.id);

      if (error) {
        console.log('erro ao salvar produto ' + atualizacao.id + ': ', error.message);
        Alert.alert('Erro ao salvar', error.message);
      }
    }

    await buscarEstoque();

    setQuantidadesReposicao({});
    setPrecosEditados({});
    setSalvandoEstoque(false);

    Alert.alert('Estoque atualizado', 'As alterações foram salvas com sucesso.');
  }

  async function adicionarNovoProduto() {
    const nomeTratado = novoNome.trim();

    if (nomeTratado === '') {
      Alert.alert('Nome obrigatório', 'Digite o nome do novo produto.');
      return;
    }

    const jaExiste = estoque.some(function (item) {
      return item.nome.toLowerCase() === nomeTratado.toLowerCase();
    });

    if (jaExiste) {
      Alert.alert('Produto já existe', 'Já existe um produto com esse nome.');
      return;
    }

    const quantidadeConvertida = parseInt(novoQuantidade, 10);
    const quantidadeInicial = isNaN(quantidadeConvertida) ? 0 : quantidadeConvertida;

    const precoConvertido = parseFloat(novoPreco.replace(',', '.'));
    const precoInicial = isNaN(precoConvertido) ? 0 : precoConvertido;

    const proximoId = estoque.length > 0
      ? Math.max.apply(null, estoque.map(function (item) { return item.id; })) + 1
      : 1;

    setAdicionandoProduto(true);

    const { error } = await supabase
      .from('produtos')
      .insert({ id: proximoId, nome: nomeTratado, quantidade: quantidadeInicial, lucro: precoInicial });

    if (error) {
      console.log('erro ao adicionar produto: ', error.message);
      Alert.alert('Erro ao adicionar produto', error.message);
      setAdicionandoProduto(false);
      return;
    }

    await buscarEstoque();

    setNovoNome('');
    setNovoQuantidade('');
    setNovoPreco('');
    setAdicionandoProduto(false);

    Alert.alert('Produto adicionado', `"${nomeTratado}" foi adicionado ao estoque.`);
  }

  function removerProduto(id, nome) {
    if (Platform.OS === 'web') {
      const confirmado = window.confirm(
        `Tem certeza que deseja remover "${nome}" do estoque? Essa ação não pode ser desfeita.`
      );
      if (confirmado) {
        executarRemocaoProduto(id);
      }
      return;
    }

    Alert.alert(
      'Remover produto',
      `Tem certeza que deseja remover "${nome}" do estoque? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: function () {
            executarRemocaoProduto(id);
          },
        },
      ]
    );
  }

  async function executarRemocaoProduto(id) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('erro ao remover produto: ', error.message);
      Alert.alert('Erro ao remover', error.message);
      return;
    }

    setQuantidadesReposicao(function (atual) {
      const copia = { ...atual };
      delete copia[id];
      return copia;
    });
    setPrecosEditados(function (atual) {
      const copia = { ...atual };
      delete copia[id];
      return copia;
    });
    setQuantidades(function (atual) {
      const copia = { ...atual };
      delete copia[id];
      return copia;
    });

    await buscarEstoque();
  }

  function alternarProdutoNoNovoGrupo(id) {
    setNovoGrupoProdutosSelecionados(function (atual) {
      if (atual.includes(id)) {
        return atual.filter(function (itemId) { return itemId !== id; });
      }
      return [...atual, id];
    });
  }

  async function salvarNovoGrupoVenda() {
    const nomeTratado = novoGrupoNome.trim();

    if (nomeTratado === '') {
      Alert.alert('Nome obrigatório', 'Digite um nome para esse total (ex: "Coxinha").');
      return;
    }

    if (novoGrupoProdutosSelecionados.length === 0) {
      Alert.alert('Selecione ao menos um produto', 'Marque pelo menos um produto do estoque para esse total.');
      return;
    }

    setSalvandoGrupo(true);

    const { error } = await supabase
      .from('grupos_venda')
      .insert({ nome: nomeTratado, produtos_ids: novoGrupoProdutosSelecionados });

    if (error) {
      console.log('erro ao salvar total personalizado: ', error.message);
      Alert.alert('Erro ao salvar', error.message);
      setSalvandoGrupo(false);
      return;
    }

    await buscarGruposVenda();

    setNovoGrupoNome('');
    setNovoGrupoProdutosSelecionados([]);
    setSalvandoGrupo(false);
  }

  function removerGrupoVenda(id, nome) {
    if (Platform.OS === 'web') {
      const confirmado = window.confirm(`Remover o total "${nome}"? Isso não afeta o estoque, só o cálculo do total.`);
      if (confirmado) {
        executarRemocaoGrupoVenda(id);
      }
      return;
    }

    Alert.alert(
      'Remover total',
      `Remover o total "${nome}"? Isso não afeta o estoque, só o cálculo do total.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: function () { executarRemocaoGrupoVenda(id); } },
      ]
    );
  }

  async function executarRemocaoGrupoVenda(id) {
    const { error } = await supabase
      .from('grupos_venda')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('erro ao remover total personalizado: ', error.message);
      Alert.alert('Erro ao remover', error.message);
      return;
    }

    await buscarGruposVenda();
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <SafeAreaView style={stylesTabelas.container}>

        {tela === 'principal' && (
          <TelaPrincipal
            estoque={app.estoque}
            vendasDia={app.vendasDia}
            quantidades={app.quantidades}
            lucro={app.lucro}
            gruposVenda={app.gruposVenda}
            total={app.total}
            totalVendas={app.totalVendas}
            totalVendasPasteis={app.totalVendasPasteis}
            totalVendasCaldoCana={app.totalVendasCaldoCana}
            totaisPersonalizados={app.totaisPersonalizados}
            totalSelecionados={app.totalSelecionados}
            alterarQuantidade={app.alterarQuantidade}
            venderSelecionados={app.venderSelecionados}
            resetarDia={app.resetarDia}
            irPara={setTela}
          />
        )}

        {tela === 'configurarEstoque' && (
          <TelaConfigurarEstoque
            estoque={app.estoque}
            quantidadesReposicao={app.quantidadesReposicao}
            precosEditados={app.precosEditados}
            salvandoEstoque={app.salvandoEstoque}
            novoNome={app.novoNome}
            setNovoNome={app.setNovoNome}
            novoQuantidade={app.novoQuantidade}
            setNovoQuantidade={app.setNovoQuantidade}
            novoPreco={app.novoPreco}
            setNovoPreco={app.setNovoPreco}
            adicionandoProduto={app.adicionandoProduto}
            gruposVenda={app.gruposVenda}
            novoGrupoNome={app.novoGrupoNome}
            setNovoGrupoNome={app.setNovoGrupoNome}
            novoGrupoProdutosSelecionados={app.novoGrupoProdutosSelecionados}
            salvandoGrupo={app.salvandoGrupo}
            alterarQuantidadeReposicao={app.alterarQuantidadeReposicao}
            alterarPrecoEditado={app.alterarPrecoEditado}
            removerProduto={app.removerProduto}
            salvarConfiguracaoEstoque={app.salvarConfiguracaoEstoque}
            adicionarNovoProduto={app.adicionarNovoProduto}
            alternarProdutoNoNovoGrupo={app.alternarProdutoNoNovoGrupo}
            salvarNovoGrupoVenda={app.salvarNovoGrupoVenda}
            removerGrupoVenda={app.removerGrupoVenda}
            voltar={function () { setTela('principal'); }}
          />
        )}
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
                renderItem={function (objeto){
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

            <View >
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
              <TouchableOpacity style={stylesTabelas.botao} onPress={() => setTela('registros')}>
                <Text style={stylesTabelas.textoBotao}> Registros diários </Text>
              </TouchableOpacity>

              <TouchableOpacity style={stylesTabelas.botao} onPress={() => setTela('configurarEstoque')}>
                <Text style={stylesTabelas.textoBotao}> Configurar estoque </Text>
              </TouchableOpacity>
            </View>
          </>

        {tela === 'configurarEstoque' && (
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
                  return (
                    <LinhaConfig
                      item={objeto.item}
                      quantidadeAdicionar={quantidadesReposicao[objeto.item.id] || 0}
                      aoAlterarQuantidade={alterarQuantidadeReposicao}
                      novoPreco={precosEditados[objeto.item.id] !== undefined ? precosEditados[objeto.item.id] : ''}
                      aoAlterarPreco={alterarPrecoEditado}
                      aoRemover={removerProduto}
                    />
                  );
                }}
                keyExtractor={function (item) { return item.id.toString(); }}
              />
            </View>

            <View style={stylesTabelas.linhaBotoesRodape}>
              <TouchableOpacity
                style={[stylesTabelas.botao, salvandoEstoque && stylesTabelas.botaoDesabilitado]}
                onPress={salvarConfiguracaoEstoque}
                disabled={salvandoEstoque}
              >
                <Text style={stylesTabelas.textoBotao}>{salvandoEstoque ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={stylesTabelas.botao} onPress={() => setTela('principal')}>
                <Text style={stylesTabelas.textoBotao}> Voltar </Text>
              </TouchableOpacity>
            </View>

            {/* NOVO: formulário para cadastrar um produto que ainda não existe no estoque. */}
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
                  {adicionandoProduto ? 'Adicionando...' : 'Adicionar produto'}
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
                return (
                  <View key={grupo.id} style={stylesTabelas.linhaGrupoVenda}>
                    <Text style={stylesTabelas.textoRelatorio}>
                      {grupo.nome} ({grupo.produtos_ids.length} produto{grupo.produtos_ids.length === 1 ? '' : 's'})
                    </Text>
                    <TouchableOpacity
                      style={stylesTabelas.botaoRemoverProduto}
                      onPress={() => removerGrupoVenda(grupo.id, grupo.nome)}
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
                      onValueChange={() => alternarProdutoNoNovoGrupo(item.id)}
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
                  {salvandoGrupo ? 'Salvando...' : 'Salvar total'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tela === 'registros' && (
          <TelaRegistros
            pedidosDia={app.pedidosDia}
            registros={app.registros}
            carregandoRegistros={app.carregandoRegistros}
            voltar={function () { setTela('principal'); }}
          />
        )}

      </SafeAreaView>
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ConteudoApp />
    </SafeAreaProvider>
  );
}