"use client";

import { useState } from "react";

export default function Home() {
  const [resultado, setResultado] = useState<number[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [lados, setLados] = useState(6);
  const [quantidadeDados, setQuantidadeDados] = useState(1);
  const [historico, setHistorico] = useState<
    Array<{
      id: number; // Para key no React
      dados: string; // "2d6"
      resultados: number[];
      total: number;
      data: Date; // Quando rolou
    }>
  >([]);

  //mudar número de lados
  function handleLadosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const valor = parseInt(event.target.value);
    if (valor >= 2 && valor <= 100) {
      setLados(valor);
    }
  }

  //mudar quantidade de dados
  function handleQuantidadeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const valor = parseInt(event.target.value);
    if (valor >= 1 && valor <= 10) {
      setQuantidadeDados(valor);
    }
  }

  function RolarDados() {
    const resultados: number[] = [];

    for (let i = 0; i < quantidadeDados; i++) {
      const rolamento = Math.floor(Math.random() * lados) + 1;
      resultados.push(rolamento);
    }

    const soma = resultados.reduce((a, b) => a + b, 0);

    setResultado(resultados);
    setTotal(soma);
    console.log("Resultados:", resultados, "Total:", soma);

    //atualiza o state do histórico
    const novoItemHistorico = {
      id: Date.now(), //id baseado na data atual
      dados: `${quantidadeDados}d${lados}`,
      resultados: [...resultados], //cópia do array atual
      total: soma,
      data: new Date(),
    };

    setHistorico((prev) => {
      const novoHistorico = [novoItemHistorico, ...prev]; //novo item no topo da pilha
      return novoHistorico.slice(0, 10); //apenas 10 itens no array
    });
  }

  function limparHistorico() {
    //define o histórico como um array vazio
    setHistorico([]);
  }

  function rolarRapido(quantidadeDados: number, lados: number) {
    setQuantidadeDados(quantidadeDados);
    setLados(lados);
    //chama RolarDados após um pequeno delay
    setTimeout(() => RolarDados(), 100);
  }

  return (
    <div>
      <h1>Rolamento de Dados</h1>

      <div>
        <label>Quantidade de dados: </label>
        <input
          type="number"
          value={quantidadeDados}
          onChange={handleQuantidadeChange}
          min="1"
          max="10"
        />
      </div>

      <div>
        <label>Lados do dado: </label>
        <input
          type="number"
          value={lados}
          onChange={handleLadosChange}
          min="2"
          max="100"
        />
      </div>

      <button onClick={RolarDados}>Rolar Dados</button>
      <button onClick={() => rolarRapido(2, 6)}>Rolar 2d6</button>

      <div>
        <p>
          {resultado.length > 0
            ? `Resultados: ${resultado.join(" + ")} = ${total}`
            : "Clique para rolar"}
        </p>
        <p>
          Notação: {quantidadeDados}d{lados}
        </p>
        <div>
          <h2>Histórico (últimas 10 rolagens)</h2>
          {historico.length === 0 ? (
            <p>Nenhuma rolagem ainda</p>
          ) : (
            <ul>
              {historico.map((item) => (
                <li key={item.id}>
                  [{item.data.toLocaleTimeString().slice(0, 5)}] {/* Hora */}
                  {item.dados} = {item.total}({item.resultados.join(" + ")})
                </li>
              ))}
            </ul>
          )}
          <button onClick={limparHistorico} disabled={historico.length === 0}>
            Limpar Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
