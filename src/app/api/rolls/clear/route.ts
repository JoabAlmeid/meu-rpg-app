/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../models/Roll";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    //    //1) pegar o userId do JWT token (não da query)
    // const userId = getUserIdFromToken(request);

    // //2) só pode deletar SEUS rolamentos
    // const filter = { userId };

    // //3) se ficar sem userId ele iria deletar tudo, isso aqui impede
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Não autorizado" },
    //     { status: 401 }
    //   );

    //   //--------------- código acima para quando tiver JWT ---------------//

    //1) pega os parâmetros na URL (mais RESTful que pegar do body)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    const filter: any = {};

    if (userId) {
      //validar se é ObjectId válido
      if (/^[0-9a-fA-F]{24}$/.test(userId)) {
        filter.userId = userId;
      } else {
        return NextResponse.json(
          { error: "ID de usuário inválido" },
          { status: 400 }
        );
      }
    }

    console.log("📋 Filtro aplicado em DELETE:", filter);

    //2) conecta no mongodb
    await dbConnect();

    //3) deleta todos os rolamentos com esse userId. Se tiver vazio, deleta tudo
    const result = await Rolamento.deleteMany(filter);

    return NextResponse.json({
      success: true,
      message: `Histórico sofreu filtragem! ${result.deletedCount} rolagens removidas.`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("❌ Erro ao limpar histórico:", error);

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
