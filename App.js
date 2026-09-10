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
  const [tela, setTela] = useState('principal');

  const app = useAppState(tela);

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