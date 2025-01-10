import type { Request, Response, NextFunction } from 'express';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
// Define JWT payload interface
interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}
// Middleware to authenticate JWT token
export const authenticateToken = (req: Request & { user?: JwtPayload }, _: Response, next: NextFunction) => {
  // Retrieve Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Extract token from the header
    const token = authHeader.split(' ')[1];
    // Get secret key from environment variables
    const secretKey = process.env.JWT_SECRET_KEY || '';
    // Verify JWT token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      // Attach decoded user info to the request object
      req.user = decoded as JwtPayload;
      return next();
    });
  } else {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHORIZED' },
    });
  }
};
// Function to sign a JWT token
export const signToken = (username: string, email: string, _id: string) => {
  // Create payload
  const payload = { username, email, _id };
  // Get secret key from environment variables
  const secretKey = process.env.JWT_SECRET_KEY || '';
  // Generate JWT token with 1-hour expiry
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
  