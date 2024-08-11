import { ScoreUserLikeModel } from './../../db/schemas/score-user-likes';
import type { Request } from 'express';
import { UserHydratedDocument, UserModel } from '../../db/schemas/user';
import { ApiError } from '../errors/apiError';
import { jsonWrap } from '../helpers/responses';
import { ScoreModel } from '../../db/schemas/score';
import mongoose from 'mongoose';

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
  const username = req.query.username

  /**
   * In actual code, userId should be taken from request as it is being set by security middleware
   * const userId = req.user._id
   */
  const userId = '66b78c0f1c55a015667308b8'

  // Get total number of records
  const totalRecords = await ScoreModel.countDocuments({}).exec();

  // Calculate total number of pages
  const totalPages = Math.ceil(totalRecords / perPage);

  page = page < totalPages ? page : totalPages;

  // Calculate the number of records to skip
  const skip = (page - 1) * perPage;

  const scores = await ScoreModel.aggregate([
    // Match stage to filter documents if needed
    {
      $match: {
        privacy: 'public'
      }
    },

    // Lookup stage 1: Total Likes
    {
      $lookup: {
        from: 'scoreuserlikes', // The collection that stores the likes
        localField: '_id',       // Field in the ScoreModel
        foreignField: 'scoreId', // Field in the ScoreUserLikeModel
        as: 'likes'
      }
    },
    {
      $addFields: {
        totalLikes: { $size: '$likes' }
      }
    },

    // Lookup stage 2: Current User Liked or Not
    {
      $lookup: {
        from: 'scoreuserlikes', // The collection name for the likes
        let: { scoreId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$scoreId', '$$scoreId'] },
                  { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] }
                ]
              }
            }
          }
        ],
        as: 'userLiked'
      }
    },
    {
      $addFields: {
        userHasLiked: {
          $cond: { if: { $gt: [{ $size: '$userLiked' }, 0] }, then: true, else: false }
        }
      }
    },
    {
      $project: {
        userLiked: 0 // Exclude the userLiked array from the final output
      }
    },
    {
      $skip: skip, // Skip for pagination
    },
    {
      $limit: perPage // Limit for pagination
    }
  ]);

  console.log(scores);

  res.render('index', { scores, page, perPage, totalPages });
}

/**
 * Add a like by a user to a score
 * @route POST /like-score
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

/**
 * Delete a like by a user to a score
 * @route POST /unlike-score
 * @param {string} userId - ID of the user
 * @param {string} scoreId - ID of the score
 */
export const unlikeScore = async (req: Request, res: any) => {
  const { userId, scoreId } = req.body;

  if (!userId || !scoreId) {
    return res.status(400).json({ message: 'userId and scoreId are required' });
  }

  try {
    const result = await ScoreUserLikeModel.deleteOne({ userId, scoreId });
    const resp = { message: '' };

    if (result.deletedCount > 0) {
      resp.message = 'Successfully deleted the like';
    } else {
      resp.message = 'No matching document found.';
    }

    res.status(200).json(resp);

  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeaderboard = async (req: Request, res: any) => {
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Aggregation query
  const scores = await ScoreModel.aggregate([
    // Match stage to filter documents if needed
    {
      $match: {
        privacy: 'public'
      }
    },

    // Lookup to join with ScoreUserLike collection
    {
      $lookup: {
        from: 'scoreuserlikes', // The collection that stores the likes
        localField: '_id',       // Field in the ScoreModel
        foreignField: 'scoreId', // Field in the ScoreUserLikeModel
        as: 'likes'
      }
    },

    // Match likes created in the last week
    {
      $addFields: {
        likes: {
          $filter: {
            input: '$likes',
            as: 'like',
            cond: { $gte: ['$$like.createdAt', oneWeekAgo] }
          }
        }
      }
    },

    // Add a field to count the number of likes
    {
      $addFields: {
        totalLikes: { $size: '$likes' }
      }
    },

    {
      $match: { totalLikes: { $gt: 0 } }
    },

    // Sort by the total number of likes in descending order
    {
      $sort: { totalLikes: -1 }
    },

    // Limit the results to the top 20 scores
    {
      $limit: 20
    },

    // Project the fields
    {
      $project: {
        _id: 1,
        title: 1,
        totalLikes: 1,
        privacy: 1
      }
    }
  ]).exec();

  console.log(scores);

  res.render('leaderboard', { scores });
}

