/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/connectMongo";
import User from "../../../../../models/User";
import Rolamento from "../../../../../models/Roll";
import QuickRoll from "../../../../../models/QuickRoll";

export async function GET() {
  try {
    await dbConnect();

    // Testar criação de instâncias
    const mockUser = new User({
      email: "test@example.com",
      username: "tester",
      password: "senhateste",
    });

    const mockRoll = new Rolamento({
      dados: "2d6",
      resultados: [4, 5],
      total: 9,
    });

    const mockQuickRoll = new QuickRoll({
      userId: mockUser._id,
      name: "Ataque com Espada",
      notation: "1d20+5",
      color: "blue",
      order: 1,
      category: "combate",
    });

    // Validar (não salvar)
    await mockUser.validate();
    await mockRoll.validate();
    await mockQuickRoll.validate();

    return NextResponse.json({
      success: true,
      message: "✅ Todos os models são válidos!",
      tests: {
        user: {
          email: mockUser.email,
          username: mockUser.username,
          hasPassword: !!mockUser.password,
        },
        roll: {
          dados: mockRoll.dados,
          resultados: mockRoll.resultados,
          total: mockRoll.total,
        },
        quickRoll: {
          name: mockQuickRoll.name,
          notation: mockQuickRoll.notation,
          color: mockQuickRoll.color,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao validar models",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
