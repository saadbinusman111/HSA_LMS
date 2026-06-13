const { Class, User, Enrollment, Material, Assignment, Submission, Message, Attendance, Result, Fee } = require('../models');

exports.createClass = async (req, res) => {
  try {
    const { className, schedule, type } = req.body;
    const newClass = await Class.create({ className, schedule, type });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const { userRole, userId } = req;
    let options = { include: [{ model: User, attributes: ['id', 'fullName'] }] };
    if (userRole === 'student') {
      options.include = [{ model: User, where: { id: userId }, attributes: ['id', 'fullName'] }];
    }
    const classes = await Class.findAll(options);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    const [enrollment, created] = await Enrollment.findOrCreate({ where: { ClassId: classId, UserId: studentId } });
    res.json({ message: 'Enrolled successfully', created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassDetails = async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id, { include: [{ model: User, attributes: ['id', 'fullName', 'username'] }] });
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    res.json(classObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classObj = await Class.findByPk(id);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    await Enrollment.destroy({ where: { ClassId: id } });
    await classObj.destroy();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId, userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // FULL CLEANUP LOGIC (System-wide Deletion)
    // 1. Delete all Enrollments
    await Enrollment.destroy({ where: { UserId: userId } });
    
    // 2. Delete all Attendance records
    await Attendance.destroy({ where: { UserId: userId } });

    // 3. Delete all Fee records
    await Fee.destroy({ where: { UserId: userId } });

    // 4. Delete all Result records
    await Result.destroy({ where: { UserId: userId } });

    // 5. Delete all Submissions
    await Submission.destroy({ where: { UserId: userId } });

    // 6. Delete all Messages sent by this student
    await Message.destroy({ where: { senderId: userId } });

    // 7. Finally, delete the User record itself (Removes from Student Management tab)
    await user.destroy();

    res.json({ message: 'Student and all associated records permanently removed from the system' });
  } catch (error) {
    console.error('Full Student Deletion Error:', error);
    res.status(500).json({ error: error.message });
  }
};
