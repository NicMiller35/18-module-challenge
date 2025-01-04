import User from '../models/User'; 
import { AuthenticationError } from 'apollo-server-express';
import { signToken } from '../services/auth';

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

/*const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
    }
};

export default resolvers;
*/

