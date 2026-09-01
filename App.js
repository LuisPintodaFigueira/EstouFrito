//arquivo dedicado a lógica do app e a interface.

// View: componente com funcionalidade parecida com div em html, usado para agrupas outros componentes e mostra-los na tela.
// Text: componente usado para mostrar textos na tela.
// StyleSheet: componente usado para criar estilos para os componentes.
// SafeAreaView: componente usado para garantir que o conteúdo da tela não fique sobreposto a elementos do sistema, como a barra de status.
// Button: componente usado para criar botões na tela.
// TouchableOpacity: componente usado para criar áreas clicáveis na tela, com efeito de opacidade ao serem pressionadas.
// Alert: componente usado para mostrar alertas na tela.
// FlatList: componente usado para renderizar listas de dados de forma eficiente, renderizando apenas os itens visíveis na tela.
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Button, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Cabecalho, Linha, CabecalhoConfig, LinhaConfig, dadosIniciais, stylesTabelas } from './src/tabelas/dados.js';
import { supabase } from './src/supabase/supabaseClient.js';

// Toda a lógica e a tela do app moraram aqui dentro, na função
// ConteudoApp. Ela deixou de ser "export default" porque agora
// precisa ficar DENTRO do SafeAreaProvider (declarado mais abaixo)
// para o hook useSafeAreaInsets funcionar.
function ConteudoApp() {
  // insets.bottom é a altura, em pixels, que a barra de navegação do
  // Android (ou a "faixa" do iPhone) ocupa na parte de baixo da tela.
  // Vamos usar esse valor para dar um respiro extra no final do
  // conteúdo, para os botões não ficarem escondidos atrás dela.
  const insets = useSafeAreaInsets();

  // O estoque agora começa vazio ([]) e é preenchido pela função buscarEstoque(),
  // que busca os dados reais no Supabase assim que o app abre (veja o useEffect logo abaixo).
  // Isso substitui o antigo "useState(dadosIniciais)", que sempre reiniciava os valores.
  const [estoque, setEstoque] = useState([]);
  const [vendasDia, setVendasDia] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [lucro, setLucro] = useState(0);
  const [carregandoEstoque, setCarregandoEstoque] = useState(true);

  const [tela, setTela] = useState('principal');
  const [registros, setRegistros] = useState([]);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);
  const [pedidosDia, setPedidosDia] = useState([]);

  // NOVO: estados exclusivos da tela "Configurar Estoque".
  // quantidadesReposicao guarda, por id de produto, quanto o usuário
  // marcou para ADICIONAR ao estoque (ainda não salvo no banco).
  const [quantidadesReposicao, setQuantidadesReposicao] = useState({});
  // precosEditados guarda, por id de produto, o texto digitado no campo
  // de novo preço (ainda não salvo no banco).
  const [precosEditados, setPrecosEditados] = useState({});
  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  // NOVO: estados do formulário "Adicionar novo produto" (também na
  // tela de configuração de estoque).
  const [novoNome, setNovoNome] = useState('');
  const [novoQuantidade, setNovoQuantidade] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [adicionandoProduto, setAdicionandoProduto] = useState(false);

  // Busca o estoque no Supabase e coloca no estado "estoque".
  // Também usa esses mesmos dados para montar o "vendasDia" zerado,
  // já que antes isso era feito a partir de dadosIniciais.
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
      // Number(...) garante que quantidade e lucro cheguem como número,
      // e não como texto (o driver do Supabase às vezes devolve campos
      // numeric como string).
      const estoqueFormatado = data.map(function (item) {
        return {
          id: item.id,
          nome: item.nome,
          quantidade: Number(item.quantidade),
          lucro: Number(item.lucro),
        };
      });

      setEstoque(estoqueFormatado);

      // Só recria a lista de vendas do dia (zerada) se ainda não existir
      // uma lista com o tamanho certo — evita apagar vendas já feitas
      // quando buscarEstoque() é chamado de novo depois de salvar a
      // configuração do estoque.
      setVendasDia(function (vendasAtual) {
        if (vendasAtual.length === estoqueFormatado.length) {
          return vendasAtual;
        }
        return estoqueFormatado.map(function (item) {
          return { id: item.id, nome: item.nome, quantidadeVendida: 0 };
        });
      });
    }

    setCarregandoEstoque(false);
  }

  // Busca o estoque uma única vez, quando o app abre.
  useEffect(function () {
    buscarEstoque();
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

  // Agora, além de atualizar o estado local "estoque", essa função também
  // manda a nova quantidade para o Supabase, para a baixa no estoque
  // ser permanente (sobreviver a um reinício do app).
  async function estoqueProd(id, quantidade) {
    const itemAtual = estoque.find(function (item) { return item.id === id; });
    const ehCaldoDeCana = itemAtual && itemAtual.nome.toLowerCase().includes("caldo de cana");

    // Calculamos a nova quantidade aqui fora, para podermos usar o mesmo
    // valor tanto no estado local quanto na atualização do banco.
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

    // Se for caldo de cana (estoque "infinito"), não existe o que salvar no banco.
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
          // Antes buscava o lucro em "dadosIniciais" (fixo). Agora busca em
          // "estoque", que reflete o preço atual do produto — importante
          // porque agora o preço pode ser alterado na tela de configuração.
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
    return item.nome.toLowerCase().includes("caldo de cana") || item.nome.toLowerCase().includes("refri");
  })
  .reduce(function (soma, item) {
    return soma + item.quantidadeVendida;
  }, 0);

  const totalVendas = totalVendasPasteis + totalVendasCaldoCana;

  let total = 0;
  for (const item of estoque) {
    if (!item.nome.toLowerCase().includes("caldo de cana")) {
      total = total + item.quantidade;
    }
  }

  useEffect(function () {
    // Só dispara o alerta depois que o estoque já foi carregado do banco
    // (senão ele dispararia sempre no primeiro instante, quando estoque = []).
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

  // ==========================================================================
  // NOVO: funções da tela "Configurar Estoque".
  // ==========================================================================

  // Chamada ao apertar + ou - no seletor de reposição de um produto.
  // Igual ao alterarQuantidade, mas guarda o valor em "quantidadesReposicao"
  // e nunca é bloqueada por estoque zerado (faz sentido repor justamente
  // quando o estoque está em zero).
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

  // Chamada a cada caractere digitado no campo de novo preço.
  // Guardamos o texto "cru" mesmo (ex: "8,50") e só convertemos
  // para número na hora de salvar, dentro de salvarConfiguracaoEstoque.
  function alterarPrecoEditado(id, texto) {
    setPrecosEditados(function (atual) {
      return { ...atual, [id]: texto };
    });
  }

  // Percorre todos os produtos, calcula a nova quantidade (estoque atual +
  // quantidade marcada para adicionar) e o novo preço (se foi digitado algo
  // válido), manda a atualização para o Supabase produto por produto, e
  // depois recarrega o estoque para refletir os valores confirmados pelo banco.
  async function salvarConfiguracaoEstoque() {
    setSalvandoEstoque(true);

    const atualizacoes = [];

    for (const item of estoque) {
      const ehCaldoDeCana = item.nome.toLowerCase().includes("caldo de cana");
      const adicionar = quantidadesReposicao[item.id] || 0;
      const precoTexto = precosEditados[item.id];

      let novoPreco = item.lucro;
      if (precoTexto !== undefined && precoTexto.trim() !== '') {
        // Aceita tanto "8.50" quanto "8,50" (vírgula é comum no Brasil).
        const precoConvertido = parseFloat(precoTexto.replace(',', '.'));
        if (!isNaN(precoConvertido)) {
          novoPreco = precoConvertido;
        }
      }

      const novaQuantidade = ehCaldoDeCana ? item.quantidade : item.quantidade + adicionar;
      const precoMudou = novoPreco !== item.lucro;
      const quantidadeMudou = adicionar !== 0;

      // Só manda para o banco os produtos que realmente tiveram alguma alteração.
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

  // Adiciona um produto novo (que ainda não existe no estoque) direto no
  // Supabase, e depois recarrega o estoque para ele aparecer nas tabelas.
  async function adicionarNovoProduto() {
    const nomeTratado = novoNome.trim();

    if (nomeTratado === '') {
      Alert.alert('Nome obrigatório', 'Digite o nome do novo produto.');
      return;
    }

    // Impede cadastrar dois produtos com o mesmo nome (comparação sem
    // diferenciar maiúsculas/minúsculas, já que o resto do app também
    // compara nomes em minúsculo, ex: .toLowerCase().includes(...)).
    const jaExiste = estoque.some(function (item) {
      return item.nome.toLowerCase() === nomeTratado.toLowerCase();
    });

    if (jaExiste) {
      Alert.alert('Produto já existe', 'Já existe um produto com esse nome.');
      return;
    }

    // parseInt/parseFloat podem devolver NaN se o campo estiver vazio ou
    // com texto inválido — nesse caso, assumimos 0.
    const quantidadeConvertida = parseInt(novoQuantidade, 10);
    const quantidadeInicial = isNaN(quantidadeConvertida) ? 0 : quantidadeConvertida;

    const precoConvertido = parseFloat(novoPreco.replace(',', '.'));
    const precoInicial = isNaN(precoConvertido) ? 0 : precoConvertido;

    // Como a tabela "produtos" não gera id automaticamente (usamos ids
    // fixos desde o começo, 1 a 12), calculamos aqui o próximo id livre:
    // o maior id que já existe no estoque, mais 1.
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

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <SafeAreaView style={stylesTabelas.container}>

        {tela === 'principal' && (
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
        )}

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
          </View>
        )}

        {tela === 'registros' && (

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
              <TouchableOpacity style={stylesTabelas.botao} onPress={() => setTela('principal')}>
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
        )}

      </SafeAreaView>
    </ScrollView>
  );
}

// Este é o componente que o Expo realmente carrega. Ele só existe para
// envolver o ConteudoApp com o SafeAreaProvider — sem isso, o hook
// useSafeAreaInsets() usado lá dentro não teria de onde pegar os valores
// de inset (ele lê essa informação através do "contexto" criado pelo
// Provider, por isso o nome).
export default function App() {
  return (
    <SafeAreaProvider>
      <ConteudoApp />
    </SafeAreaProvider>
  );
}