#  technical backend test

This repository includes a sample Node HTTP app that provides an REST API with an OpenAPI Schema.
It uses MongoDB as an underlying database, so feel free to directly open it in Gitpod to have a running env in a few clicks.

You will find below 4 questions, please fork the repo as a private repo and complete them. 

There are no good or bad answers, we want to see how you would work on these questions using a high-level spec.

If you think something is going to take too much time to implement, you can write what you would do in English instead of coding it, with an estimation of how much time you would spend in it.

If you have remarks regarding a question you implement, please add some comments in your code or at the end of this README.

Once you completed the test, please invite @gierschv to this repository.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/FlatIO/interview-test-api)

## Base Objects and API

Our sample app includes the existing following objects:

* User: A user profile. For the simplicity of the test, a user can make some API calls using a Basic authentication where their password is their username (`username:username`).
* Score: A music score stored on our service.

We use OpenAPI 3 for our schema, so feel free to use the [online editor/preview](https://editor.swagger.io/) if needed.

You can seed some test data in your test DB with the script:

```bash
ts-node scripts/seed-test-data.ts
````

## Questions

### 1. Public scores

We would like to add 1 API endpoint to our frontend to list public scores.

High level specs:

* Our frontend will have one page with a list of scores.
* No changes to the DB schema should be needed.
* We have a lot of scores in DB, so a minimal pagination is welcome.

### 2. Likes

Our service works great and our users would like to know if others appreciate their creations. Like most of social network nowadays, we would like to add a feature that let a user "like" a public score.

High level specs:

* Our "like" feature will work like most of social network features (e.g. Github, Twitter).
* We want our users to be able to "like" and "unlike" a score. A user can only like a score once.
* When displaying a score or the list of scores, we would like to show the number of likes.
* In production our service already have millions of scores in the collection. We also have more trafic to view public scores (e.g. unauthenticated users) that engagement on our website.

### 3. Leaderboard

Now that we have a lot of activity on the public scores, we would like to know what our community likes.

Write a MongoDB query that will list the top 20 of the likes scores over the last week.

### 4. Typescript

Update the TS types from your schema by running `pnpm run build-schema-types` (which uses [openapi-typescript](https://www.npmjs.com/package/openapi-typescript)).
This command will update the types definitons file in `api/schema.d.ts`.

In this last question, we would like to provide types for our requests and responses based on our schema.
For example with /me, we would like to check that the returned object matches the written OpenAPI specification, when writing the following code:

```ts
export const getMe = apiControllerJson<'getMe'>(async (req) => {
  return req.user.toPublic();
});
```

Write the `apiControllerJson` function that will at least type-check the returned response. Then you can use to check your code from 1. and 2.
