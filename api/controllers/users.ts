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

  // Get page and perPage from query parameters, with default values
  let page = parseInt(req.query.page as string, 10) || 1; // Default to page 1 if not provided
  const perPage = parseInt(req.query.perPage as string, 10) || 198; // Default to 15 if not provided

  // Get total number of records
  const totalRecords = await ScoreModel.countDocuments({}).exec();

  // Calculate total number of pages
  const totalPages = Math.ceil(totalRecords / perPage);

  page = page < totalPages ? page : totalPages;

  // Calculate the number of records to skip
  const skip = (page - 1) * perPage;

  // Query the database with pagination
  const scores = await ScoreModel.find({})
    .skip(skip)
    .limit(perPage)
    .exec();

  // Render the results
  res.render('index', { scores, page, perPage, totalPages });
}
