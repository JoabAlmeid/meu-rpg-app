/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import QuickRoll from "../../../../models/QuickRoll";
import mongoose from "mongoose";

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
    const lastRoll = await QuickRoll.find(filter)
      .limit(10)
      .sort({ createdAt: -1 }); //mais recente

    console.log(`✅ Retornando ${lastRoll.length} rolamentos`);

    return NextResponse.json({
      success: true,
      lastRoll,
      count: lastRoll.length,
      filter: filter.userId ? `userId: ${filter.userId}` : "todos",
    });
  } catch (error: any) {
    console.error("❌ Erro na APIrest:", error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        // details: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    //1) ler body UMA vez e armazenar
    const body = await request.json();
    console.log("Body recebido:", body);

    //2) extrair dados do body, não ler request.json() novamente
    const { name, notation, category, color } = body;

    //3) validação básica
    if (!name || !notation || !category || !color) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    //4) pegar o ID do URL, e não do body
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // 5) valida que userId não será null, e se ele é válido como 24char no formato do ObjectID
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório na query string" },
        { status: 400 }
      );
    }

    if (userId) {
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        return NextResponse.json(
          { error: "ID de usuário inválido" },
          { status: 400 }
        );
      }
    }

    //6) conecta ao banco e cria uma ordem das rolagens
    await dbConnect();

    const lastQuickRoll = await QuickRoll.findOne({ userId })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = lastQuickRoll ? lastQuickRoll.order + 1 : 0;

    //7) cria documento pra ser salvo no banco de dados
    const quickRollDocument = {
      name,
      notation,
      category,
      color,
      userId: new mongoose.Types.ObjectId(userId), // converte de String para ObjectId
      order: nextOrder,
    };

    //8) salva documento no banco com todas as informações que vieram pelo POST
    const newQuickRoll = await QuickRoll.create(quickRollDocument);
    console.log("✅ Quick Roll salvo:", newQuickRoll._id);

    //9) Retornar resposta
    return NextResponse.json(
      {
        success: true,
        data: newQuickRoll,
        message: "Quick Roll criado com sucesso",
      },
      { status: 201 }
    ); // 201 Created
  } catch (error: any) {
    console.error("❌ Erro na API:", error.message);

    //erro específico de validação do Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          error: "Erro de validação",
          details: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
