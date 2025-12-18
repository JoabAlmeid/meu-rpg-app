import { NextResponse } from "next/server";

import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";

export async function GET() {
  await dbConnect();
  const rolamentos = await Rolamento.find({}).limit(10).sort({ _id: -1 });
  return NextResponse.json({ rolamentos });
}

export async function POST(request: Request) {
  try {
    console.log("=== API CHAMADA ===");

    //1) ler body UMA vez e armazenar
    const body = await request.json();
    console.log("Body recebido:", body);

    //2) extrair dados do body, não ler request.json() novamente
    const { dados, resultados, total, userId } = body;

    //3) validação básica pra ver se tem dados dentro do array
    if (!dados || !Array.isArray(resultados) || total === undefined) {
      return NextResponse.json(
        { error: "Dados incompletos ou inválidos" },
        { status: 400 }
      );
    }

    //4) conecta ao banco
    await dbConnect();

    //5) verifica se o ID de usuário é válido e se já existe no banco de dados
    let validUserId = null;
    if (userId) {
      //verifica se é um ObjectId, variável do mongoDB, válido usando regex
      //se não usa caracter especial, se é hexadecimal, e se não tem 24 char
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        return NextResponse.json(
          { error: "ID de usuário inválido" },
          { status: 400 }
        );
      }

      //DESABILITANDO TEMPORARIAMENTE. Quando tiver como criar usuário isso aqui volta
      // const userExists = await User.findById(userId);
      // if (!userExists) {
      //   return NextResponse.json(
      //     { error: "Usuário não encontrado" },
      //     { status: 400 }
      //   );
      // }

      //passando pelos testes, o validUserId que era null recebe o ID que é passado pelo POST
      //validUserId recebe type: mongoose.Schema.Types.ObjectId, variável do próprio mongoDB
      validUserId = userId;
    }

    //6) cria documento pra ser salvo no banco de dados
    const rollDocument = {
      dados,
      resultados,
      total,
      userId: validUserId, //pode ser null ou ObjectId válido
    };

    //6) salva documento no banco com todas as informações que vieram pelo POST
    const newRoll = await Rolamento.create(rollDocument);
    console.log("✅ Rolamento salvo:", newRoll._id);

    // 8. Retornar resposta
    return NextResponse.json(newRoll);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
