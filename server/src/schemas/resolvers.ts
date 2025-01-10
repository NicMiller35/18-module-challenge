import  User  from '../models/User.js'; // Import Mongoose User model
import { AuthenticationError } from 'apollo-server-express'; // For handling auth errors
import { signToken } from '../services/auth.js'; // Use your existing auth utility

export const resolvers = {
  Query: {
   
    // Get the logged-in user's details
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findById(context.user._id);
    },
  },
  
  Mutation: {
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser.username, newUser.email, String(newUser._id));
      return { token, user: newUser };
    },
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      const isValidPassword = await user.isCorrectPassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = signToken(user.username, user.email, String(user._id));
      return { token, user };
    },
    saveBook: async (_parent: any, { input }: { input: any }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } },
        { new: true }
      );
    },
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};

export default resolvers;