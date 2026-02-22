import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

// Get all classes
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('classes').get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create class (Admin only)
router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const docRef = await db.collection('classes').add({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json({ id: docRef.id, message: 'Class created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('classes').doc(req.params.id).update(req.body);
    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete class
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await db.collection('classes').doc(req.params.id).delete();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Assign teacher to class
router.post('/:id/assign-teacher', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.body;
    await db.collection('classes').doc(req.params.id).update({ teacherId });
    res.json({ message: 'Teacher assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign teacher' });
  }
});

// Add student to class
router.post('/:id/add-student', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { studentId } = req.body;
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    const classData = classDoc.data();
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const studentIds = classData.studentIds || [];
    if (!studentIds.includes(studentId)) {
      studentIds.push(studentId);
      await db.collection('classes').doc(req.params.id).update({ studentIds });
    }
    
    res.json({ message: 'Student added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

export default router;
