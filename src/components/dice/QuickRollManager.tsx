/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dice/QuickRollManager.tsx
"use client";

import { useQuickRolls } from "@/hooks/useQuickRolls";
import { useEffect, useState } from "react";

export default function QuickRollManager({ userId }: { userId: string }) {
  //adicionar o editar e criar quickroll. O deletar já está funcionando
  const {
    quickRolls,
    loading,
    error,
    deleteQuickRoll,
    fetchQuickRolls,
    createQuickRoll,
  } = useQuickRolls(userId);

  //controla se mostra o usuário
  const [showForm, setShowForm] = useState(false);

  //estado que guardará os dados do form
  const [formData, setFormData] = useState({
    name: "",
    notation: "",
    color: "azul",
    category: "outros",
  });

  //estado para quando tiver erros
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    //verifica se name não está vazio
    if (!formData.name.trim()) {
      setFormError("O nome é obrigatório");
      return;
    }

    //verifica se notation não está vazia e é válida
    if (!formData.notation.trim()) {
      setFormError("A notação é obrigatória");
      return;
    }
    const isValidNotation = (notation: string): boolean => {
      // Aceita: "2d6", "1d20+5", "3d8+10"
      // Rejeita: "d20", "2d", "abc", "2d6+"
      return /^\d+d\d+(?:\+\d+)?$/.test(notation);
    };
    if (!isValidNotation(formData.notation)) {
      setFormError('Notação inválida. Use formato como "2d6+3"');
      return;
    }

    try {
      //chamar createQuickRoll que faz o POST
      await createQuickRoll({
        name: formData.name,
        notation: formData.notation,
        color: formData.color,
        category: formData.category,
      });

      //se sucesso, limpa formulário e fecha
      setFormData({
        name: "",
        notation: "",
        color: "azul",
        category: "outros",
      });
      setShowForm(false); // Fecha formulário

      console.log("✅ QuickRoll criado com sucesso!");
    } catch (err: any) {
      console.error("Erro no handleSubmit:", err);
    }
  };

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
        <ul style={{ listStyle: "none", padding: 5 }}>
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

      {/* Botão para mostrar formulário */}
      <button onClick={() => setShowForm(true)}>+ Adicionar QuickRoll</button>

      {/* Formulário (condicional) */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>Novo QuickRoll</h3>

          <div>
            <label>
              Nome:
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Ataque com Espada"
              />
            </label>
          </div>
          <div>
            <label>
              Dados:
              <input
                type="text"
                value={formData.notation}
                onChange={(e) =>
                  setFormData({ ...formData, notation: e.target.value })
                }
                placeholder="Ex: 2d6+5"
                name="notation"
              />
            </label>
          </div>
          <div>
            {/* Opções: combate, perícias, magia, item, outros */}
            <label>
              Categoria:
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="combate">Combate</option>
                <option value="perícias">Perícias</option>
                <option value="magia">Magia</option>
                <option value="item">Item</option>
                <option value="outros">Outros</option>
              </select>
            </label>
          </div>
          <div>
            {/* Opções: azul, vermelho, verde, amarelo, roxo, cinza */}
            <label>
              Cor:
              <select
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              >
                <option value="azul">Azul</option>
                <option value="vermelho">Vermelho</option>
                <option value="verde">Verde</option>
                <option value="amarelo">Amarelo</option>
                <option value="roxo">Roxo</option>
                <option value="cinza">Cinza</option>
              </select>
            </label>
          </div>

          {formError && <div style={{ color: "red" }}>{formError}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar"}
          </button>

          <button type="button" onClick={() => setShowForm(false)}>
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
