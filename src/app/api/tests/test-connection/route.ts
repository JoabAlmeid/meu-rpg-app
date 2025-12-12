/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json(
      {
        error: "❌ MONGODB_URI não encontrada no .env.local",
      },
      { status: 500 }
    );
  }

  let client;

  try {
    // 1. Conectar
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Conectado ao MongoDB");

    // 2. Listar bancos disponíveis
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();

    // 3. Tentar acessar SEU banco
    const db = client.db("rpg-dados");

    // 4. Listar collections do SEU banco
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    return NextResponse.json({
      success: true,
      connection: "✅ Conectado com sucesso!",
      yourDatabase: "rpg-dados",
      collectionsFound: collectionNames,
      allDatabases: databases.databases.map((db) => db.name),
      tip: collectionNames.includes("rolamentos")
        ? '✅ Collection "rolamentos" encontrada!'
        : '⚠️ Collection "rolamentos" não encontrada. Nomes encontrados: ' +
          collectionNames.join(", "),
    });
  } catch (error: any) {
    // Mostra URI com senha escondida para debug
    const safeUri = uri.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      "mongodb+srv://$1:****@"
    );

    return NextResponse.json(
      {
        success: false,
        error: "❌ Erro de conexão",
        message: error.message,
        yourURI: safeUri,
        commonFixes: [
          '1. Banco "rpg-dados" existe no Atlas?',
          '2. Collection "rolamentos" existe dentro dele?',
          "3. IP está na whitelist?",
        ],
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
