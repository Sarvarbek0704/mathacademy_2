import type { RequestUser } from '../auth/jwt-request.util';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export {};
