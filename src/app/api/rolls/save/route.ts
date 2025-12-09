import { NextResponse } from "next/server";

import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";

export async function GET() {
  await dbConnect();
  const rolamentos = await Rolamento.find({}).limit(10).sort({ _id: -1 });
  return Response.json({ rolamentos });
}

export async function POST(request: Request) {
  try {
    console.log("=== API CHAMADA ===");

    // 1. Ler body UMA vez e armazenar
    const body = await request.json();
    console.log("Body recebido:", body);
    console.log("Tipo do total:", typeof body.total);
    console.log("Valor do total:", body.total);

    // 2. Usar body, não ler request.json() novamente
    const { dados, resultados, total } = body;

    //------------------------------------

    await dbConnect();

    if (
      typeof dados !== "string" ||
      !Array.isArray(resultados) ||
      typeof total !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid data types" },
        { status: 400 }
      );
    } else {
      const newPost = await Rolamento.create({ dados, resultados, total });
      return NextResponse.json(newPost);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro na APIrest:", error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

//usar este padrão para as próximas vezes que fizer um POST
// export async function POST(request: Request) {
//   try {
//     // 1. Parse body UMA vez
//     const body = await request.json();

//     // 2. Validar (isso vem do frontend)
//     const { dados, resultados, total } = body;
//     if (!dados || !Array.isArray(resultados) || typeof total !== 'number') {
//       return NextResponse.json(
//         { error: "Invalid data format" },
//         { status: 400 }
//       );
//     }

//     // 3. Processar (acessa o banco e tenta salvar nele)
//     await dbConnect();
//     const documento = await Rolamento.create({ dados, resultados, total });

//     // 4. Responder (apenas valida para dizer que funcionou)
//     return NextResponse.json({
//       success: true,
//       data: documento,
//       message: "Rolagem salva com sucesso!"
//     });

//   } catch (error: any) {
//     // 5. Error handling consistente
//     console.error("API Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal server error",
//         message: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }
