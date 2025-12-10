import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    //1) conectar
    await dbConnect();

    //2) deletar, o objeto vazio faz deletar tudo o que achar usando o model Rolamento
    const result = await Rolamento.deleteMany({});

    //3) devolver response de sucesso. NECESSÁRIO SENÃO NÃO FUNCIONA
    return NextResponse.json({
      success: true,
      message: `Histórico limpo! ${result.deletedCount} rolagens removidas.`,
      deletedCount: result.deletedCount,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro ao limpar histórico:", error);

    //4) devolve responde de erro caso tenha
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao limpar histórico",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
