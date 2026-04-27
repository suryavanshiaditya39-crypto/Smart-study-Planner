import mongoose from 'mongoose';

// MongoDB Connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, required: true },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    const { method } = req;
    const { id } = req.query;

    if (method === 'GET') {
      const { search, filter } = req.query;
      let query = {};

      if (search && search.trim() !== '') {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ];
      }

      if (filter === 'completed') {
        query.completed = true;
      } else if (filter === 'pending') {
        query.completed = false;
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 });
      const totalCount = await Task.countDocuments();
      const completedCount = await Task.countDocuments({ completed: true });
      const pendingCount = totalCount - completedCount;

      return res.status(200).json({
        success: true,
        stats: { total: totalCount, completed: completedCount, pending: pendingCount },
        tasks,
      });
    }

    if (method === 'POST') {
      const { title, subject, priority, dueDate, notes } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }
      if (!subject || subject.trim() === '') {
        return res.status(400).json({ success: false, message: 'Subject is required' });
      }
      if (!dueDate) {
        return res.status(400).json({ success: false, message: 'Due date is required' });
      }

      const newTask = new Task({ title, subject, priority, dueDate, notes });
      const savedTask = await newTask.save();

      return res.status(201).json({ success: true, message: 'Task created successfully', task: savedTask });
    }

    if (method === 'PUT') {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      if (req.body.toggle === true) {
        task.completed = !task.completed;
      } else {
        const { title, subject, priority, dueDate, notes } = req.body;

        if (!title || title.trim() === '') {
          return res.status(400).json({ success: false, message: 'Title is required' });
        }
        if (!subject || subject.trim() === '') {
          return res.status(400).json({ success: false, message: 'Subject is required' });
        }
        if (!dueDate) {
          return res.status(400).json({ success: false, message: 'Due date is required' });
        }

        task.title = title.trim();
        task.subject = subject.trim();
        task.priority = priority || 'medium';
        task.dueDate = dueDate;
        task.notes = notes || '';
      }

      const updatedTask = await task.save();
      return res.status(200).json({ success: true, message: 'Task updated successfully', task: updatedTask });
    }

    if (method === 'DELETE') {
      const deletedTask = await Task.findByIdAndDelete(id);

      if (!deletedTask) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      return res.status(200).json({ success: true, message: 'Task deleted successfully' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
