import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

// Get all assignments
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('assignments').get();
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignments by class
router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('assignments')
      .where('classId', '==', req.params.classId)
      .get();
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Create assignment (Teacher only)
router.post('/', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    const docRef = await db.collection('assignments').add({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json({ id: docRef.id, message: 'Assignment created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment
router.put('/:id', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    await db.collection('assignments').doc(req.params.id).update(req.body);
    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment
router.delete('/:id', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    await db.collection('assignments').doc(req.params.id).delete();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;
