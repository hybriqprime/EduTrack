// Populates the database with realistic demo data for pitching to school proprietors.
// Run with: npm run seed  (after setting MONGO_URI in .env)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Result = require('./models/Result');
const Fee = require('./models/Fee');

const SESSION = '2025/2026';
const TERM = 'Second Term';

const run = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Result.deleteMany({}),
    Fee.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Mrs. Adeola Fashola',
    email: 'admin@demoschool.com',
    password: 'password123',
    role: 'admin',
  });

  const teacher = await User.create({
    name: 'Mr. Chidi Okonkwo',
    email: 'teacher@demoschool.com',
    password: 'password123',
    role: 'teacher',
    classesTaught: ['JSS 1'],
  });

  const parent1 = await User.create({
    name: 'Mr. Bola Adebayo',
    email: 'parent1@demoschool.com',
    password: 'password123',
    role: 'parent',
  });

  const parent2 = await User.create({
    name: 'Mrs. Ngozi Eze',
    email: 'parent2@demoschool.com',
    password: 'password123',
    role: 'parent',
  });

  console.log('Creating students...');
  const students = await Student.create([
    {
      firstName: 'Tobi',
      lastName: 'Adebayo',
      admissionNumber: 'DS/2024/001',
      className: 'JSS 1',
      gender: 'male',
      dateOfBirth: new Date('2013-03-14'),
      parent: parent1._id,
    },
    {
      firstName: 'Ifeoma',
      lastName: 'Eze',
      admissionNumber: 'DS/2024/002',
      className: 'JSS 1',
      gender: 'female',
      dateOfBirth: new Date('2013-07-02'),
      parent: parent2._id,
    },
    {
      firstName: 'Kunle',
      lastName: 'Ogundipe',
      admissionNumber: 'DS/2024/003',
      className: 'JSS 1',
      gender: 'male',
      dateOfBirth: new Date('2013-01-20'),
    },
    {
      firstName: 'Amara',
      lastName: 'Nwosu',
      admissionNumber: 'DS/2024/004',
      className: 'JSS 1',
      gender: 'female',
      dateOfBirth: new Date('2013-09-11'),
    },
  ]);

  // Link parent1's and parent2's children back for convenience
  parent1.children = [students[0]._id];
  parent2.children = [students[1]._id];
  await parent1.save();
  await parent2.save();

  console.log('Creating results...');
  const subjectSets = [
    [
      { subject: 'Mathematics', score: 78 },
      { subject: 'English Language', score: 82 },
      { subject: 'Basic Science', score: 75 },
      { subject: 'Social Studies', score: 88 },
    ],
    [
      { subject: 'Mathematics', score: 91 },
      { subject: 'English Language', score: 85 },
      { subject: 'Basic Science', score: 93 },
      { subject: 'Social Studies', score: 80 },
    ],
    [
      { subject: 'Mathematics', score: 65 },
      { subject: 'English Language', score: 70 },
      { subject: 'Basic Science', score: 60 },
      { subject: 'Social Studies', score: 72 },
    ],
    [
      { subject: 'Mathematics', score: 55 },
      { subject: 'English Language', score: 60 },
      { subject: 'Basic Science', score: 58 },
      { subject: 'Social Studies', score: 63 },
    ],
  ];

  for (let i = 0; i < students.length; i++) {
    await Result.create({
      student: students[i]._id,
      className: 'JSS 1',
      term: TERM,
      session: SESSION,
      subjects: subjectSets[i],
      teacherComment: 'Good performance this term. Keep up the effort.',
    });
  }

  console.log('Creating fee records...');
  await Fee.create([
    {
      student: students[0]._id,
      term: TERM,
      session: SESSION,
      amountDue: 85000,
      amountPaid: 85000,
      dueDate: new Date('2026-01-15'),
    },
    {
      student: students[1]._id,
      term: TERM,
      session: SESSION,
      amountDue: 85000,
      amountPaid: 40000,
      dueDate: new Date('2026-01-15'),
    },
    {
      student: students[2]._id,
      term: TERM,
      session: SESSION,
      amountDue: 85000,
      amountPaid: 0,
      dueDate: new Date('2026-01-15'),
    },
    {
      student: students[3]._id,
      term: TERM,
      session: SESSION,
      amountDue: 85000,
      amountPaid: 85000,
      dueDate: new Date('2026-01-15'),
    },
  ]);

  console.log('\nSeed complete. Demo login credentials:');
  console.log('  Admin:   admin@demoschool.com / password123');
  console.log('  Teacher: teacher@demoschool.com / password123');
  console.log('  Parent:  parent1@demoschool.com / password123  (sees Tobi Adebayo)');
  console.log('  Parent:  parent2@demoschool.com / password123  (sees Ifeoma Eze)');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
