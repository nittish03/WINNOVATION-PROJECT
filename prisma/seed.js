const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting comprehensive database seeding for SkillPortal...')

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
        university: 'SkillPortal University',
        degree: 'Master of Computer Science',
        branch: 'System Administration',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    })

    // Create instructor users
    console.log('👩‍🏫 Creating instructors...')
    const instructorPassword = await bcrypt.hash('instructor123', 10)
    const instructors = []
    
    const instructorData = [
      { 
        name: 'Dr. Sarah Johnson', 
        email: 'sarah@skillportal.com', 
        university: 'MIT', 
        degree: 'Ph.D. Computer Science', 
        branch: 'Artificial Intelligence',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b36cdbeb?w=150&h=150&fit=crop&crop=face'
      },
      { 
        name: 'Prof. Michael Chen', 
        email: 'michael@skillportal.com', 
        university: 'Stanford University', 
        degree: 'Ph.D. Data Science', 
        branch: 'Machine Learning',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      { 
        name: 'Dr. Emily Rodriguez', 
        email: 'emily@skillportal.com', 
        university: 'Harvard University', 
        degree: 'Ph.D. Software Engineering', 
        branch: 'Web Development',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      { 
        name: 'Prof. David Kim', 
        email: 'david@skillportal.com', 
        university: 'Carnegie Mellon', 
        degree: 'Ph.D. Cybersecurity', 
        branch: 'Information Security',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      { 
        name: 'Dr. Lisa Wang', 
        email: 'lisa@skillportal.com', 
        university: 'Berkeley', 
        degree: 'Ph.D. Human-Computer Interaction', 
        branch: 'UI/UX Design',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      }
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
    
    const studentData = [
      { name: 'Alice Johnson', email: 'student1@example.com', university: 'MIT', degree: 'B.Tech', branch: 'Computer Science', image: 'https://images.unsplash.com/photo-1494790108755-2616b36cdbeb?w=150&h=150&fit=crop&crop=face' },
      { name: 'Bob Smith', email: 'student2@example.com', university: 'Stanford', degree: 'B.S.', branch: 'Information Technology', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      { name: 'Carol Williams', email: 'student3@example.com', university: 'Harvard', degree: 'B.E.', branch: 'Software Engineering', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { name: 'David Brown', email: 'student4@example.com', university: 'Berkeley', degree: 'B.Tech', branch: 'Data Science', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
      { name: 'Eva Davis', email: 'student5@example.com', university: 'CMU', degree: 'B.S.', branch: 'Computer Science', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
      { name: 'Frank Miller', email: 'student6@example.com', university: 'MIT', degree: 'B.Tech', branch: 'Cybersecurity', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
      { name: 'Grace Lee', email: 'student7@example.com', university: 'Stanford', degree: 'B.E.', branch: 'AI/ML', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
      { name: 'Henry Taylor', email: 'student8@example.com', university: 'Harvard', degree: 'B.S.', branch: 'Web Development', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
      { name: 'Ivy Chen', email: 'student9@example.com', university: 'Berkeley', degree: 'B.Tech', branch: 'Mobile Development', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face' },
      { name: 'Jack Wilson', email: 'student10@example.com', university: 'CMU', degree: 'B.E.', branch: 'DevOps', image: 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=150&h=150&fit=crop&crop=face' },
      { name: 'Kate Anderson', email: 'student11@example.com', university: 'MIT', degree: 'B.S.', branch: 'Data Science', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
      { name: 'Liam Rodriguez', email: 'student12@example.com', university: 'Stanford', degree: 'B.Tech', branch: 'Computer Science', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face' }
    ]

    for (const studentInfo of studentData) {
      const student = await prisma.user.create({
        data: {
          ...studentInfo,
          hashedPassword: studentPassword,
          role: 'student'
        }
      })
      students.push(student)
    }

    // Create comprehensive skills
    console.log('🛠️ Creating comprehensive skills...')
    const skillsData = [
      // Programming Languages
      { name: 'JavaScript', description: 'Modern JavaScript programming and ES6+ features for web development', category: 'Programming' },
      { name: 'Python', description: 'Versatile programming language for web development, data science, and AI', category: 'Programming' },
      { name: 'Java', description: 'Object-oriented programming language for enterprise applications', category: 'Programming' },
      { name: 'C++', description: 'High-performance system programming language', category: 'Programming' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript for large-scale applications', category: 'Programming' },
      { name: 'Go', description: 'Fast and efficient programming language by Google', category: 'Programming' },
      { name: 'Rust', description: 'Systems programming language focused on safety and performance', category: 'Programming' },
      { name: 'Swift', description: 'Programming language for iOS and macOS development', category: 'Programming' },
      { name: 'Kotlin', description: 'Modern programming language for Android development', category: 'Programming' },
      { name: 'C#', description: 'Microsoft programming language for .NET development', category: 'Programming' },

      // Frontend Development
      { name: 'React', description: 'Popular JavaScript library for building user interfaces', category: 'Frontend' },
      { name: 'Vue.js', description: 'Progressive JavaScript framework for building UIs', category: 'Frontend' },
      { name: 'Angular', description: 'TypeScript-based web application framework by Google', category: 'Frontend' },
      { name: 'HTML5', description: 'Modern markup language for structuring web content', category: 'Frontend' },
      { name: 'CSS3', description: 'Styling language for designing beautiful web pages', category: 'Frontend' },
      { name: 'Sass/SCSS', description: 'Advanced CSS preprocessor with variables and mixins', category: 'Frontend' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development', category: 'Frontend' },
      { name: 'Next.js', description: 'React framework for production-ready web applications', category: 'Frontend' },
      { name: 'Nuxt.js', description: 'Vue.js framework for server-side rendered applications', category: 'Frontend' },

      // Backend Development
      { name: 'Node.js', description: 'JavaScript runtime for server-side development', category: 'Backend' },
      { name: 'Express.js', description: 'Fast and minimalist web framework for Node.js', category: 'Backend' },
      { name: 'Django', description: 'High-level Python web framework for rapid development', category: 'Backend' },
      { name: 'Flask', description: 'Lightweight and flexible Python web framework', category: 'Backend' },
      { name: 'Spring Boot', description: 'Java framework for enterprise-level applications', category: 'Backend' },
      { name: 'Laravel', description: 'Elegant PHP web application framework', category: 'Backend' },
      { name: 'Ruby on Rails', description: 'Web application framework written in Ruby', category: 'Backend' },
      { name: 'ASP.NET Core', description: 'Cross-platform web framework by Microsoft', category: 'Backend' },

      // Database Technologies
      { name: 'MySQL', description: 'Popular relational database management system', category: 'Database' },
      { name: 'PostgreSQL', description: 'Advanced open-source relational database', category: 'Database' },
      { name: 'MongoDB', description: 'NoSQL document-oriented database', category: 'Database' },
      { name: 'Redis', description: 'In-memory data structure store and cache', category: 'Database' },
      { name: 'SQLite', description: 'Lightweight embedded SQL database', category: 'Database' },
      { name: 'Cassandra', description: 'Distributed NoSQL database for big data', category: 'Database' },
      { name: 'Prisma', description: 'Modern database toolkit and ORM', category: 'Database' },

      // Data Science & AI
      { name: 'Machine Learning', description: 'Algorithms and models that learn from data', category: 'Data Science' },
      { name: 'Deep Learning', description: 'Neural networks with multiple layers for complex tasks', category: 'Data Science' },
      { name: 'Data Analysis', description: 'Extracting insights and patterns from data', category: 'Data Science' },
      { name: 'TensorFlow', description: 'Open-source machine learning framework by Google', category: 'Data Science' },
      { name: 'PyTorch', description: 'Deep learning framework preferred by researchers', category: 'Data Science' },
      { name: 'Pandas', description: 'Data manipulation and analysis library for Python', category: 'Data Science' },
      { name: 'NumPy', description: 'Numerical computing library for Python', category: 'Data Science' },
      { name: 'Scikit-learn', description: 'Machine learning library for Python', category: 'Data Science' },
      { name: 'R Programming', description: 'Statistical computing and graphics language', category: 'Data Science' },

      // Cloud & DevOps
      { name: 'AWS', description: 'Amazon Web Services cloud computing platform', category: 'Cloud' },
      { name: 'Google Cloud', description: 'Google Cloud Platform services and infrastructure', category: 'Cloud' },
      { name: 'Microsoft Azure', description: 'Microsoft cloud computing platform', category: 'Cloud' },
      { name: 'Docker', description: 'Containerization platform for application deployment', category: 'DevOps' },
      { name: 'Kubernetes', description: 'Container orchestration system for scalable deployments', category: 'DevOps' },
      { name: 'Jenkins', description: 'Continuous integration and deployment automation', category: 'DevOps' },
      { name: 'Git', description: 'Distributed version control system', category: 'DevOps' },
      { name: 'Terraform', description: 'Infrastructure as code provisioning tool', category: 'DevOps' },
      { name: 'GitHub Actions', description: 'CI/CD platform integrated with GitHub', category: 'DevOps' },

      // Mobile Development
      { name: 'React Native', description: 'Cross-platform mobile app development with React', category: 'Mobile' },
      { name: 'Flutter', description: 'Google UI toolkit for beautiful mobile apps', category: 'Mobile' },
      { name: 'iOS Development', description: 'Native iOS app development with Swift/Objective-C', category: 'Mobile' },
      { name: 'Android Development', description: 'Native Android app development with Java/Kotlin', category: 'Mobile' },
      { name: 'Xamarin', description: 'Cross-platform mobile development with .NET', category: 'Mobile' },

      // Design & UX
      { name: 'UI/UX Design', description: 'User interface and experience design principles', category: 'Design' },
      { name: 'Figma', description: 'Collaborative design tool for UI/UX designers', category: 'Design' },
      { name: 'Adobe Creative Suite', description: 'Professional design software suite', category: 'Design' },
      { name: 'Sketch', description: 'Digital design toolkit for Mac', category: 'Design' },
      { name: 'Prototyping', description: 'Creating interactive mockups and wireframes', category: 'Design' },
      { name: 'User Research', description: 'Methods for understanding user needs and behaviors', category: 'Design' },

      // Security
      { name: 'Cybersecurity', description: 'Information security and threat protection strategies', category: 'Security' },
      { name: 'Ethical Hacking', description: 'Authorized penetration testing and vulnerability assessment', category: 'Security' },
      { name: 'Network Security', description: 'Securing computer networks and communications', category: 'Security' },
      { name: 'Cryptography', description: 'Secure communication and data protection techniques', category: 'Security' },

      // Management & Soft Skills
      { name: 'Project Management', description: 'Planning and executing projects effectively using proven methodologies', category: 'Management' },
      { name: 'Agile/Scrum', description: 'Agile project management and development methodologies', category: 'Management' },
      { name: 'Leadership', description: 'Leading teams and driving organizational success', category: 'Management' },
      { name: 'Technical Writing', description: 'Clear documentation and technical communication', category: 'Communication' },
      { name: 'Public Speaking', description: 'Effective presentation and communication skills', category: 'Communication' },

      // Other Technologies
      { name: 'API Development', description: 'Building and designing RESTful and GraphQL APIs', category: 'Backend' },
      { name: 'GraphQL', description: 'Query language and runtime for APIs', category: 'Backend' },
      { name: 'Blockchain', description: 'Distributed ledger technology and smart contracts', category: 'Emerging Tech' },
      { name: 'IoT', description: 'Internet of Things development and integration', category: 'Emerging Tech' },
      { name: 'AR/VR', description: 'Augmented and Virtual Reality development', category: 'Emerging Tech' }
    ]

    const skills = []
    for (const skillData of skillsData) {
      const skill = await prisma.skill.create({
        data: skillData
      })
      skills.push(skill)
    }

    // Create comprehensive courses
    console.log('📚 Creating comprehensive courses...')
    const coursesData = [
      // Programming Courses
      { title: 'JavaScript Fundamentals', description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, DOM manipulation, and modern development practices. Perfect for beginners starting their web development journey.', skillName: 'JavaScript', instructorIndex: 2 },
      { title: 'Python for Everyone', description: 'Comprehensive Python course covering syntax, data structures, OOP, file handling, and practical applications. Build real projects while learning one of the most popular programming languages.', skillName: 'Python', instructorIndex: 1 },
      { title: 'Java Programming Mastery', description: 'Complete Java development course from basics to enterprise applications. Learn OOP principles, data structures, algorithms, and build scalable applications.', skillName: 'Java', instructorIndex: 0 },
      { title: 'Modern TypeScript Development', description: 'Learn TypeScript for scalable and maintainable JavaScript applications. Covers types, interfaces, generics, and advanced patterns for large-scale development.', skillName: 'TypeScript', instructorIndex: 2 },
      { title: 'C++ Systems Programming', description: 'Master C++ for high-performance applications. Learn memory management, STL, multithreading, and system-level programming concepts.', skillName: 'C++', instructorIndex: 0 },

      // Frontend Courses
      { title: 'React.js Complete Guide', description: 'Build modern web applications with React. Covers hooks, context, state management, routing, testing, and deployment. Includes hands-on projects and best practices.', skillName: 'React', instructorIndex: 2 },
      { title: 'Vue.js from Scratch', description: 'Progressive JavaScript framework for building interactive web interfaces. Learn components, directives, Vuex, and Vue Router through practical projects.', skillName: 'Vue.js', instructorIndex: 2 },
      { title: 'Next.js Full-Stack Development', description: 'Build production-ready React applications with Next.js. Learn SSR, SSG, API routes, authentication, and deployment strategies.', skillName: 'Next.js', instructorIndex: 2 },
      { title: 'Advanced CSS & Responsive Design', description: 'Master CSS3, Flexbox, Grid, animations, and responsive design principles. Create beautiful, mobile-first websites that work on all devices.', skillName: 'CSS3', instructorIndex: 4 },
      { title: 'Angular Enterprise Development', description: 'Build scalable enterprise applications with Angular. Learn components, services, routing, forms, HTTP client, and testing strategies.', skillName: 'Angular', instructorIndex: 0 },

      // Backend Courses
      { title: 'Node.js Backend Development', description: 'Build scalable server-side applications with Node.js and Express. Learn REST APIs, database integration, authentication, and deployment.', skillName: 'Node.js', instructorIndex: 0 },
      { title: 'Django Web Framework', description: 'Full-stack web development with Python Django framework. Build secure, scalable web applications with user authentication and database integration.', skillName: 'Django', instructorIndex: 1 },
      { title: 'Spring Boot Microservices', description: 'Enterprise Java development with Spring Boot. Learn to build microservices, implement security, and deploy scalable applications.', skillName: 'Spring Boot', instructorIndex: 0 },
      { title: 'API Design & Development', description: 'Design and build robust RESTful APIs and GraphQL services. Learn API security, documentation, versioning, and best practices.', skillName: 'API Development', instructorIndex: 0 },

      // Data Science Courses
      { title: 'Machine Learning Fundamentals', description: 'Introduction to ML algorithms, supervised and unsupervised learning, model evaluation, and practical implementation using Python and scikit-learn.', skillName: 'Machine Learning', instructorIndex: 1 },
      { title: 'Deep Learning with TensorFlow', description: 'Neural networks and deep learning using TensorFlow framework. Build and train models for image recognition, NLP, and time series analysis.', skillName: 'TensorFlow', instructorIndex: 1 },
      { title: 'Data Analysis with Python', description: 'Data manipulation, visualization, and analysis using Pandas, NumPy, and Matplotlib. Learn to extract insights from real-world datasets.', skillName: 'Data Analysis', instructorIndex: 1 },
      { title: 'Data Science with R', description: 'Statistical computing and data analysis with R. Learn data visualization, statistical modeling, and machine learning techniques.', skillName: 'R Programming', instructorIndex: 1 },

      // Cloud & DevOps Courses
      { title: 'AWS Cloud Solutions Architect', description: 'Master Amazon Web Services for scalable cloud solutions. Learn EC2, S3, RDS, Lambda, and architectural best practices.', skillName: 'AWS', instructorIndex: 3 },
      { title: 'Docker & Containerization', description: 'Learn containerization with Docker and container orchestration with Kubernetes. Deploy scalable applications in the cloud.', skillName: 'Docker', instructorIndex: 3 },
      { title: 'DevOps Engineering Pipeline', description: 'CI/CD pipelines, automation, infrastructure as code, and monitoring. Learn Git, Jenkins, Terraform, and deployment strategies.', skillName: 'Jenkins', instructorIndex: 3 },
      { title: 'Kubernetes Container Orchestration', description: 'Master Kubernetes for production deployments. Learn pods, services, deployments, scaling, and cluster management.', skillName: 'Kubernetes', instructorIndex: 3 },

      // Mobile Courses
      { title: 'React Native Mobile Apps', description: 'Cross-platform mobile app development with React Native. Build iOS and Android apps with native performance and user experience.', skillName: 'React Native', instructorIndex: 2 },
      { title: 'Flutter Development Masterclass', description: 'Build beautiful mobile apps for iOS and Android with Flutter. Learn Dart, widgets, state management, and app deployment.', skillName: 'Flutter', instructorIndex: 0 },
      { title: 'iOS Development with Swift', description: 'Native iOS app development using Swift and Xcode. Learn UIKit, SwiftUI, Core Data, and App Store deployment.', skillName: 'iOS Development', instructorIndex: 0 },
      { title: 'Android Development with Kotlin', description: 'Modern Android app development with Kotlin. Learn Android SDK, Jetpack Compose, MVVM architecture, and Google Play Store publishing.', skillName: 'Android Development', instructorIndex: 0 },

      // Design Courses
      { title: 'UI/UX Design Principles', description: 'User-centered design, wireframing, prototyping, design systems, and usability testing. Create intuitive and beautiful user experiences.', skillName: 'UI/UX Design', instructorIndex: 4 },
      { title: 'Figma Design Mastery', description: 'Professional design workflows and collaboration with Figma. Learn prototyping, design systems, and team collaboration features.', skillName: 'Figma', instructorIndex: 4 },
      { title: 'User Research & Testing', description: 'Methods for understanding user needs, conducting usability tests, and iterating designs based on user feedback and data.', skillName: 'User Research', instructorIndex: 4 },

      // Security Courses
      { title: 'Cybersecurity Fundamentals', description: 'Information security principles, threat analysis, risk assessment, and protection strategies for modern digital environments.', skillName: 'Cybersecurity', instructorIndex: 3 },
      { title: 'Ethical Hacking & Penetration Testing', description: 'Learn authorized penetration testing, vulnerability assessment, and security auditing techniques to protect systems.', skillName: 'Ethical Hacking', instructorIndex: 3 },
      { title: 'Network Security Engineering', description: 'Secure network design, firewall configuration, intrusion detection, and network monitoring for enterprise environments.', skillName: 'Network Security', instructorIndex: 3 },

      // Management Courses
      { title: 'Agile Project Management', description: 'Scrum, Kanban, and agile methodologies for successful project delivery. Learn sprint planning, retrospectives, and team collaboration.', skillName: 'Agile/Scrum', instructorIndex: 4 },
      { title: 'Technical Leadership', description: 'Leading technical teams, making architectural decisions, mentoring developers, and driving technical excellence in organizations.', skillName: 'Leadership', instructorIndex: 4 },
      { title: 'Software Project Management', description: 'Managing software development projects from conception to delivery. Learn estimation, risk management, and stakeholder communication.', skillName: 'Project Management', instructorIndex: 4 }
    ]

    const courses = []
    for (const courseData of coursesData) {
      const skill = skills.find(s => s.name === courseData.skillName)
      const instructor = instructors[courseData.instructorIndex]
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

    // Create enrollments with varied progress and realistic timing
    console.log('🎓 Creating enrollments...')
    for (const student of students) {
      const numCourses = Math.floor(Math.random() * 6) + 3 // 3-8 courses per student
      const selectedCourses = courses.sort(() => 0.5 - Math.random()).slice(0, numCourses)
      
      for (const course of selectedCourses) {
        const enrollmentDate = new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000) // Random date within last 120 days
        const statusRand = Math.random()
        const status = statusRand > 0.8 ? 'completed' : statusRand > 0.05 ? 'enrolled' : 'dropped'
        const progress = status === 'completed' ? 100 : 
                        status === 'dropped' ? Math.floor(Math.random() * 40) :
                        Math.floor(Math.random() * 90) + 5
        
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            status: status,
            progress: progress,
            completedAt: status === 'completed' ? new Date(enrollmentDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000) : null,
            enrolledAt: enrollmentDate
          }
        })
      }
    }

    // Create comprehensive user skills with realistic levels
    console.log('🎯 Creating user skills...')
    for (const student of students) {
      const numSkills = Math.floor(Math.random() * 12) + 8 // 8-19 skills per student
      const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, numSkills)
      
      for (const skill of selectedSkills) {
        try {
          // Create more realistic skill level distribution
          const levelRand = Math.random()
          const level = levelRand > 0.9 ? Math.floor(Math.random() * 2) + 9 : // 10% expert (9-10)
                       levelRand > 0.6 ? Math.floor(Math.random() * 3) + 6 : // 30% advanced (6-8)
                       levelRand > 0.2 ? Math.floor(Math.random() * 3) + 3 : // 40% intermediate (3-5)
                       Math.floor(Math.random() * 2) + 1 // 20% beginner (1-2)

          await prisma.userSkill.create({
            data: {
              userId: student.id,
              skillId: skill.id,
              level: level,
              addedAt: new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000) // Random date within last 200 days
            }
          })
        } catch (error) {
          // Skip duplicates
          continue
        }
      }
    }

    // Create assignments with varied due dates and complexity
    console.log('📝 Creating assignments...')
    const assignments = []
    for (const course of courses) {
      const numAssignments = Math.floor(Math.random() * 5) + 2 // 2-6 assignments per course
      
      for (let i = 0; i < numAssignments; i++) {
        const daysFromNow = Math.floor(Math.random() * 90) - 45 // -45 to +45 days
        const dueDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
        
        const assignmentTitles = [
          'Fundamentals Quiz',
          'Practical Implementation Project',
          'Advanced Concepts Assignment',
          'Real-World Case Study',
          'Final Project Presentation',
          'Mid-Term Assessment'
        ]
        
        const assignmentDescriptions = [
          'Complete this comprehensive assessment covering the fundamental concepts we\'ve learned so far. This assignment will test your understanding of core principles and their practical applications.',
          'Implement a real-world project using the technologies and concepts covered in class. Your solution should demonstrate best practices and clean code principles.',
          'Explore advanced topics and provide detailed analysis with code examples. This assignment requires critical thinking and research beyond the basic course materials.',
          'Analyze a real-world case study and propose solutions using the methodologies learned in this course. Include detailed documentation and justification for your approach.',
          'Create and present a comprehensive final project that showcases all the skills and knowledge acquired throughout the course. Include live demonstration and code walkthrough.',
          'Mid-term comprehensive evaluation covering all topics discussed in the first half of the course. Prepare thoroughly as this counts significantly toward your final grade.'
        ]
        
        const maxPoints = [50, 100, 75, 150, 200, 100][i % 6]
        
        const assignment = await prisma.assignment.create({
          data: {
            title: `${course.title} - ${assignmentTitles[i % assignmentTitles.length]}`,
            description: assignmentDescriptions[i % assignmentDescriptions.length],
            dueDate: dueDate,
            maxPoints: maxPoints,
            courseId: course.id,
            createdById: course.createdById
          }
        })
        assignments.push(assignment)
      }
    }

    // Create submissions and grades with realistic content
    console.log('✉️ Creating submissions and grades...')
    for (const assignment of assignments) {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: assignment.courseId },
        include: { user: true }
      })
      
      for (const enrollment of enrollments) {
        // 80% chance student submits assignment (higher than before)
        if (Math.random() > 0.2) {
          const submissionDate = new Date(assignment.dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          
          const submissionContents = [
            `Comprehensive solution by ${enrollment.user.name}. This assignment addresses all requirements with detailed explanations and code examples. I've implemented the solution using best practices and included proper error handling throughout.`,
            `My approach to this assignment focuses on scalability and maintainability. I've researched additional resources beyond the course materials to provide a more robust solution. The implementation includes unit tests and documentation.`,
            `After thorough analysis of the requirements, I've developed a solution that not only meets the specified criteria but also incorporates modern development patterns. Each component is well-documented with clear explanations of design decisions.`,
            `This submission represents my understanding of the core concepts covered in the course. I've included practical examples and real-world applications to demonstrate the relevance of these technologies in professional development.`,
            `My solution takes a systematic approach to the problem, breaking it down into manageable components. I've ensured code quality through peer reviews and testing, and included performance optimizations where appropriate.`,
            `Building upon the foundational concepts from class, this assignment explores advanced implementations and edge cases. I've included alternative approaches and discussed the trade-offs between different solutions.`
          ]
          
          const submission = await prisma.submission.create({
            data: {
              assignmentId: assignment.id,
              userId: enrollment.userId,
              submittedAt: submissionDate,
              content: submissionContents[Math.floor(Math.random() * submissionContents.length)],
              fileUrl: Math.random() > 0.4 ? `https://files.skillportal.com/${enrollment.userId}/${assignment.id}.pdf` : null
            }
          })

          // 90% chance submission gets graded (higher than before)
          if (Math.random() > 0.1) {
            // More realistic grade distribution
            const gradeRand = Math.random()
            const baseScore = gradeRand > 0.85 ? Math.floor(Math.random() * 10) + 90 : // 15% excellent (90-100)
                             gradeRand > 0.6 ? Math.floor(Math.random() * 15) + 80 : // 25% good (80-94)
                             gradeRand > 0.3 ? Math.floor(Math.random() * 15) + 70 : // 30% satisfactory (70-84)
                             gradeRand > 0.1 ? Math.floor(Math.random() * 15) + 60 : // 20% needs improvement (60-74)
                             Math.floor(Math.random() * 20) + 40 // 10% poor (40-59)
            
            const points = Math.min(baseScore, assignment.maxPoints)
            
            const excellentFeedback = [
              'Outstanding work! This submission demonstrates exceptional understanding and goes above and beyond the requirements. Your code is clean, well-documented, and shows excellent problem-solving skills.',
              'Excellent submission! You\'ve shown mastery of the concepts with innovative solutions and thorough analysis. The implementation is professional-grade and well-tested.',
              'Exceptional work! Your approach is sophisticated and demonstrates deep understanding of the subject matter. The solution is elegant and efficiently implemented.'
            ]
            
            const goodFeedback = [
              'Very good work! You demonstrate solid understanding of the concepts with a well-structured solution. Minor improvements could be made in documentation and error handling.',
              'Good submission! Your solution meets all requirements and shows good grasp of the material. Consider exploring additional optimization techniques for even better performance.',
              'Well done! Your implementation is correct and efficient. Adding more comprehensive unit tests would strengthen your solution further.'
            ]
            
            const satisfactoryFeedback = [
              'Good effort! Your solution addresses the main requirements. Consider reviewing the advanced concepts covered in class to enhance your implementation.',
              'Satisfactory work. The core functionality is implemented correctly. Focus on code organization and adding more detailed comments for clarity.',
              'Decent submission. The solution works as expected. Try to incorporate more of the best practices discussed in our recent lectures.'
            ]
            
            const needsImprovementFeedback = [
              'Your solution shows understanding of basic concepts but needs refinement. Please review the lecture materials and consider attending office hours for additional support.',
              'The implementation has the right idea but needs improvement in execution. Focus on code quality and proper error handling in future assignments.',
              'You\'re on the right track, but the solution needs more development. I recommend reviewing the examples from class and practicing similar problems.'
            ]
            
            const poorFeedback = [
              'This submission needs significant improvement. Please schedule a meeting with me to discuss the concepts and get additional help with future assignments.',
              'The solution shows some effort but doesn\'t meet the requirements. Please review the assignment instructions carefully and seek help during office hours.',
              'This work indicates you may be struggling with the core concepts. I strongly encourage you to attend study sessions and reach out for additional support.'
            ]
            
            let feedback
            if (points >= 90) feedback = excellentFeedback[Math.floor(Math.random() * excellentFeedback.length)]
            else if (points >= 80) feedback = goodFeedback[Math.floor(Math.random() * goodFeedback.length)]
            else if (points >= 70) feedback = satisfactoryFeedback[Math.floor(Math.random() * satisfactoryFeedback.length)]
            else if (points >= 60) feedback = needsImprovementFeedback[Math.floor(Math.random() * needsImprovementFeedback.length)]
            else feedback = poorFeedback[Math.floor(Math.random() * poorFeedback.length)]
            
            await prisma.grade.create({
              data: {
                assignmentId: assignment.id,
                userId: enrollment.userId,
                gradedById: assignment.createdById,
                points: points,
                feedback: feedback
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

    // Create comprehensive discussion threads and replies
    console.log('💬 Creating comprehensive discussions...')
    const discussionTopics = [
      'Welcome & Course Introduction',
      'Assignment Questions & Clarifications',
      'Best Practices & Industry Standards',
      'Troubleshooting Common Issues',
      'Project Showcase & Peer Reviews',
      'Additional Resources & References',
      'Career Guidance & Job Market Insights',
      'Advanced Topics & Future Learning',
      'Study Group Organization',
      'Technical Challenges & Solutions',
      'Real-World Applications',
      'Tool Recommendations & Setup'
    ]

    for (const course of courses) {
      const numThreads = Math.floor(Math.random() * 5) + 3 // 3-7 threads per course
      
      for (let i = 0; i < numThreads; i++) {
        const topic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)]
        
        const threadContents = [
          `Welcome to the ${course.title} discussion forum! This space is designed for collaborative learning and knowledge sharing. Feel free to ask questions, share insights, and help your fellow students succeed.`,
          `This thread is dedicated to ${topic.toLowerCase()} for our ${course.title} course. Students and instructors are encouraged to participate actively, share experiences, and provide constructive feedback.`,
          `Let's use this discussion to explore ${topic.toLowerCase()} in the context of ${course.title}. Share your thoughts, ask questions, and learn from each other's perspectives and experiences.`,
          `This is our main discussion thread for ${topic.toLowerCase()}. Please keep discussions relevant to the course material and maintain a respectful, collaborative learning environment.`
        ]
        
        const thread = await prisma.discussionThread.create({
          data: {
            title: `${topic} - ${course.title}`,
            content: threadContents[Math.floor(Math.random() * threadContents.length)],
            courseId: course.id,
            authorId: course.createdById
          }
        })

        // Create varied number of replies (5-15 per thread)
        const numReplies = Math.floor(Math.random() * 11) + 5
        for (let j = 0; j < numReplies; j++) {
          const isStudentReply = Math.random() > 0.15 // 85% student replies, 15% instructor/admin
          const author = isStudentReply 
            ? students[Math.floor(Math.random() * students.length)]
            : (Math.random() > 0.7 ? admin : instructors[Math.floor(Math.random() * instructors.length)])
          
          const studentReplies = [
            'This is really helpful! I was struggling with this concept, but your explanation makes it much clearer. Thank you for sharing your insights.',
            'Great discussion topic! I\'ve been working on a similar project and found that this approach works really well in practice.',
            'I have a question related to this: How would you handle edge cases when implementing this solution? Any best practices to recommend?',
            'Thanks for bringing this up! I encountered a similar issue in my assignment and this discussion is exactly what I needed.',
            'Excellent point! I hadn\'t considered that perspective. This gives me some new ideas for my current project implementation.',
            'I agree with the points mentioned above. Additionally, I found this resource helpful: [additional learning material reference]',
            'This discussion has been really valuable. Could someone share more examples of how this applies in real-world scenarios?',
            'I\'m still having trouble with this concept. Could someone provide a step-by-step breakdown of the implementation process?',
            'Great insights everyone! I\'ve learned more from this discussion than I expected. The collaborative approach really works.',
            'I tried implementing this and ran into some issues. Has anyone else experienced similar challenges? How did you resolve them?',
            'This connects really well with what we learned in the previous module. It\'s great to see how these concepts build on each other.',
            'I appreciate all the different perspectives shared here. It\'s helping me understand the broader implications of what we\'re learning.'
          ]
          
          const instructorReplies = [
            'Excellent question! This touches on a fundamental concept that many students find challenging. Let me provide some additional context and examples.',
            'Great discussion, everyone! I\'m pleased to see such active engagement with the course material. Keep up the collaborative learning!',
            'I notice some confusion around this topic. Let me clarify the key points and provide some additional resources for further study.',
            'These are exactly the kinds of questions that lead to deeper understanding. I encourage you to continue exploring these concepts.',
            'Well done on identifying this connection! This shows you\'re thinking critically about how different concepts relate to each other.',
            'This is a common challenge in industry as well. Let me share some best practices from my professional experience.',
            'I appreciate the thoughtful discussion here. Remember that there are often multiple valid approaches to solving these problems.',
            'Great insights from everyone! This discussion will be valuable for all students taking this course.'
          ]
          
          const replyContent = isStudentReply 
            ? studentReplies[Math.floor(Math.random() * studentReplies.length)]
            : instructorReplies[Math.floor(Math.random() * instructorReplies.length)]
          
          await prisma.discussionReply.create({
            data: {
              threadId: thread.id,
              authorId: author.id,
              content: replyContent,
              createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000) // Random date within last 45 days
            }
          })
        }
      }
    }

    console.log('✅ Comprehensive database seeding completed successfully!')
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log('👤 Admin: admin@skillportal.com / admin123')
    console.log('👩‍🏫 Instructors:')
    instructors.forEach((instructor, index) => {
      console.log(`   ${instructor.email} / instructor123`)
    })
    console.log('👨‍🎓 Students: student1@example.com to student12@example.com / student123')
    console.log('')
    console.log('📊 Comprehensive Data Summary:')
    console.log(`- ${1 + instructors.length + students.length} users created (1 admin, ${instructors.length} instructors, ${students.length} students)`)
    console.log(`- ${skills.length} skills across ${new Set(skills.map(s => s.category)).size} categories`)
    console.log(`- ${courses.length} courses with detailed descriptions`)
    console.log(`- ${assignments.length} assignments with varied due dates and complexity`)
    console.log(`- ${completedEnrollments.length} certificates issued for completed courses`)
    console.log(`- Rich discussion threads with meaningful conversations`)
    console.log(`- Comprehensive user skill profiles with realistic level distributions`)
    console.log(`- Realistic enrollment patterns with varied progress and statuses`)
    console.log('')
    console.log('🎯 Complete Feature Set Available:')
    console.log('- ✅ Multi-role authentication system (Admin, Instructor, Student)')
    console.log('- ✅ Comprehensive skill management and personal portfolios')
    console.log('- ✅ Course enrollment with progress tracking')
    console.log('- ✅ Assignment submission and grading system')
    console.log('- ✅ Automated certificate generation')
    console.log('- ✅ Interactive discussion forums')
    console.log('- ✅ Personal skill development tracking')
    console.log('- ✅ Admin analytics and user management')
    console.log('- ✅ Role-based dashboards and navigation')
    console.log('- ✅ Complete course and assignment detail pages')
    console.log('- ✅ Profile management system')
    console.log('')
    console.log('🚀 Your SkillPortal is now ready with comprehensive demo data!')
    console.log('   Navigate through all features and test the complete functionality.')

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
