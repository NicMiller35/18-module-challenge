import  User  from '../models/User'; // Import Mongoose User model
import { AuthenticationError } from 'apollo-server-express'; // For handling auth errors
import { signToken } from '../services/auth'; // Use your existing auth utility

export const resolvers = {
  Query: {
    // Fetch all users
    users: async () => {
      return await User.find({});
    },
    // Fetch a single user by ID
    user: async (_parent: any, { id }: { id: string }) => {
      return await User.findById(id);
    },
    // Get the logged-in user's details
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findById(context.user._id);
    },
  },
  
  Mutation: {
    // Register a new user
    register: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser.username, newUser.email, newUser._id);
      return { token, user: newUser };
    },
    // Login an existing user
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      const isValidPassword = await user.isCorrectPassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // Update a user's profile
    updateUser: async (_parent: any, { id, username, email }: { id: string; username?: string; email?: string }) => {
      return await User.findByIdAndUpdate(id, { username, email }, { new: true });
    },
    // Delete a user
    deleteUser: async (_parent: any, { id }: { id: string }) => {
      return await User.findByIdAndDelete(id);
    },
  },
};

export default resolvers;