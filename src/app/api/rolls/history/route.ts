import dbConnect from "@/lib/connectMongo";
import Rolamento from "../../../../../models/Roll";

export async function GET() {
  await dbConnect();
  const rolamentos = await Rolamento.find({}).limit(10).sort({ createdAt: -1 }); //mais recente
  return Response.json({ rolamentos });
}
