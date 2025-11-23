import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ContentModel, LinkModel, UserModel } from './db.js';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from './config.js';
import { userMiddleware } from './middleware.js';
import { random } from './utils.js';

const app = express();

const SALT_ROUNDS = 12;
app.use(express.json());

app.post('/api/v1/signup', async (req, res) => {
  //zod and hashpassword

  async function hashPassword(plain: string) {
    const hash = await bcrypt.hash(plain, SALT_ROUNDS);
    return hash;
  }
  const username = req.body.username;
  const password = req.body.password;
  const passwordHash = await hashPassword(password);

  try {
    await UserModel.create({
      username: username,
      password: passwordHash,
    });

    res.json({
      message: 'User signed up',
    });
  } catch (e) {
    res.status(411).json({
      message: `there is a error ${e}`,
    });
  }
});

app.post('/api/v1/signin', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await UserModel.findOne({
    username: username,
  });

  if (!user) {
    return res.status(401).json({ message: 'user not found' });
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({
      message: 'invalid credentials',
    });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'login successful',
    user: { id: user.id, username: user.username },
    token,
  });
});

app.post('/api/v1/content', userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  await ContentModel.create({
    link,
    type,
    userId: (req as any).userId,
    tags: [],
  });

  return res.json({
    message: 'content added',
  });
});

app.get('/api/v1/content', userMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const content = await ContentModel.find({
    userId: userId,
  }).populate('userId', 'username');
  res.json({
    content,
  });
});

app.delete('/api/v1/content', async (req, res) => {
  const contentId = req.body.contentId;
  const userId = (req as any).userId;

  try {
    const deleteContent = await ContentModel.deleteMany({
      contentId,
      userId: userId,
    });
    if (deleteContent) {
      res.json({
        message: 'content got deleted',
      });
    } else {
      res.send('error');
    }
  } catch (e) {
    res.status(401).json({
      message: { e },
    });
  }
});

app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {
  const share = req.body.share;
  if (share) {
    await LinkModel.create({
      //@ts-ignore
      userId: req.userId,
      hash: random(10),
    });
  } else {
    await LinkModel.deleteOne({
      //@ts-ignore
      userId: req.userId,
    });
  }

  res.json({
    message: 'Updated Sharable link',
  });
});

app.get('/api/v1/brain/:sharelink', async (req, res) => {
  const hash = req.params.sharelink;
  const link = await LinkModel.findOne({
    hash: hash,
  });
  if (!link) {
    res.status(411).json({
      message: 'Sorry incorrect input',
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });
});

app.listen(3000, () => {
  console.log('port running on 3000');
});
