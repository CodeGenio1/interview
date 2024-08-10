import type { Request } from 'express';
import auth from 'basic-auth';
import { UserHydratedDocument, UserModel } from '../../db/schemas/user';
import { ApiError } from '../errors/apiError';


export async function basicScheme(req: Request) {
  const { name, pass } = auth(req) || {};

  // Auth present
  if (typeof name !== 'undefined') {
    if (name !== pass) {
      throw new ApiError('Invalid authentication', 401, 'AUTH_INVALID');
    }

    const user = await UserModel.findOne<UserHydratedDocument>({ username: name });
    if (!user) {
      throw new ApiError('Invalid authentication', 401, 'AUTH_INVALID');
    }

    req.user = user;
    return true;
  }

  // Authn not required on endpoint
  if (req.operationDoc['x-security-required'] === false) {
    return true;
  }

  const error = new ApiError('Invalid authentication', 401, 'AUTH_INVALID');
  error.challenge = 'Basic realm=Unauthorized';

  throw error;
};