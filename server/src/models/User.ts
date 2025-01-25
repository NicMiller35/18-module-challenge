import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Import schema and types from Book.js
import bookSchema from './Book.js';
import type { BookDocument } from './Book.js';

// Define the UserDocument interface to extend Mongoose's Document
export interface UserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number; // Virtual property
}

// Create the User schema
const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Enforces unique usernames
    },
    email: {
      type: String,
      required: true,
      unique: true, // Enforces unique emails
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    // Array of books adhering to the bookSchema
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true, // Include virtuals when data is serialized
    },
  }
);

// Middleware: Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method: Validate user password
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Virtual: Calculate the number of saved books
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

// Create and export the User model
const User = model<UserDocument>('User', userSchema);
export default User;