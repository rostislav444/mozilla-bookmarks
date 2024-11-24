import express from 'express';
import { getDb } from './db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get all bookmarks for current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const bookmarks = await db.collection('bookmarks')
      .find({ userId: req.user._id })
      .toArray();
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new bookmark
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const bookmark = {
      ...req.body,
      userId: req.user._id,
      createdAt: new Date()
    };
    const result = await db.collection('bookmarks').insertOne(bookmark);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete bookmark
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('bookmarks').deleteOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;