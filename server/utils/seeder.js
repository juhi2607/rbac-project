/**
 * Database Seeder
 * Creates default admin, manager, and user accounts for testing
 * Run: node server/utils/seeder.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@protrack.com',
    password: 'Admin123',
    role: 'Admin',
  });

  const manager = await User.create({
    name: 'Manager User',
    email: 'manager@protrack.com',
    password: 'Manager123',
    role: 'Manager',
  });

  const user1 = await User.create({
    name: 'John Doe',
    email: 'user@protrack.com',
    password: 'User1234',
    role: 'User',
  });

  const user2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@protrack.com',
    password: 'Jane1234',
    role: 'User',
  });

  console.log('Users created');

  // Create projects
  const project1 = await Project.create({
    title: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern UI/UX',
    status: 'Active',
    priority: 'High',
    manager: manager._id,
    members: [manager._id, user1._id, user2._id],
    createdBy: admin._id,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const project2 = await Project.create({
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile application using React Native',
    status: 'Planning',
    priority: 'Critical',
    manager: manager._id,
    members: [manager._id, user1._id],
    createdBy: admin._id,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  });

  const project3 = await Project.create({
    title: 'API Integration',
    description: 'Integrate third-party payment and shipping APIs',
    status: 'Active',
    priority: 'Medium',
    manager: manager._id,
    members: [manager._id, user2._id],
    createdBy: admin._id,
  });

  console.log('Projects created');

  // Create tasks
  await Task.create([
    {
      title: 'Design homepage wireframes',
      description: 'Create wireframes for the new homepage design',
      status: 'Completed',
      priority: 'High',
      project: project1._id,
      assignedTo: user1._id,
      createdBy: manager._id,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Implement responsive navigation',
      description: 'Build a fully responsive navigation bar',
      status: 'In Progress',
      priority: 'High',
      project: project1._id,
      assignedTo: user1._id,
      createdBy: manager._id,
    },
    {
      title: 'Optimize website performance',
      description: 'Achieve 90+ Lighthouse performance score',
      status: 'Todo',
      priority: 'Medium',
      project: project1._id,
      assignedTo: user2._id,
      createdBy: manager._id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated deployment',
      status: 'Review',
      priority: 'Medium',
      project: project1._id,
      assignedTo: user2._id,
      createdBy: manager._id,
    },
    {
      title: 'Design app architecture',
      description: 'Plan the mobile app structure and component hierarchy',
      status: 'In Progress',
      priority: 'Critical',
      project: project2._id,
      assignedTo: user1._id,
      createdBy: manager._id,
    },
    {
      title: 'Build authentication screens',
      description: 'Login, Register, and Forgot Password screens',
      status: 'Todo',
      priority: 'High',
      project: project2._id,
      assignedTo: user1._id,
      createdBy: manager._id,
    },
    {
      title: 'Integrate Stripe payments',
      description: 'Add Stripe payment gateway for checkout',
      status: 'Todo',
      priority: 'High',
      project: project3._id,
      assignedTo: user2._id,
      createdBy: manager._id,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST API endpoints with examples',
      status: 'In Progress',
      priority: 'Low',
      project: project3._id,
      assignedTo: user2._id,
      createdBy: manager._id,
    },
  ]);

  console.log('Tasks created');
  console.log('\n✅ Seeding complete!\n');
  console.log('Test Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:   admin@protrack.com   / Admin123');
  console.log('Manager: manager@protrack.com / Manager123');
  console.log('User:    user@protrack.com    / User1234');
  console.log('─────────────────────────────────────');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
