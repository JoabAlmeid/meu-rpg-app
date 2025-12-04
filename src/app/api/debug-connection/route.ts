import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mostra informações úteis (sem expor senha completa)
  const uri = process.env.MONGODB_URI || "NÃO ENCONTRADA";

  // Esconde a senha para segurança
  const safeUri = uri.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    "mongodb+srv://$1:****@"
  );

  res.json({
    hasEnvFile: !!process.env.MONGODB_URI,
    uriLength: uri.length,
    uriPreview: safeUri,
    nodeEnv: process.env.NODE_ENV,
    tip: "Verifique: 1) Senha resetada 2) IP whitelist 3) .env.local na raiz",
  });
}
