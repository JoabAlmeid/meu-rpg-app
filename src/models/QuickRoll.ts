import mongoose, { Schema, models, Document } from "mongoose";

export interface IQuickRoll extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string; // "Ataque com Espada"
  notation: string; // "1d20+5"
  color: string; // "#3b82f6"
  order: number; // 0, 1, 2...
  category?: string; // "combat", "skills", "magic", "item", "other"
  createdAt: Date;
  updatedAt: Date;
}

const QuickRollSchema = new Schema<IQuickRoll>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, //quick rolls sempre pertencem a um usuário
    },
    name: {
      type: String,
      required: true,
    },
    notation: {
      type: String,
      required: [true, "Notação é obrigatória"],
      match: [/^\d+d\d+(?:\+\d+)?$/, "Formato inválido. Use: XdY ou XdY+Z"],
    },
    color: {
      type: String,
      default: "azul",
      enum: ["vermelho", "azul", "verde", "amarelo", "roxo", "cinza"],
    },
    order: {
      type: Number,
      default: 0, // ← Auto-increment ou definido depois
      min: 0,
    },
    category: {
      type: String,
      enum: ["combate", "perícias", "magia", "item", "outros"],
      default: "outros",
    },
  },
  {
    timestamps: true,
  },
);

//índice para buscas rápidas por usuário
QuickRollSchema.index({ userId: 1, order: 1 });

const QuickRoll =
  models.QuickRoll || mongoose.model<IQuickRoll>("QuickRoll", QuickRollSchema);
export default QuickRoll;
