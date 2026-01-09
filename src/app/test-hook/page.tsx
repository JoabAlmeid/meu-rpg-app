// app/teste-hook/page.tsx
"use client"; // IMPORTANTE: Client Component

import { useEffect } from "react";
import { useQuickRolls } from "../../../hooks/useQuickRolls";

export default function TesteHookPage() {
  // Use um userId VÁLIDO do seu banco
  const userId = "507f1f77bcf86cd799439011"; // ← TROQUE por um ID real seu!

  // Usando o hook
  const { quickRolls, loading, error, fetchQuickRolls, createQuickRoll } =
    useQuickRolls(userId);

  // Buscar quando a página carrega
  useEffect(() => {
    fetchQuickRolls();
  }, [fetchQuickRolls]); // Dependência: refetch se fetchQuickRolls mudar

  const handleCreateTest = async () => {
    await createQuickRoll({
      name: "Teste " + Date.now(), // Nome único
      notation: "2d6+3",
      color: "green",
      category: "combate",
    });
  };

  // Estados de loading/error
  if (loading) {
    return (
      <div className="p-4">
        <h1>Testando Hook useQuickRolls</h1>
        <p>Carregando QuickRolls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1>Testando Hook useQuickRolls</h1>
        <p className="text-red-500">Erro: {error}</p>
        <button
          onClick={fetchQuickRolls}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Testando Hook useQuickRolls</h1>

      <div className="mb-4">
        <p>User ID: {userId}</p>
        <p>Total de QuickRolls: {quickRolls.length}</p>
        <button
          onClick={fetchQuickRolls}
          className="px-4 py-2 bg-green-500 text-white rounded mt-2"
        >
          Recarregar
        </button>
        <button
          onClick={handleCreateTest}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar QuickRoll de Teste"}
        </button>
      </div>

      {quickRolls.length === 0 ? (
        <p>Nenhum QuickRoll encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {quickRolls.map((qr) => (
            <li key={qr._id} className="p-3 border rounded bg-gray-50">
              <div className="font-semibold">{qr.name}</div>
              <div>Notação: {qr.notation}</div>
              <div>Cor: {qr.color}</div>
              <div>Categoria: {qr.category}</div>
              <div>Ordem: {qr.order}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
