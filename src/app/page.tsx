/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [resultado, setResultado] = useState<number[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [lados, setLados] = useState(6);
  const [quantidadeDados, setQuantidadeDados] = useState(1);
  const [limpando, setLimpando] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
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

  async function RolarDados() {
    console.log("=== NOVA ROLAGEM ===");

    //log estados atuais
    console.log("Estado atual - quantidadeDados:", quantidadeDados);
    console.log("Estado atual - lados:", lados);
    console.log("Estado atual - resultado:", resultado);
    console.log("Estado atual - total:", total);

    //-----------------------------------------------

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

    //salvar no banco (try-catch para não quebrar se falhar)
    try {
      if (soma < 1) {
        console.error("Erro: soma não pode ser 0");
        return;
      }
      const response = await fetch("/api/rolls/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dados: `${quantidadeDados}d${lados}`,
          resultados,
          total: soma,
        }),
      });

      console.log("📨 Response status:", response.status);
      console.log("📨 Response ok?", response.ok);

      if (!response.ok) {
        //se falha, lê como text. correção  por que não posso fazer response.json duas vezes
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      //se sucesso, ler como JSON. aqui repetiria uma segunda vez
      const data = await response.json(); // Ler APENAS se sucesso
      console.log("✅ Rolagem salva no banco:", data._id);
    } catch (error) {
      console.warn("⚠️ Não foi possível salvar no banco:", error);
    }
  }

  useEffect(() => {
    const carregarHistorico = async () => {
      setCarregandoHistorico(true);
      try {
        const response = await fetch("/api/rolls/history");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const rolamentos = data.rolamentos;

        console.log("📦 Dados recebidos do banco:", data.rolamentos);

        // Converter formato aqui

        const convertedHistory = rolamentos.map(
          (roll: {
            _id: { toString: () => any };
            dados: any;
            resultados: any;
            total: any;
            createdAt: string | number | Date;
          }) => {
            return {
              id: roll._id.toString(), // Qual campo usar?
              dados: roll.dados,
              resultados: roll.resultados,
              total: roll.total,
              data: new Date(roll.createdAt), // Qual campo tem a data?
            };
          }
        );

        setHistorico(convertedHistory);
        console.log("✅ Histórico carregado do banco!");
        setCarregandoHistorico(false);
      } catch (error) {
        console.warn("⚠️ Não foi possível carregar do banco:", error);
        //mantém histórico vazio ou local
        setCarregandoHistorico(false);
      } finally {
        setCarregandoHistorico(false); //termina loading (sempre executa)
      }
    };

    carregarHistorico();
  }, []);

  async function limparHistorico() {
    const confirmar = window.confirm(
      "Tem certeza que quer apagar TODAS as rolagens?\nIsso removerá do banco de dados também."
    );
    if (!confirmar) return;

    setLimpando(true);

    try {
      //1) chama api. Não precisa de header pois estamos enviando nada
      const response = await fetch("/api/rolls/clear", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Banco limpo:", result.message);

      //2) limpa o frontend também
      setHistorico([]);

      //3) feedback se funcionou
      alert(`✅ ${result.message}`);
      setLimpando(false);
    } catch (error) {
      console.error("❌ Falha ao limpar banco:", error);
      alert(
        "⚠️ Falha ao limpar banco de dados.\nO histórico local foi mantido."
      );
      setLimpando(false);
    }
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
          {carregandoHistorico ? (
            //if estado carregando
            <div>
              <p>Carregando histórico do banco...</p>
            </div>
          ) : historico.length === 0 ? (
            // else if estado vazio
            <p>Nenhuma rolagem ainda. Role alguns dados!</p>
          ) : (
            //else if há histórico
            <ul>
              {historico.map((item) => (
                <li key={item.id}>
                  [{item.data.toLocaleTimeString().slice(0, 5)}]{item.dados} ={" "}
                  {item.total}({item.resultados.join(" + ")})
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={limparHistorico}
            disabled={historico.length === 0 || limpando}
          >
            {limpando ? "Limpando..." : "Limpar Histórico"}
          </button>
        </div>
      </div>
    </div>
  );
}
