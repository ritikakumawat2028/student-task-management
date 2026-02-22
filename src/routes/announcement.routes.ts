import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

// Get all announcements
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('announcements').get();
    const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement (Teacher only)
router.post('/', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    const docRef = await db.collection('announcements').add({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json({ id: docRef.id, message: 'Announcement created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Delete announcement
router.delete('/:id', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    await db.collection('announcements').doc(req.params.id).delete();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;
