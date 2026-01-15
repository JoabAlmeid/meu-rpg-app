// src/components/dice/QuickRollManager.tsx
"use client";

import { useQuickRolls } from "@/hooks/useQuickRolls";
import { useEffect } from "react";

export default function QuickRollManager({ userId }: { userId: string }) {
  //adicionar editar e criar quickroll. O deletar já está funcionando
  const { quickRolls, loading, error, deleteQuickRoll, fetchQuickRolls } =
    useQuickRolls(userId);

  useEffect(() => {
    console.log("🔄 QuickRollManager montado, buscando dados...");
    fetchQuickRolls();
  }, [fetchQuickRolls]);

  if (loading) return <div>Carregando QuickRolls...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", margin: "20px" }}>
      <h2>📋 Meus QuickRolls ({quickRolls.length})</h2>

      {quickRolls.length === 0 ? (
        <p>Nenhum QuickRoll criado ainda.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {quickRolls.map((qr) => (
            <li
              key={qr._id}
              style={{
                margin: "10px 0",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{qr.name}</strong>
                <div style={{ color: "#666" }}>
                  {qr.notation} • {qr.category} • Cor: {qr.color}
                </div>
              </div>

              <div>
                <button
                  onClick={() => console.log("Rolar:", qr.notation)}
                  style={{ marginRight: "10px" }}
                >
                  🎲 Rolar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Deletar "${qr.name}"?`)) {
                      deleteQuickRoll(qr._id);
                    }
                  }}
                  style={{ backgroundColor: "#ff4444", color: "white" }}
                >
                  🗑️ Deletar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => console.log("Abrir formulário de criação")}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        + Adicionar Novo QuickRoll
      </button>
    </div>
  );
}
