/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";

//1) interface para tipar o QuickRoll
interface QuickRoll {
  _id: string;
  name: string;
  notation: string;
  color: string;
  category: string;
  order: number;
}

//2) criar o hook
export function useQuickRolls(userId: string) {
  // 3. Estados do hook
  const [quickRolls, setQuickRolls] = useState<QuickRoll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //4) função para buscar QuickRolls
  const fetchQuickRolls = useCallback(async (): Promise<void> => {
    if (!userId) {
      setError("userId é obrigatório");
      return;
    }

    setLoading(true);
    setError(null); //limpa erros anteriores

    try {
      //5) faz a requisição, tipo um get
      // URL: /api/quick-rolls?userId=SEU_USER_ID (peguei da IA)
      const response = await fetch(`/api/quick-rolls?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Falha ao buscar QuickRolls");
      }

      //6) converte resposta para JSON
      const data = await response.json();

      //7) verifica se a API retornou sucesso
      if (data.success) {
        //atualiza estado com os dados
        setQuickRolls(data.data);
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err: any) {
      //se der erro, atualizar estado de error
      setError(err.message);
      console.error("Erro ao buscar QuickRolls:", err);
    } finally {
      //sempre executado (sucesso ou erro)
      setLoading(false);
    }
    //8) retorna tudo que os componentes precisam
  }, [userId]); //dependência: só recria se userId mudar

  //TODO: implementar createQuickRoll
  const createQuickRoll = useCallback(
    async (newQuickRoll: {
      name: string;
      notation: string;
      color?: string;
      category?: string;
    }): Promise<void> => {
      // 1. Validar userId
      if (!userId) {
        setError("userId é obrigatório");
        return;
      }
      // 2. Iniciar loading
      setLoading(true);
      setError(null);

      try {
        // 3. Fazer requisição POST
        const response = await fetch(`/api/quick-rolls?userId=${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          //vem do frontend
          body: JSON.stringify({
            name: newQuickRoll.name,
            notation: newQuickRoll.notation,
            color: newQuickRoll.color || "blue", // valor padrão
            category: newQuickRoll.category || "outros", // valor padrão
          }),
        });

        // 4. Verificar resposta
        if (!response.ok) {
          throw new Error("Falha ao criar QuickRoll");
        }

        // 5. Se sucesso, atualizar lista
        await fetchQuickRolls();
      } catch (err: any) {
        //se der erro, atualizar estado de error
        setError(err.message);

        console.error("Erro ao criar QuickRoll:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchQuickRolls] //dependências
  );

  //TODO: implementar updateQuickRoll
  const updateQuickRoll = async (id: string, updates: Partial<QuickRoll>) => {
    // Similar, mas:
    // - URL: `/api/quick-rolls/${id}?userId=${userId}`
    // - Método: PUT
    // - Body: JSON.stringify(updates)
  };

  //TODO: implementar deleteQuickRoll
  const deleteQuickRoll = useCallback(
    async (id: string): Promise<void> => {
      // 1. Validar ids
      if (!userId) {
        setError("userId é obrigatório");
        return;
      }
      // 2. Pedir confirmação (opcional, mas recomendado)
      if (!window.confirm("Tem certeza que deseja excluir este QuickRoll?")) {
        return; // Usuário cancelou
      }
      // 3. Iniciar loading
      setLoading(true);
      setError(null); //limpa erros anteriores

      try {
        // 4. Fazer requisição DELETE
        const response = await fetch(
          `/api/quick-rolls/${id}?userId=${userId}`,
          {
            method: "DELETE",
          }
        );
        // 5. Verificar resposta
        if (!response.ok) {
          throw new Error("Falha ao deletar QuickRoll");
        }

        // 6. Se sucesso, atualizar lista
        await fetchQuickRolls();
      } catch (err: any) {
        //se der erro, atualizar estado de error
        setError(err.message);

        console.error("Erro ao deletar QuickRoll:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchQuickRolls] //dependências
  );

  return {
    quickRolls,
    loading,
    error,
    fetchQuickRolls,
    createQuickRoll,
    deleteQuickRoll,
  };
}
