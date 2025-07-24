const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillportal.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@skillportal.com',
      hashedPassword: adminPassword,
      role: 'admin',
      university: 'Tech University',
      degree: 'Computer Science',
      branch: 'Software Engineering'
    }
  })

  // Create demo students
  const studentPassword = await bcrypt.hash('student123', 10)
  const students = []
  
  const studentNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eva Davis']
  
  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i+1}@example.com` },
      update: {},
      create: {
        name: studentNames[i],
        email: `student${i+1}@example.com`,
        hashedPassword: studentPassword,
        role: 'student',
        university: `University ${i+1}`,
        degree: 'Bachelor of Technology',
        branch: i % 2 === 0 ? 'Computer Science' : 'Information Technology'
      }
    })
    students.push(student)
  }

  // Create skills
  const skillsData = [
    { name: 'JavaScript', description: 'Modern JavaScript programming', category: 'Programming' },
    { name: 'React', description: 'React library for UI development', category: 'Frontend' },
    { name: 'Node.js', description: 'Server-side JavaScript runtime', category: 'Backend' },
    { name: 'Python', description: 'Versatile programming language', category: 'Programming' },
    { name: 'Data Analysis', description: 'Analyzing and interpreting data', category: 'Data Science' },
    { name: 'Machine Learning', description: 'AI and ML algorithms', category: 'Data Science' },
    { name: 'UI/UX Design', description: 'User interface design', category: 'Design' },
    { name: 'Project Management', description: 'Managing projects effectively', category: 'Management' },
    { name: 'Database Design', description: 'Database architecture', category: 'Backend' },
    { name: 'Cloud Computing', description: 'Cloud platforms and services', category: 'Infrastructure' }
  ]

  const skills = []
  for (const skillData of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: skillData
    })
    skills.push(skill)
  }

  // Create courses
  const coursesData = [
    { title: 'JavaScript Fundamentals', description: 'Learn JavaScript basics', skillId: skills[0].id },
    { title: 'React Development', description: 'Build React applications', skillId: skills[1].id },
    { title: 'Node.js Backend', description: 'Server-side development', skillId: skills[2].id },
    { title: 'Python Programming', description: 'Python fundamentals', skillId: skills[3].id },
    { title: 'Data Analysis with Python', description: 'Analyze data using Python', skillId: skills[4].id },
    { title: 'Machine Learning Basics', description: 'Introduction to ML', skillId: skills[5].id },
    { title: 'UI/UX Design Principles', description: 'Design fundamentals', skillId: skills[6].id },
    { title: 'Project Management', description: 'PM methodologies', skillId: skills[7].id }
  ]

  const courses = []
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        createdById: admin.id,
        publishedAt: new Date()
      }
    })
    courses.push(course)
  }

  // Create enrollments
  for (const student of students) {
    const numCourses = Math.floor(Math.random() * 3) + 2
    const selectedCourses = courses.sort(() => 0.5 - Math.random()).slice(0, numCourses)
    
    for (const course of selectedCourses) {
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          status: Math.random() > 0.7 ? 'completed' : 'enrolled',
          progress: Math.floor(Math.random() * 100)
        }
      })
    }
  }

  // Create user skills
  for (const student of students) {
    const numSkills = Math.floor(Math.random() * 4) + 3
    const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, numSkills)
    
    for (const skill of selectedSkills) {
      await prisma.userSkill.create({
        data: {
          userId: student.id,
          skillId: skill.id,
          level: Math.floor(Math.random() * 10) + 1
        }
      })
    }
  }

  // Create assignments
  for (const course of courses.slice(0, 4)) {
    await prisma.assignment.create({
      data: {
        title: `${course.title} - Assignment 1`,
        description: `Complete the practical exercises for ${course.title}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxPoints: 100,
        courseId: course.id,
        createdById: admin.id
      }
    })
  }

  // Create certificates
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { status: 'completed' },
    include: { course: true, user: true }
  })

  for (const enrollment of completedEnrollments) {
    await prisma.certificate.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        title: `Certificate of Completion - ${enrollment.course.title}`,
        url: `https://certificates.skillportal.com/${enrollment.userId}/${enrollment.courseId}`
      }
    })
  }

  // Create discussion threads
  for (const course of courses.slice(0, 3)) {
    await prisma.discussionThread.create({
      data: {
        title: `Welcome to ${course.title}`,
        content: `This is the main discussion thread for ${course.title}. Feel free to ask questions!`,
        courseId: course.id,
        authorId: admin.id
      }
    })
  }

  console.log('✅ Database seeding completed!')
  console.log('👤 Admin: admin@skillportal.com / admin123')
  console.log('👥 Students: student1@example.com / student123 (student1-5)')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
