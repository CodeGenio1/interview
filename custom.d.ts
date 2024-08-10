import type {
  UserHydratedDocument,
} from './db/schemas/user';

declare module 'express' {
  interface Request {
    user: UserHydratedDocument;

    operationDoc: {
      'x-security-required'?: boolean;
    }
  }
}
