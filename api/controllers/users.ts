import type { Request } from 'express';
import { UserHydratedDocument, UserModel } from '../../db/schemas/user';
import { ApiError } from '../errors/apiError';
import { jsonWrap } from '../helpers/responses';
import { ScoreModel } from '../../db/schemas/score';

export const getMe = jsonWrap(

  async (req: Request, res: any) => {
    return req.user.toPublic();
  }

);

export const getUserProfile = jsonWrap(async (req: Request) => {
  const { username } = req.params;

  const user = await UserModel.findOne<UserHydratedDocument>({ username });
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user.toPublic();
});

export const getIndex = async (req: Request, res: any) => {
  const scores = await ScoreModel.find({}); //[ { title: 'ab'}, { title: 'cd'}] //
  
  res.render('index', { scores });
}
