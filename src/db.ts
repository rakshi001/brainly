import mongoose, { model, Schema } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION as string);
    console.log('DB connected');
  } catch (err) {
    console.error('DB error:', err);
  }
}

connectDB();

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
});

export const UserModel = model('User', UserSchema);

const ContentSchema = new Schema({
  title: String,
  link: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
});

export const ContentModel = model('Content', ContentSchema);
