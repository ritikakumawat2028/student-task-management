import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    mode: 'localStorage (no Firebase needed)',
    timestamp: new Date().toISOString() 
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'EduTask Backend API',
    version: '1.0.0',
    mode: 'localStorage',
    note: 'All data is stored in browser localStorage. Backend is optional.'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Mode: localStorage (no Firebase needed)`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
