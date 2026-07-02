import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// import pkg from '@prisma/client';
// const { PrismaClient } = pkg;

dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Data fallbacks (matches frontend Dashboard.jsx)
const mockAttendance = [
  { subject: 'Data Structures', percent: 82, status: 'On track' },
  { subject: 'Signals', percent: 68, status: 'Needs attention' },
  { subject: 'Linear Algebra', percent: 91, status: 'Strong' },
];

const mockResults = [
  { subject: 'Data Structures', grade: 'A', gpa: 9.2 },
  { subject: 'Machine Learning', grade: 'B+', gpa: 8.5 },
  { subject: 'Web Systems', grade: 'A-', gpa: 8.8 },
];

const mockEvents = [
  { title: 'Mid-semester review', date: 'Jun 30', venue: 'Main Auditorium' },
  { title: 'Library night', date: 'Jul 04', venue: 'Library' },
  { title: 'Tech fest registration', date: 'Jul 10', venue: 'Central Plaza' },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Virtual Campus Backend is running.' });
});

// Get student attendance
app.get('/api/students/:id/attendance', async (req, res) => {
  try {
    // In a real app, calculate from Prisma: await prisma.attendance.findMany(...)
    // For now, return mock data matching frontend design
    res.json(mockAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get student results
app.get('/api/students/:id/results', async (req, res) => {
  try {
    // const results = await prisma.result.findMany({ where: { studentId: req.params.id } });
    // if (results.length > 0) {
    //   res.json(results);
    // } else {
      res.json(mockResults);
    // }
  } catch (error) {
    // Fallback to mock data if DB isn't running
    res.json(mockResults);
  }
});

// Get events
app.get('/api/events', async (req, res) => {
  try {
    // const events = await prisma.event.findMany();
    // if (events.length > 0) {
    //   res.json(events.map(e => ({
    //     title: e.title,
    //     date: e.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    //     venue: e.locationTag || 'Campus'
    //   })));
    // } else {
      res.json(mockEvents);
    // }
  } catch (error) {
    // Fallback to mock data if DB isn't running
    res.json(mockEvents);
  }
});

// Get student profile overview
app.get('/api/students/:id/profile', async (req, res) => {
  res.json({
    name: 'Asha',
    department: 'CSE',
    semester: 5,
    stats: {
      attendance: '84%',
      cgpa: '8.7',
      pendingResults: 3,
      upcomingEvents: 5
    }
  });
});

import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Mock student context for the prompt
    const student = {
      name: 'Asha',
      department: 'CSE',
      semester: 5,
      attendance: '84%',
      cgpa: '8.7'
    };

    const systemPrompt = `You are CampusGuide, an intelligent AI assistant for a Student Management System.
You are the official AI assistant of Virtual Campus Student Management System.

Your responsibilities:
* Help students with attendance, results, courses, events, academic schedules, and campus information.
* Answer questions clearly, professionally, and concisely.
* Encourage students to maintain good academic performance.
* If attendance is below 75%, politely warn the student about attendance requirements.
* Explain grades, CGPA, and academic performance in simple language.
* Provide information about upcoming campus events and deadlines when available.
* Assist with study planning, time management, project ideas, and career guidance.
* Be friendly, supportive, and professional.
* If information is unavailable, politely state that you do not have access to that data.
* Never generate false student records or modify academic data.
* Keep responses short and student-friendly unless detailed explanations are requested.

Student Information:
Name: ${student.name}
Department: ${student.department}
Semester: ${student.semester}
Attendance: ${student.attendance}
CGPA: ${student.cgpa}

Use this information to answer student questions.
Keep responses concise and helpful.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to chat with CampusGuide' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
