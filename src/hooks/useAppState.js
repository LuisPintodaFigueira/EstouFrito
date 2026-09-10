import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

import {
  buscarProdutos,
  atualizarProduto,
  inserirProduto,
  deletarProduto,
} from '../services/produtosService.js';

import {
  buscarGruposVenda as buscarGruposVendaService,
  inserirGrupoVenda,
  deletarGrupoVenda,
} from '../services/gruposVendaService.js';

import {
  inserirResumoDiario,
  buscarResumosDiarios,
} from '../services/resumosService.js';

export function useAppState(tela) {

  const [estoque, setEstoque] = useState([]);
  const [vendasDia, setVendasDia] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [lucro, setLucro] = useState(0);
  const [carregandoEstoque, setCarregandoEstoque] = useState(true);

  const [registros, setRegistros] = useState([]);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);
  const [pedidosDia, setPedidosDia] = useState([]);

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

    const { data, error } = await buscarProdutos();

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
          let quantidadeVendidaValor;
          if (vendaExistente) {
            quantidadeVendidaValor = vendaExistente.quantidadeVendida;
          } else {
            quantidadeVendidaValor = 0;
          }
          return {
            id: item.id,
            nome: item.nome,
            quantidadeVendida: quantidadeVendidaValor,
          };
        });
      });
    }

    setCarregandoEstoque(false);
  }

  async function buscarGruposVenda() {
    const { data, error } = await buscarGruposVendaService();

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
      let lucroUnitario;
      if (itemVendido.lucro !== undefined) {
        lucroUnitario = itemVendido.lucro;
      } else {
        lucroUnitario = 0;
      }
      return lucroAtual + (lucroUnitario * quantidade);
    }
    return lucroAtual;
  }

  async function estoqueProd(id, quantidade) {
    const itemAtual = estoque.find(function (item) { return item.id === id; });
    const ehCaldoDeCana = itemAtual && itemAtual.nome.toLowerCase().includes("caldo de cana");

    let novaQuantidade;
    if (itemAtual) {
      novaQuantidade = itemAtual.quantidade;
    } else {
      novaQuantidade = 0;
    }
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
      const { error } = await atualizarProduto(id, novaQuantidade, itemAtual.lucro);

      if (error) {
        console.log('erro ao dar baixa no estoque: ', error.message);
        Alert.alert('Erro ao salvar venda no estoque', error.message);
      }
    }
  }

  async function savlvarResumoDia() {
    const { error } = await inserirResumoDiario(
      totalVendas,
      totalVendasPasteis,
      totalVendasCaldoCana,
      lucro
    );

    if (error) {
      console.log('erro ao salvar resumo: ', error.message);
      Alert.alert('Erro ao salvar resumo do dia', error.message);
    }
  }

  async function buscarRegistros() {
    setCarregandoRegistros(true);

    const { data, error } = await buscarResumosDiarios();

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
      vendasZeradas.push({ id: item.id, nome: item.nome, quantidadeVendida: 0 });
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
          let lucroUnitario;
          if (produtoOriginal && produtoOriginal.lucro !== undefined) {
            lucroUnitario = produtoOriginal.lucro;
          } else {
            lucroUnitario = 0;
          }
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
    });
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
    setLucro(function (lucroAtual) {
      return calcularLucro(lucroAtual, id, quantidade);
    });
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

      let novaQuantidade;
      if (ehCaldoDeCana) {
        novaQuantidade = item.quantidade;
      } else {
        novaQuantidade = item.quantidade + adicionar;
      }
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
      const { error } = await atualizarProduto(atualizacao.id, atualizacao.quantidade, atualizacao.lucro);

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
    let quantidadeInicial;
    if (isNaN(quantidadeConvertida)) {
      quantidadeInicial = 0;
    } else {
      quantidadeInicial = quantidadeConvertida;
    }

    const precoConvertido = parseFloat(novoPreco.replace(',', '.'));
    let precoInicial;
    if (isNaN(precoConvertido)) {
      precoInicial = 0;
    } else {
      precoInicial = precoConvertido;
    }

    let proximoId;
    if (estoque.length > 0) {
      proximoId = Math.max.apply(null, estoque.map(function (item) { return item.id; })) + 1;
    } else {
      proximoId = 1;
    }

    setAdicionandoProduto(true);

    const { error } = await inserirProduto(proximoId, nomeTratado, quantidadeInicial, precoInicial);

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
    const { error } = await deletarProduto(id);

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

    const { error } = await inserirGrupoVenda(nomeTratado, novoGrupoProdutosSelecionados);

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
    const { error } = await deletarGrupoVenda(id);

    if (error) {
      console.log('erro ao remover total personalizado: ', error.message);
      Alert.alert('Erro ao remover', error.message);
      return;
    }

    await buscarGruposVenda();
  }
  
  return {
    // estado
    estoque,
    vendasDia,
    quantidades,
    lucro,
    carregandoEstoque,
    registros,
    carregandoRegistros,
    pedidosDia,
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

    // derivados
    totalVendas,
    totalVendasPasteis,
    totalVendasCaldoCana,
    totaisPersonalizados,
    total,
    totalSelecionados,

    // funções
    alterarQuantidade,
    alterarQuantidadeReposicao,
    alterarPrecoEditado,
    salvarConfiguracaoEstoque,
    adicionarNovoProduto,
    removerProduto,
    executarRemocaoProduto,
    alternarProdutoNoNovoGrupo,
    salvarNovoGrupoVenda,
    removerGrupoVenda,
    executarRemocaoGrupoVenda,
    venderSelecionados,
    resetarDia,
  };
}