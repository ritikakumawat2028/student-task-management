import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

// Get all users (Admin only)
router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update(req.body);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Approve user
router.post('/:id/approve', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update({ status: 'approved' });
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject user
router.post('/:id/reject', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update({ status: 'rejected' });
    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

export default router;
