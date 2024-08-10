import { describe, it, after } from 'mocha';
import request from 'supertest';
import assert from 'assert';
import app from '..';

import { setupDb } from '../db';
import { seedUsers, seedScores } from '../scripts/helpers/seed';
import { UserModel } from '../db/schemas/user';
import { ScoreModel } from '../db/schemas/score';

describe('Users', () => {
  const clean = () => Promise.all([
    UserModel.deleteMany({}),
    ScoreModel.deleteMany({}),
  ]);

  before(async () => {
    setupDb();
    await clean();
    await Promise.all([
      seedUsers(100),
      seedScores(1000),
    ]);
  });

  after(clean);

  const buildAuthzHeader = (username: string) => {
    const auth = Buffer.from(`${username}:${username}`).toString('base64');
    return `Basic ${auth}`;
  };

  describe('GET /v1/me', () => {
    it('should use a basic auth and fetch current user profile', async () => {
      const user = await UserModel.findOne({});
      assert.ok(user, 'user seeded');

      let res = await request(app)
        .get('/v1/me')
        .set('Authorization', buildAuthzHeader(user.username))
        .expect(200);

      assert.strictEqual(res.body.username, user.username);
    });

    it('should fail if the password is wrong', async () => {
      const user = await UserModel.findOne({});
      assert.ok(user, 'user seeded');

      const auth = Buffer.from(`${user!.username}:foo`).toString('base64');
      let res = await request(app)
        .get('/v1/me')
        .set('Authorization', `Basic ${auth}`)
        .expect(401);
      assert.deepStrictEqual(res.body, { message: 'Invalid authentication' });
    });

    it('should fail if the user doesnt exists', async () => {
      let res = await request(app)
        .get('/v1/me')
        .set('Authorization', buildAuthzHeader('foo'))
        .expect(401);
      assert.deepStrictEqual(res.body, { message: 'Invalid authentication' });
    });
  });

  describe('GET /v1/users/{username}', () => {
    it('should fetch a user profile by username (without auth)', async () => {
      const user = await UserModel.findOne({});
      assert.ok(user, 'user seeded');

      let res = await request(app)
        .get(`/v1/users/${user.username}`)
        .expect(200);

      assert.deepStrictEqual(res.body, {
        id: user._id.toString(),
        username: user.username,
      });
    });

    it('should fetch a user profile by username (with auth)', async () => {
      const user = await UserModel.findOne({});
      assert.ok(user, 'user seeded');

      let res = await request(app)
        .get(`/v1/users/${user.username}`)
        .set('Authorization', buildAuthzHeader(user.username))
        .expect(200);

      assert.deepStrictEqual(res.body, {
        id: user._id.toString(),
        username: user.username,
      });
    });

    it('should return a 404 when the user doesnt exists', async () => {
      let res = await request(app)
        .get('/v1/users/not_existing_username')
        .expect(404);

      assert.deepStrictEqual(res.body, {
        message: 'User not found',
      });
    });

    it('should return a 401 when login is wrong, even if the endpoint can be used without authn', async () => {
      const user = await UserModel.findOne({});
      assert.ok(user, 'user seeded');

      return request(app)
        .get(`/v1/users/${user.username}`)
        .set('Authorization', buildAuthzHeader('foo'))
        .expect(401);
    });
  });
});