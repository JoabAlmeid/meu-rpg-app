/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import QuickRoll from "../../../../models/QuickRoll";
import mongoose, { SortOrder } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    //puxa da URL o ID, exemplo: localhost/api/rolls/history?userId=507f1f77bcf86cd799439011
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const limitParam = searchParams.get("limit");
    const sortParam = searchParams.get("sort") || "order";

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório na query string" },
        { status: 400 }
      );
    }

    const filter: any = {};

    //valida o userId e converde para ObjectId, que nem no POST. Senão, manda um array vazio
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else {
      // userId inválido → retornar array vazio (não erro)
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        filters: {
          userId,
          category: category || "todas",
          limit: 0,
          note: "userId inválido - retornando array vazio",
        },
      });
    }

    //validar se a categoria está no enum
    if (category) {
      //validar se categoria está no enum
      const validCategories = [
        "combate",
        "perícias",
        "magia",
        "item",
        "outros",
      ];
      if (validCategories.includes(category)) {
        filter.category = category;
      } else {
        return NextResponse.json(
          {
            error:
              "Categoria inválida. Use: combate, perícias, magia, item, outros",
          },
          { status: 400 }
        );
      }
    }

    //configura limite (padrão 50, máximo 100)
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam), 1), 100) //entre 1 e 100
      : 50;

    //configura ordenação
    const sortField = sortParam.startsWith("-")
      ? sortParam.slice(1)
      : sortParam;
    const sortDirection: SortOrder = sortParam.startsWith("-") ? -1 : 1;
    const sortOptions: Record<string, SortOrder> = {
      [sortField]: sortDirection,
    };

    //valida campos permitidos para ordenação
    const allowedSortFields = ["order", "createdAt", "updatedAt", "name"];
    if (!allowedSortFields.includes(sortField)) {
      return NextResponse.json(
        {
          error: `Campo de ordenação inválido. Use: ${allowedSortFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    //usa a ID do usuário como filtro. Pega todos os rolamentos com esse ID
    const quickRolls = await QuickRoll.find(filter)
      .sort(sortOptions)
      .limit(limit);

    console.log(`✅ Retornando ${quickRolls.length} rolamentos`);

    return NextResponse.json({
      success: true,
      data: quickRolls,
      count: quickRolls.length,
      filters: {
        userId,
        category: category || "todas",
        limit: quickRolls.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro GET /quick-rolls:", error.message);
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
