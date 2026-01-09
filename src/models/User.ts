import mongoose, { Schema, models, Document } from "mongoose";
import bcrypt from "bcrypt";

//definir interface para TypeScript
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor, use um email válido"], //validação
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Senha deve ter no mínimo 6 caracteres"],
    },
    username: {
      type: String,
      required: true,
      unique: true, //não sei se vou deixar unique
      trim: true,
      minlength: [3, "Username deve ter no mínimo 3 caracteres"],
      maxlength: [30, "Username deve ter no máximo 30 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

//método para hash da senha (chamar manualmente antes de salvar)
//não deu pra usar o middleware UserSchema.pre por algum motivo, então ficamos sem
UserSchema.methods.hashPassword = async function (
  password: string
): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

//método para comparar senha com a do banco de dados
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
