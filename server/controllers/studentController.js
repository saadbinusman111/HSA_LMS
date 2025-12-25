const { Class, User, Enrollment, Assignment, Submission, Attendance } = require('../models');

// Get all enrolled classes for the logged-in student
exports.getMyClasses = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findByPk(userId, {
      include: [{ model: Class, include: [User] }] // Include Class and its other students (count)
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Format the response
    const classes = user.Classes.map(cls => ({
      id: cls.id,
      className: cls.className,
      schedule: cls.schedule,
      type: cls.type,
      totalStudents: cls.Users.length
    }));

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assignments across all enrolled classes
exports.getMyAssignments = async (req, res) => {
  try {
    const { userId } = req;
    
    // Find classes first
    const user = await User.findByPk(userId, {
      include: [{
        model: Class,
        include: [{
          model: Assignment,
          include: [{ 
            model: Submission, 
            where: { UserId: userId }, 
            required: false 
          }]
        }]
      }]
    });

    let allAssignments = [];
    user.Classes.forEach(cls => {
      cls.Assignments.forEach(ass => {
        allAssignments.push({
          id: ass.id,
          title: ass.title,
          description: ass.description,
          dueDate: ass.dueDate,
          className: cls.className,
          classId: cls.id,
          status: ass.Submissions.length > 0 ? ass.Submissions[0].status : 'pending',
          marks: ass.Submissions.length > 0 ? ass.Submissions[0].marks : null
        });
      });
    });

    // Sort by due date
    allAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(allAssignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance Record
exports.getMyAttendance = async (req, res) => {
  try {
    const { userId } = req;
    const attendance = await Attendance.findAll({
      where: { UserId: userId },
      include: [{ model: Class, attributes: ['className'] }],
      order: [['date', 'DESC']]
    });

    // Calculate stats
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const percentage = total === 0 ? 100 : Math.round((present / total) * 100);

    res.json({
      summary: { total, present, percentage },
      records: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
