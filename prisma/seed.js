const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data first
    console.log('🧹 Clearing existing data...')
    await prisma.discussionReply.deleteMany()
    await prisma.discussionThread.deleteMany()
    await prisma.certificate.deleteMany()
    await prisma.grade.deleteMany()
    await prisma.submission.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.course.deleteMany()
    await prisma.userSkill.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    // Create admin user
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@skillportal.com',
        hashedPassword: adminPassword,
        role: 'admin',
        university: 'Tech University',
        degree: 'M.S. Computer Science',
        branch: 'Software Engineering'
      }
    })

    // Create instructor users
    console.log('👩‍🏫 Creating instructors...')
    const instructorPassword = await bcrypt.hash('instructor123', 10)
    const instructors = []
    
    const instructorData = [
      { name: 'Dr. Jane Smith', email: 'jane@skillportal.com', university: 'Tech University', degree: 'Ph.D. Computer Science', branch: 'AI/ML' },
      { name: 'Prof. John Doe', email: 'john@skillportal.com', university: 'Design Institute', degree: 'M.Des.', branch: 'UI/UX Design' }
    ]

    for (const instrData of instructorData) {
      const instructor = await prisma.user.create({
        data: {
          ...instrData,
          hashedPassword: instructorPassword,
          role: 'instructor'
        }
      })
      instructors.push(instructor)
    }

    // Create student users
    console.log('👨‍🎓 Creating students...')
    const studentPassword = await bcrypt.hash('student123', 10)
    const students = []
    
    const studentNames = [
      'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eva Davis'
    ]
    
    const universities = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU']
    const degrees = ['B.Tech', 'B.S.', 'B.E.']
    const branches = ['Computer Science', 'Information Technology', 'Software Engineering']

    for (let i = 0; i < studentNames.length; i++) {
      const student = await prisma.user.create({
        data: {
          name: studentNames[i],
          email: `student${i+1}@example.com`,
          hashedPassword: studentPassword,
          role: 'student',
          university: universities[i % universities.length],
          degree: degrees[i % degrees.length],
          branch: branches[i % branches.length]
        }
      })
      students.push(student)
    }

    // Create skills
    console.log('🛠️ Creating skills...')
    const skillsData = [
      { name: 'JavaScript', description: 'Modern JavaScript programming and ES6+ features', category: 'Programming' },
      { name: 'React', description: 'React library for building user interfaces', category: 'Frontend' },
      { name: 'Node.js', description: 'Server-side JavaScript runtime environment', category: 'Backend' },
      { name: 'Python', description: 'Versatile programming language for various applications', category: 'Programming' },
      { name: 'Data Analysis', description: 'Analyzing and interpreting complex data sets', category: 'Data Science' },
      { name: 'Machine Learning', description: 'AI and machine learning algorithms', category: 'Data Science' },
      { name: 'UI/UX Design', description: 'User interface and experience design principles', category: 'Design' },
      { name: 'Project Management', description: 'Managing projects effectively using modern methodologies', category: 'Management' },
      { name: 'Database Design', description: 'Designing efficient and scalable databases', category: 'Backend' },
      { name: 'Cloud Computing', description: 'Cloud platforms and distributed computing', category: 'Infrastructure' }
    ]

    const skills = []
    for (const skillData of skillsData) {
      const skill = await prisma.skill.create({
        data: skillData
      })
      skills.push(skill)
    }

    // Create courses
    console.log('📚 Creating courses...')
    const coursesData = [
      { title: 'JavaScript Fundamentals', description: 'Learn JavaScript from scratch with hands-on projects', skillName: 'JavaScript' },
      { title: 'Advanced React Development', description: 'Build complex web applications with React and Redux', skillName: 'React' },
      { title: 'Node.js Backend Development', description: 'Create scalable APIs and server applications', skillName: 'Node.js' },
      { title: 'Python for Beginners', description: 'Introduction to Python programming', skillName: 'Python' },
      { title: 'Data Analysis with Python', description: 'Analyze data using Pandas, NumPy, and Matplotlib', skillName: 'Data Analysis' },
      { title: 'Machine Learning Fundamentals', description: 'Introduction to ML algorithms and applications', skillName: 'Machine Learning' },
      { title: 'UI/UX Design Principles', description: 'Learn design thinking and user-centered design', skillName: 'UI/UX Design' },
      { title: 'Agile Project Management', description: 'Master agile methodologies and project delivery', skillName: 'Project Management' }
    ]

    const courses = []
    for (const courseData of coursesData) {
      const skill = skills.find(s => s.name === courseData.skillName)
      const instructor = instructors[Math.floor(Math.random() * instructors.length)]
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          skillId: skill?.id,
          createdById: instructor.id,
          publishedAt: new Date()
        }
      })
      courses.push(course)
    }

    // Create enrollments
    console.log('🎓 Creating enrollments...')
    for (const student of students) {
      const numCourses = Math.floor(Math.random() * 3) + 2 // 2-4 courses per student
      const selectedCourses = courses.sort(() => 0.5 - Math.random()).slice(0, numCourses)
      
      for (const course of selectedCourses) {
        const status = Math.random() > 0.7 ? 'completed' : 'enrolled'
        const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10
        
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            status: status,
            progress: progress,
            completedAt: status === 'completed' ? new Date() : null
          }
        })
      }
    }

    // Create user skills
    console.log('🏷️ Creating user skills...')
    for (const student of students) {
      const numSkills = Math.floor(Math.random() * 4) + 3 // 3-6 skills per student
      const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, numSkills)
      
      for (const skill of selectedSkills) {
        await prisma.userSkill.create({
          data: {
            userId: student.id,
            skillId: skill.id,
            level: Math.floor(Math.random() * 10) + 1 // 1-10 level
          }
        })
      }
    }

    // Create assignments
    console.log('📝 Creating assignments...')
    const assignments = []
    for (const course of courses) {
      const numAssignments = Math.floor(Math.random() * 2) + 1 // 1-2 assignments per course
      
      for (let i = 0; i < numAssignments; i++) {
        const daysFromNow = Math.floor(Math.random() * 14) - 7 // -7 to +7 days
        const dueDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
        
        const assignment = await prisma.assignment.create({
          data: {
            title: `${course.title} - Assignment ${i + 1}`,
            description: `Complete the practical exercises for ${course.title}. This assignment covers key concepts and requires hands-on implementation.`,
            dueDate: dueDate,
            maxPoints: 100,
            courseId: course.id,
            createdById: course.createdById
          }
        })
        assignments.push(assignment)
      }
    }

    // Create submissions and grades
    console.log('✉️ Creating submissions and grades...')
    for (const assignment of assignments) {
      // Find students enrolled in this course
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: assignment.courseId },
        include: { user: true }
      })
      
      for (const enrollment of enrollments) {
        // 60% chance student submits assignment
        if (Math.random() > 0.4) {
          const submissionDate = new Date(assignment.dueDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000)
          
          const submission = await prisma.submission.create({
            data: {
              assignmentId: assignment.id,
              userId: enrollment.userId,
              submittedAt: submissionDate,
              content: `Assignment submission by ${enrollment.user.name}. This includes all required components and demonstrates understanding of the key concepts.`,
              fileUrl: Math.random() > 0.5 ? `https://files.skillportal.com/${enrollment.userId}/${assignment.id}.pdf` : null
            }
          })

          // 70% chance submission gets graded
          if (Math.random() > 0.3) {
            const points = Math.floor(Math.random() * 40) + 60 // 60-100 points
            const feedbacks = [
              'Excellent work! Shows deep understanding.',
              'Good effort! Well structured solution.',
              'Satisfactory work. Consider more detail.',
              'Good submission. Minor improvements needed.',
              'Outstanding work! Exceeds expectations.',
              'Well done! Creative approach used.'
            ]
            
            await prisma.grade.create({
              data: {
                assignmentId: assignment.id,
                userId: enrollment.userId,
                gradedById: assignment.createdById,
                points: points,
                feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
              }
            })
          }
        }
      }
    }

    // Create certificates for completed enrollments
    console.log('🏅 Creating certificates...')
    const completedEnrollments = await prisma.enrollment.findMany({
      where: { status: 'completed' },
      include: { course: true }
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

    // Create discussion threads and replies
    console.log('💬 Creating discussion threads and replies...')
    const discussionTopics = [
      'Welcome to the course!',
      'Questions about assignments',
      'Best practices and tips',
      'Troubleshooting help',
      'Project showcase'
    ]

    for (const course of courses.slice(0, 5)) {
      const topic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)]
      
      const thread = await prisma.discussionThread.create({
        data: {
          title: `${topic} - ${course.title}`,
          content: `This is a discussion thread for ${course.title}. Feel free to ask questions and share insights!`,
          courseId: course.id,
          authorId: course.createdById
        }
      })

      // Create 2-5 replies per thread
      const numReplies = Math.floor(Math.random() * 4) + 2
      for (let j = 0; j < numReplies; j++) {
        const author = Math.random() > 0.5 
          ? students[Math.floor(Math.random() * students.length)]
          : (Math.random() > 0.5 ? admin : instructors[Math.floor(Math.random() * instructors.length)])
        
        const replyContents = [
          'Great question! I had the same doubt.',
          'Thanks for sharing, very helpful!',
          'I found a different approach too.',
          'Can someone help with this concept?',
          'Here\'s a useful tip for this topic.',
          'This explanation really helped me.'
        ]
        
        await prisma.discussionReply.create({
          data: {
            threadId: thread.id,
            authorId: author.id,
            content: replyContents[Math.floor(Math.random() * replyContents.length)]
          }
        })
      }
    }

    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log('👤 Admin: admin@skillportal.com / admin123')
    console.log('👩‍🏫 Instructors:')
    instructors.forEach(instructor => {
      console.log(`   ${instructor.email} / instructor123`)
    })
    console.log('👨‍🎓 Students: student1@example.com to student5@example.com / student123')
    console.log('')
    console.log('📊 Data Created:')
    console.log(`- ${1 + instructors.length + students.length} users`)
    console.log(`- ${skills.length} skills`)
    console.log(`- ${courses.length} courses`)
    console.log(`- ${assignments.length} assignments`)
    console.log(`- ${completedEnrollments.length} certificates`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('👋 Disconnected from database')
  })
