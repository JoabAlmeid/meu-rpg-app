import mongoose, { Schema, models } from "mongoose";

const RolamentoSchema = new Schema(
  {
    dados: {
      type: String,
      required: true,
      match: /^\d+d\d+$/, //valida formato "2d6", "3d20", etc
    },
    resultados: [
      {
        type: Number,
        min: 1,
        max: 100, //já limita aqui
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, //adiciona createdAt e updatedAt automaticamente
  }
);

const Rolamento =
  models.Rolamento || mongoose.model("Rolamento", RolamentoSchema);
export default Rolamento;
