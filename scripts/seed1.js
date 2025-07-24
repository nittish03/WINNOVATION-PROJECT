const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data in correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    
    await prisma.discussionReply.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.nonVerifiedUser.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Existing data cleared');

    // Create Skills
    console.log('📚 Creating skills...');
    const skills = await Promise.all([
      // Programming Skills
      prisma.skill.create({
        data: {
          name: 'JavaScript',
          description: 'Modern JavaScript programming language for web development',
          category: 'Programming'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'React.js',
          description: 'Popular JavaScript library for building user interfaces',
          category: 'Programming'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Node.js',
          description: 'Server-side JavaScript runtime environment',
          category: 'Programming'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Python',
          description: 'Versatile programming language for various applications',
          category: 'Programming'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'TypeScript',
          description: 'Typed superset of JavaScript',
          category: 'Programming'
        }
      }),
      
      // Design Skills
      prisma.skill.create({
        data: {
          name: 'UI/UX Design',
          description: 'User Interface and User Experience Design principles',
          category: 'Design'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Figma',
          description: 'Collaborative design and prototyping tool',
          category: 'Design'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Adobe Photoshop',
          description: 'Professional image editing and graphic design software',
          category: 'Design'
        }
      }),

      // Data Science Skills
      prisma.skill.create({
        data: {
          name: 'Data Analysis',
          description: 'Analyzing and interpreting complex data sets',
          category: 'Data Science'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Machine Learning',
          description: 'AI algorithms and predictive modeling techniques',
          category: 'Data Science'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'SQL',
          description: 'Database querying and management language',
          category: 'Data Science'
        }
      }),

      // Business Skills
      prisma.skill.create({
        data: {
          name: 'Project Management',
          description: 'Planning, executing, and delivering projects successfully',
          category: 'Business'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Digital Marketing',
          description: 'Online marketing strategies and tactics',
          category: 'Marketing'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Public Speaking',
          description: 'Effective presentation and communication skills',
          category: 'Communication'
        }
      })
    ]);

    console.log(`✅ Created ${skills.length} skills`);

    // Create Users (Students, Instructors, Admin)
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Students
    const students = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Smith',
          email: 'john.smith@university.edu',
          hashedPassword,
          university: 'Stanford University',
          degree: 'Bachelor of Science',
          branch: 'Computer Science',
          role: 'student',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          hashedPassword,
          university: 'MIT',
          degree: 'Bachelor of Design',
          branch: 'Graphic Design',
          role: 'student',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Mike Davis',
          email: 'mike.davis@university.edu',
          hashedPassword,
          university: 'Carnegie Mellon University',
          degree: 'Master of Science',
          branch: 'Data Science',
          role: 'student',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Emma Wilson',
          email: 'emma.wilson@university.edu',
          hashedPassword,
          university: 'Harvard University',
          degree: 'Bachelor of Arts',
          branch: 'Business Administration',
          role: 'student',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Alex Chen',
          email: 'alex.chen@university.edu',
          hashedPassword,
          university: 'UC Berkeley',
          degree: 'Bachelor of Science',
          branch: 'Software Engineering',
          role: 'student',
          image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150'
        }
      })
    ]);

    // Create Instructors
    const instructors = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@skillportal.edu',
          hashedPassword,
          role: 'instructor',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Prof. David Kim',
          email: 'david.kim@skillportal.edu',
          hashedPassword,
          role: 'instructor',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Dr. Lisa Wang',
          email: 'lisa.wang@skillportal.edu',
          hashedPassword,
          role: 'instructor',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        }
      })
    ]);

    // Create Admin
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@skillportal.com',
        hashedPassword,
        role: 'admin',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      }
    });

    console.log(`✅ Created ${students.length + instructors.length + 1} users`);

    // Create User Skills (associating students with skills)
    console.log('🎯 Creating user skills...');
    await Promise.all([
      // John Smith - JavaScript, React.js, Node.js
      prisma.userSkill.create({
        data: {
          userId: students[0].id,
          skillId: skills[0].id, // JavaScript
          level: 3 // Intermediate
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[0].id,
          skillId: skills[1].id, // React.js
          level: 2 // Beginner
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[0].id,
          skillId: skills[2].id, // Node.js
          level: 2 // Beginner
        }
      }),

      // Sarah Johnson - UI/UX Design, Figma, Photoshop
      prisma.userSkill.create({
        data: {
          userId: students[1].id,
          skillId: skills[5].id, // UI/UX Design
          level: 4 // Advanced
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[1].id,
          skillId: skills[6].id, // Figma
          level: 3 // Intermediate
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[1].id,
          skillId: skills[7].id, // Photoshop
          level: 2 // Beginner
        }
      }),

      // Mike Davis - Python, Data Analysis, Machine Learning, SQL
      prisma.userSkill.create({
        data: {
          userId: students[2].id,
          skillId: skills[3].id, // Python
          level: 4 // Advanced
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[2].id,
          skillId: skills[8].id, // Data Analysis
          level: 3 // Intermediate
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[2].id,
          skillId: skills[9].id, // Machine Learning
          level: 2 // Beginner
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[2].id,
          skillId: skills[10].id, // SQL
          level: 3 // Intermediate
        }
      }),

      // Emma Wilson - Project Management, Digital Marketing, Public Speaking
      prisma.userSkill.create({
        data: {
          userId: students[3].id,
          skillId: skills[11].id, // Project Management
          level: 3 // Intermediate
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[3].id,
          skillId: skills[12].id, // Digital Marketing
          level: 2 // Beginner
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[3].id,
          skillId: skills[13].id, // Public Speaking
          level: 4 // Advanced
        }
      }),

      // Alex Chen - JavaScript, TypeScript, React.js
      prisma.userSkill.create({
        data: {
          userId: students[4].id,
          skillId: skills[0].id, // JavaScript
          level: 4 // Advanced
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[4].id,
          skillId: skills[4].id, // TypeScript
          level: 3 // Intermediate
        }
      }),
      prisma.userSkill.create({
        data: {
          userId: students[4].id,
          skillId: skills[1].id, // React.js
          level: 3 // Intermediate
        }
      })
    ]);

    console.log('✅ Created user skills associations');

    // Create Courses
    console.log('📖 Creating courses...');
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: 'Complete JavaScript Mastery',
          description: 'Learn JavaScript from basics to advanced concepts including ES6+, async programming, and DOM manipulation. This comprehensive course covers everything you need to become proficient in JavaScript.',
          skillId: skills[0].id, // JavaScript
          createdById: instructors[0].id, // Dr. Emily Rodriguez
          publishedAt: new Date()
        }
      }),
      prisma.course.create({
        data: {
          title: 'React.js for Modern Web Development',
          description: 'Build modern, responsive web applications with React.js. Learn components, hooks, state management, and routing in this hands-on course.',
          skillId: skills[1].id, // React.js
          createdById: instructors[0].id, // Dr. Emily Rodriguez
          publishedAt: new Date()
        }
      }),
      prisma.course.create({
        data: {
          title: 'UI/UX Design Fundamentals',
          description: 'Master the principles of user interface and user experience design. Learn to create beautiful, functional, and user-friendly designs.',
          skillId: skills[5].id, // UI/UX Design
          createdById: instructors[1].id, // Prof. David Kim
          publishedAt: new Date()
        }
      }),
      prisma.course.create({
        data: {
          title: 'Python for Data Science',
          description: 'Learn Python programming specifically for data science applications. Cover pandas, numpy, matplotlib, and basic machine learning concepts.',
          skillId: skills[3].id, // Python
          createdById: instructors[2].id, // Dr. Lisa Wang
          publishedAt: new Date()
        }
      }),
      prisma.course.create({
        data: {
          title: 'Machine Learning Essentials',
          description: 'Dive into the world of machine learning. Learn supervised and unsupervised learning algorithms, model evaluation, and practical applications.',
          skillId: skills[9].id, // Machine Learning
          createdById: instructors[2].id, // Dr. Lisa Wang
          publishedAt: new Date()
        }
      }),
      prisma.course.create({
        data: {
          title: 'Digital Marketing Strategy',
          description: 'Learn modern digital marketing strategies including SEO, social media marketing, content marketing, and analytics.',
          skillId: skills[12].id, // Digital Marketing
          createdById: instructors[1].id, // Prof. David Kim
          publishedAt: new Date()
        }
      })
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    // Create Enrollments
    console.log('📝 Creating enrollments...');
    const enrollments = await Promise.all([
      // John Smith enrollments
      prisma.enrollment.create({
        data: {
          userId: students[0].id,
          courseId: courses[0].id, // JavaScript course
          status: 'enrolled',
          progress: 75
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[0].id,
          courseId: courses[1].id, // React.js course
          status: 'enrolled',
          progress: 30
        }
      }),

      // Sarah Johnson enrollments
      prisma.enrollment.create({
        data: {
          userId: students[1].id,
          courseId: courses[2].id, // UI/UX Design course
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        }
      }),

      // Mike Davis enrollments
      prisma.enrollment.create({
        data: {
          userId: students[2].id,
          courseId: courses[3].id, // Python course
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[2].id,
          courseId: courses[4].id, // Machine Learning course
          status: 'enrolled',
          progress: 60
        }
      }),

      // Emma Wilson enrollments
      prisma.enrollment.create({
        data: {
          userId: students[3].id,
          courseId: courses[5].id, // Digital Marketing course
          status: 'enrolled',
          progress: 45
        }
      }),

      // Alex Chen enrollments
      prisma.enrollment.create({
        data: {
          userId: students[4].id,
          courseId: courses[0].id, // JavaScript course
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[4].id,
          courseId: courses[1].id, // React.js course
          status: 'enrolled',
          progress: 80
        }
      })
    ]);

    console.log(`✅ Created ${enrollments.length} enrollments`);

    // Create Assignments
    console.log('📋 Creating assignments...');
    const assignments = await Promise.all([
      prisma.assignment.create({
        data: {
          title: 'JavaScript Fundamentals Quiz',
          description: 'Test your understanding of JavaScript basics including variables, functions, and control structures.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxPoints: 100,
          courseId: courses[0].id, // JavaScript course
          createdById: instructors[0].id
        }
      }),
      prisma.assignment.create({
        data: {
          title: 'Build a Todo App with React',
          description: 'Create a fully functional todo application using React hooks and local storage.',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          maxPoints: 150,
          courseId: courses[1].id, // React.js course
          createdById: instructors[0].id
        }
      }),
      prisma.assignment.create({
        data: {
          title: 'Design System Creation',
          description: 'Create a comprehensive design system including color palette, typography, and component library.',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          maxPoints: 120,
          courseId: courses[2].id, // UI/UX Design course
          createdById: instructors[1].id
        }
      }),
      prisma.assignment.create({
        data: {
          title: 'Data Analysis Project',
          description: 'Analyze a provided dataset using Python and pandas. Create visualizations and provide insights.',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
          maxPoints: 130,
          courseId: courses[3].id, // Python course
          createdById: instructors[2].id
        }
      })
    ]);

    console.log(`✅ Created ${assignments.length} assignments`);

    // Create Submissions
    console.log('📤 Creating submissions...');
    await Promise.all([
      prisma.submission.create({
        data: {
          content: 'Completed the JavaScript fundamentals quiz. Covered all topics including ES6 features, async/await, and DOM manipulation.',
          assignmentId: assignments[0].id,
          userId: students[0].id
        }
      }),
      prisma.submission.create({
        data: {
          content: 'Built a comprehensive todo app with React. Features include add/delete/edit tasks, filtering, and local storage persistence.',
          fileUrl: 'https://github.com/student/react-todo-app',
          assignmentId: assignments[1].id,
          userId: students[4].id
        }
      }),
      prisma.submission.create({
        data: {
          content: 'Created a complete design system with 8 color variations, 4 typography scales, and 15 reusable components.',
          fileUrl: 'https://figma.com/design-system-project',
          assignmentId: assignments[2].id,
          userId: students[1].id
        }
      })
    ]);

    console.log('✅ Created submissions');

    // Create Grades
    console.log('📊 Creating grades...');
    await Promise.all([
      prisma.grade.create({
        data: {
          points: 85,
          feedback: 'Great understanding of JavaScript fundamentals. Minor issues with async concepts.',
          assignmentId: assignments[0].id,
          userId: students[0].id,
          gradedById: instructors[0].id
        }
      }),
      prisma.grade.create({
        data: {
          points: 140,
          feedback: 'Excellent React implementation! Clean code structure and great use of hooks.',
          assignmentId: assignments[1].id,
          userId: students[4].id,
          gradedById: instructors[0].id
        }
      }),
      prisma.grade.create({
        data: {
          points: 115,
          feedback: 'Comprehensive design system with excellent attention to detail. Great color choices!',
          assignmentId: assignments[2].id,
          userId: students[1].id,
          gradedById: instructors[1].id
        }
      })
    ]);

    console.log('✅ Created grades');

    // Create Certificates
    console.log('🏆 Creating certificates...');
    await Promise.all([
      prisma.certificate.create({
        data: {
          userId: students[4].id, // Alex Chen
          courseId: courses[0].id, // JavaScript course
          title: 'JavaScript Mastery Certificate',
          url: 'https://skillportal.com/certificates/js-mastery-alex-chen'
        }
      }),
      prisma.certificate.create({
        data: {
          userId: students[1].id, // Sarah Johnson
          courseId: courses[2].id, // UI/UX Design course
          title: 'UI/UX Design Fundamentals Certificate',
          url: 'https://skillportal.com/certificates/uiux-fundamentals-sarah-johnson'
        }
      }),
      prisma.certificate.create({
        data: {
          userId: students[2].id, // Mike Davis
          courseId: courses[3].id, // Python course
          title: 'Python for Data Science Certificate',
          url: 'https://skillportal.com/certificates/python-datascience-mike-davis'
        }
      })
    ]);

    console.log('✅ Created certificates');

    // Create Discussion Threads
    console.log('💬 Creating discussion threads...');
    const threads = await Promise.all([
      prisma.discussionThread.create({
        data: {
          title: 'Best practices for async/await in JavaScript',
          content: 'What are the best practices when working with async/await? I sometimes get confused about error handling.',
          courseId: courses[0].id, // JavaScript course
          authorId: students[0].id // John Smith
        }
      }),
      prisma.discussionThread.create({
        data: {
          title: 'React state management: Context vs Redux',
          content: 'When should I use Context API vs Redux for state management in React applications?',
          courseId: courses[1].id, // React.js course
          authorId: students[4].id // Alex Chen
        }
      }),
      prisma.discussionThread.create({
        data: {
          title: 'Color theory in UI design',
          content: 'Can someone explain the 60-30-10 rule in color theory and how to apply it in UI design?',
          courseId: courses[2].id, // UI/UX Design course
          authorId: students[1].id // Sarah Johnson
        }
      })
    ]);

    console.log(`✅ Created ${threads.length} discussion threads`);

    // Create Discussion Replies
    console.log('💭 Creating discussion replies...');
    await Promise.all([
      prisma.discussionReply.create({
        data: {
          content: 'Great question! Always wrap your async/await calls in try-catch blocks for proper error handling. Also, remember that await only works inside async functions.',
          threadId: threads[0].id,
          authorId: instructors[0].id // Dr. Emily Rodriguez
        }
      }),
      prisma.discussionReply.create({
        data: {
          content: 'For small to medium apps, Context API is usually sufficient. Redux is better for large applications with complex state logic and when you need time-travel debugging.',
          threadId: threads[1].id,
          authorId: instructors[0].id // Dr. Emily Rodriguez
        }
      }),
      prisma.discussionReply.create({
        data: {
          content: 'The 60-30-10 rule means 60% dominant color (usually neutral), 30% secondary color, and 10% accent color. It creates visual hierarchy and balance in your designs.',
          threadId: threads[2].id,
          authorId: instructors[1].id // Prof. David Kim
        }
      }),
      prisma.discussionReply.create({
        data: {
          content: 'Thanks for the explanation! That makes much more sense now. I\'ll try applying this to my current project.',
          threadId: threads[2].id,
          authorId: students[1].id // Sarah Johnson
        }
      })
    ]);

    console.log('✅ Created discussion replies');

    // Create some Non-Verified Users (for testing registration flow)
    console.log('👤 Creating non-verified users...');
    await Promise.all([
      prisma.nonVerifiedUser.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          hashedPassword: await bcrypt.hash('testpassword', 12),
          otp: 123456,
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        }
      })
    ]);

    console.log('✅ Created non-verified users');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${students.length + instructors.length + 1} (${students.length} students, ${instructors.length} instructors, 1 admin)`);
    console.log(`📚 Skills: ${skills.length}`);
    console.log(`📖 Courses: ${courses.length}`);
    console.log(`📝 Enrollments: ${enrollments.length}`);
    console.log(`📋 Assignments: ${assignments.length}`);
    console.log(`🏆 Certificates: 3`);
    console.log(`💬 Discussion Threads: ${threads.length}`);
    console.log(`💭 Discussion Replies: 4`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('Students:');
    console.log('  - john.smith@university.edu : password123');
    console.log('  - sarah.johnson@university.edu : password123');
    console.log('  - mike.davis@university.edu : password123');
    console.log('  - emma.wilson@university.edu : password123');
    console.log('  - alex.chen@university.edu : password123');
    console.log('\nInstructors:');
    console.log('  - emily.rodriguez@skillportal.edu : password123');
    console.log('  - david.kim@skillportal.edu : password123');
    console.log('  - lisa.wang@skillportal.edu : password123');
    console.log('\nAdmin:');
    console.log('  - admin@skillportal.com : password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n👋 Disconnected from database');
  });
