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
export const authenticateToken = ({req}: any) => {
  // Retrieve Authorization header
  let token = req.body.token || req.query.token || req.headers.authorization;
  // If the token is sent in the authorization header, extract the token from the header
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  // If no token is provided, return the request object as is
  if (!token) {
    return req;
  }
  // Try to verify the token
  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
    // If the token is valid, attach the user data to the request object
    req.user = data as JwtPayload;
  } catch (err) {
    // If the token is invalid, log an error message
    console.log('Invalid token');
  }
  // Return the request object
  return req;
};

// Function to sign a JWT token
export const signToken = (username: string, email: string, _id: string) => {
  // Create payload
  const payload = { username, email, _id };

  // Get secret key from environment variables
  const secretKey = process.env.JWT_SECRET_KEY || '';

  // Generate JWT token with 1-hour expiry
  return jwt.sign({ data: payload}, secretKey, { expiresIn: '1h' });
};