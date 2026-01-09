/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/connectMongo";
import { NextRequest, NextResponse } from "next/server";
import QuickRoll from "../../../../models/QuickRoll";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } //extrai :id da URL)
) {
  try {
    //1) extrair ID do Quick Roll da URL
    const { id: quickRollId } = await params;

    //2) pegar o ID do URL, e não do body
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    //3) valida que userId não será null, e se ele é válido como 24char no formato do ObjectID
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório na query string" },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    //valida a ID de quickroll também. Não fiz a validação de ver se tem 24char por que criava id de 25char as vezes
    if (!mongoose.Types.ObjectId.isValid(quickRollId)) {
      return NextResponse.json(
        { error: "ID do Quick Roll inválido" },
        { status: 400 }
      );
    }

    //4) extrair dados do body (apenas campos que podem ser atualizados)
    const body = await request.json();
    const { name, notation, color, category, order } = body;

    //5) validar que pelo menos UM campo foi fornecido para atualizar
    const updates: any = {}; //aqui salva o que veio do frontend, ou não
    if (name !== undefined) updates.name = name;
    if (notation !== undefined) updates.notation = notation;
    if (color !== undefined) updates.color = color;
    if (category !== undefined) updates.category = category;
    if (order !== undefined) updates.order = order;

    if (Object.keys(updates).length === 0) {
      //se nada salvo...
      return NextResponse.json(
        { error: "Nenhum campo fornecido para atualização" },
        { status: 400 }
      );
    }

    //6) conecta ao banco e cria uma ordem das rolagens
    await dbConnect();

    const quickRoll = await QuickRoll.findById(quickRollId);

    if (!quickRoll) {
      return NextResponse.json(
        { error: "Quickroll não existe" },
        { status: 400 }
      );
    }

    //7) verificar se o usuário é dono deste Quickroll
    if (quickRoll.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Você não tem permissão para atualizar este Quick Roll" },
        { status: 403 }
      );
    }

    //8) acha por update, usa o documento que criamos com os campos a serem atualizados, e usa
    const updatedQuickroll = await QuickRoll.findByIdAndUpdate(
      quickRollId,
      {
        ...updates,
        updatedAt: new Date(), //garantir que updatedAt seja atualizado junto
      },
      { new: true, runValidators: true } //retornar documento atualizado e valida
    );

    //9) retornar resposta
    return NextResponse.json(
      {
        success: true,
        data: updatedQuickroll,
        message: "Quickroll atualzado com sucesso",
      },
      { status: 200 }
    ); // 201 Created
  } catch (error: any) {
    console.error("❌ Erro PUT /quick-rolls/:id:", error.message);

    //erro específico de validação do Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          error: "Erro de validação na alteração",
          details: errors,
        },
        { status: 400 }
      );
    }
    //cast error (IDs inválidos)
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "ID inválido fornecido" },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } //extrai :id da URL)
) {
  try {
    //1) extrair ID do Quick Roll da URL
    const { id: quickRollId } = await params;

    //2) pegar o ID do URL, e não do body
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    //3) valida que userId não será null, e se ele é válido como 24char no formato do ObjectID
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório na query string" },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    //valida a ID de quickroll também. Não fiz a validação de ver se tem 24char por que criava id de 25char as vezes
    if (!mongoose.Types.ObjectId.isValid(quickRollId)) {
      return NextResponse.json(
        { error: "ID do Quick Roll inválido" },
        { status: 400 }
      );
    }

    //4) conecta ao banco
    await dbConnect();

    //5) acha um quickroll no banco e confirma que existe
    const quickRoll = await QuickRoll.findById(quickRollId);

    if (!quickRoll) {
      return NextResponse.json(
        { error: "Quickroll não existe" },
        { status: 400 }
      );
    }

    //6) verificar se o usuário é dono deste Quickroll
    if (quickRoll.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar este Quick Roll" },
        { status: 403 }
      );
    }

    //7) guardar o order para reorganizar tudo depois
    const deletedOrder = quickRoll.order;

    //8) encontrar o quickroll e excluir depois
    await quickRoll.deleteOne();

    //9) reorganizar a ordem dos quickrolls restantes (peguei da IA)
    await QuickRoll.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        order: { $gt: deletedOrder }, // $gt = greater than (maior que)
      },
      {
        $inc: { order: -1 }, // $inc = increment (pode ser negativo)
      }
    );

    //10) retornar resposta
    return NextResponse.json(
      {
        success: true,
        message: "Quickroll apagado com sucesso",
      },
      { status: 200 }
    ); // 201 Created
  } catch (error: any) {
    console.error("❌ Erro DELETE /quick-rolls/:id:", error.message);

    //erro específico de validação do Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          error: "Erro de validação no deletar",
          details: errors,
        },
        { status: 400 }
      );
    }
    //cast error (IDs inválidos)
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "ID inválido fornecido" },
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
