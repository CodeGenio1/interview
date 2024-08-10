import { ScoreModel } from '../../db/schemas/score';
import { UserModel } from '../../db/schemas/user';

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

export function seedUsers(count = 100) {
  const usernames = new Set();
  for (let i = 0; i < count; i++) {
    usernames.add(uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
    }));
  }
  return UserModel.insertMany(
    Array.from(usernames).map(username => ({
      username,
      email: `${username}@tests.tutteo.com`,
      registrationDate: new Date(+(new Date()) - Math.floor(Math.random()*10000000000)),
    }))
  );
};

export function seedScores(count = 1000) {
  const titles = new Set();
  for (let i = 0; i < count; i++) {
    titles.add(uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: ' ',
    }));
  }
  return ScoreModel.insertMany(
    Array.from(titles).map(title => ({
      title,
      privacy: Math.round(Math.random()) ? 'public' : 'private'
    }))
  );
};