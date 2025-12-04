import { NextResponse } from "next/server";

import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";

export async function GET() {
  await dbConnect();
  const rolamentos = await Rolamento.find({});
  return Response.json({ rolamentos });
}

export async function POST(request: Request) {
  await dbConnect();
  const { dados, resultados, total } = await request.json();

  if (!dados || !resultados || !total) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  } else {
    const newPost = await Rolamento.create({ dados, resultados, total });
    return NextResponse.json(newPost);
  }
}
