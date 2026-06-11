const { Class, User, Enrollment, Material, Assignment, Submission, Message, Attendance, Result } = require('../models');

// Create Class
exports.createClass = async (req, res) => {
  try {
    const { className, schedule, type } = req.body;
    const newClass = await Class.create({ className, schedule, type });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Classes
exports.getAllClasses = async (req, res) => {
  try {
    const { userRole, userId } = req;
    let options = {
      include: [{ model: User, attributes: ['id', 'fullName'] }]
    };

    if (userRole === 'student') {
      options.include = [{ 
        model: User, 
        where: { id: userId },
        attributes: ['id', 'fullName'] 
      }];
    }

    const classes = await Class.findAll(options);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll Student
exports.enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    console.log(`Enrolling student ${studentId} into class ${classId}`);

    const classObj = await Class.findByPk(classId);
    const user = await User.findByPk(studentId);

    if (!classObj || !user) {
      return res.status(404).json({ message: 'Class or User not found' });
    }

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { ClassId: classId, UserId: studentId }
    });

    if (created) {
      console.log('Enrollment created successfully');
    } else {
      console.log('Student already enrolled');
    }

    res.json({ message: 'Enrolled successfully', created });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Single Class
exports.getClassDetails = async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'fullName', 'username'] }
      ]
    });
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    res.json(classObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classObj = await Class.findByPk(id);

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Enrollment.destroy({ where: { ClassId: id } });
    await Material.destroy({ where: { ClassId: id } });
    
    const assignments = await Assignment.findAll({ where: { ClassId: id } });
    const assignmentIds = assignments.map(a => a.id);
    if (assignmentIds.length > 0) {
        await Submission.destroy({ where: { AssignmentId: assignmentIds } });
        await Assignment.destroy({ where: { ClassId: id } });
    }

    await Message.destroy({ where: { ClassId: id } });
    await Attendance.destroy({ where: { ClassId: id } });
    await Result.destroy({ where: { ClassId: id } });

    await classObj.destroy();

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove Student from Class
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId, userId } = req.params;
    
    // This finds the specific link and removes it
    const deleted = await Enrollment.destroy({
      where: { ClassId: classId, UserId: userId }
    });

    if (deleted) {
      res.json({ message: 'Student removed from class' });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  enrollStudent,
  getClassDetails,
  deleteClass,
  removeStudentFromClass
};
