import { model, Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const User = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  registrationDate: { type: Date, default: Date.now, required: true },
});

type IUser = InferSchemaType<typeof User>;
export type UserHydratedDocument = HydratedDocument<IUser, IUserMethods>;

interface IUserMethods {
  toPublic(this: UserHydratedDocument): {
    id: string,
    username: string,
  }
}

User.method('toPublic', function () {
  return {
    id: this._id.toString(),
    username: this.username,
  };
} as IUserMethods['toPublic']);

export const UserModel = model<IUser>('User', User);