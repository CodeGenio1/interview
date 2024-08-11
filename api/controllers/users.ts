import { ScoreUserLikeModel } from './../../db/schemas/score-user-likes';
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

  const scores = await ScoreModel.aggregate([
    {
      $lookup: {
        from: 'ScoreUserLikeModel', // The collection name in MongoDB
        localField: '_id',
        foreignField: 'scoreId',
        as: 'likes'
      }
    },
    {
      $addFields: {
        totalLikes: { $size: '$likes' } // Count the number of likes
      }
    },
    {
      $project: {
        likes: 0 // Optionally exclude the likes array from the output
      }
    },
    {
      $skip: skip
    },
    {
      $limit: perPage
    }
  ]);

  res.render('index', { scores, page, perPage, totalPages });
}

/**
 * Add a like by a user to a score
 * @route POST /likes
 * @param {string} userId - ID of the user
 * @param {string} scoreId - ID of the score
 */
export const likeScore = async (req: Request, res: any) => {
  const { userId, scoreId } = req.body;

  if (!userId || !scoreId) {
    return res.status(400).json({ message: 'userId and scoreId are required' });
  }

  try {
    // Check if the like already exists
    const existingLike = await ScoreUserLikeModel.findOne({ userId, scoreId });
    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this score' });
    }
    console.log('here 2')
    // Create a new like document
    const newLike = new ScoreUserLikeModel({
      userId,
      scoreId
    });

    await newLike.save();

    res.status(200).json(newLike);
  
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

