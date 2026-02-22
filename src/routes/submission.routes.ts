import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

// Get all submissions
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('submissions').get();
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submissions by assignment
router.get('/assignment/:assignmentId', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('submissions')
      .where('assignmentId', '==', req.params.assignmentId)
      .get();
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Submit assignment (Student only)
router.post('/', verifyToken, requireRole(['student']), async (req, res) => {
  try {
    const docRef = await db.collection('submissions').add({
      ...req.body,
      submittedAt: new Date()
    });
    res.status(201).json({ id: docRef.id, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// Grade submission (Teacher only)
router.put('/:id/grade', verifyToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { feedback, marks } = req.body;
    await db.collection('submissions').doc(req.params.id).update({
      feedback,
      marks,
      status: 'graded'
    });
    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

export default router;
