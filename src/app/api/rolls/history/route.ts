/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    //puxa da URL o ID, exemplo: localhost/api/rolls/history?userId=507f1f77bcf86cd799439011
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    console.log("🔍 Query parameters:", {
      fullQuery: request.nextUrl.search,
    });

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

    console.log("📋 Filtro aplicado:", filter);

    await dbConnect();
    //usa a ID do usuário como filtro. Pega todos os rolamentos com esse ID
    const rolamentos = await Rolamento.find(filter)
      .limit(10)
      .sort({ createdAt: -1 }); //mais recente

    console.log(`✅ Retornando ${rolamentos.length} rolamentos`);

    return NextResponse.json({
      success: true,
      rolamentos,
      count: rolamentos.length,
      filter: filter.userId ? `userId: ${filter.userId}` : "todos",
    });
  } catch (error: any) {
    console.error("❌ Erro em GET /history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar histórico",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
