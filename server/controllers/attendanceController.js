const { Attendance, User, Class, Enrollment } = require('../models');

exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId, date } = req.params;
    console.log(`Fetching attendance for class: ${classId} on date: ${date}`);
    
    // Get all students in the class
    const classObj = await Class.findByPk(classId, {
      include: [{
        model: User,
        attributes: ['id', 'fullName'],
        through: { attributes: [] }
      }]
    });

    if (!classObj) {
      console.log('Class not found');
      return res.status(404).json({ message: 'Class not found' });
    }

    console.log(`Found ${classObj.Users ? classObj.Users.length : 0} students enrolled in class.`);

    // Get existing attendance for this date
    const attendanceRecords = await Attendance.findAll({
      where: { ClassId: classId, date: date }
    });

    // Map attendance to students
    const studentList = (classObj.Users || []).map(student => {
      const record = attendanceRecords.find(r => r.UserId === student.id);
      return {
        id: student.id,
        fullName: student.fullName,
        status: record ? record.status : null
      };
    });

    res.json(studentList);
  } catch (error) {
    console.error('Error in getAttendanceByClass:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body;
    console.log(`Marking attendance for class ${classId} on ${date}`);

    for (const item of attendanceData) {
      const [record, created] = await Attendance.findOrCreate({
        where: { ClassId: classId, UserId: item.studentId, date: date },
        defaults: { status: item.status }
      });

      if (!created) {
        record.status = item.status;
        await record.save();
      }
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error in markAttendance:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGlobalAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'fullName', 'username']
    });

    const attendanceRecords = await Attendance.findAll({
      where: { date: date }
    });

    const studentList = students.map(student => {
      const record = attendanceRecords.find(r => r.UserId === student.id);
      return {
        id: student.id,
        fullName: student.fullName,
        username: student.username,
        status: record ? record.status : null,
        updatedAt: record ? record.updatedAt : null
      };
    });

    res.json(studentList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markGlobalAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;

    for (const item of attendanceData) {
      // Find the first class this student is enrolled in
      const enrollment = await Enrollment.findOne({ where: { UserId: item.studentId } });
      const classId = enrollment ? enrollment.ClassId : null;

      const [record, created] = await Attendance.findOrCreate({
        where: { UserId: item.studentId, date: date },
        defaults: { status: item.status, ClassId: classId }
      });

      if (!created) {
        record.status = item.status;
        // If existing record has no class, update it
        if (!record.ClassId && classId) record.ClassId = classId;
        await record.save();
      }
    }

    res.json({ message: 'Global attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.findAll({
      include: [
        { 
          model: User, 
          attributes: ['fullName', 'username'],
          include: [{ model: Class, attributes: ['className'], through: { attributes: [] } }]
        },
        { model: Class, attributes: ['className'] }
      ],
      order: [['date', 'DESC'], ['updatedAt', 'DESC']]
    });

    const resolvedHistory = history.map(record => {
      const data = record.get({ plain: true });
      // Resolve class name: prioritized order: 1. Record's ClassId, 2. Student's first enrolled class, 3. Fallback
      data.resolvedClassName = data.Class?.className || 
                               (data.User?.Classes && data.User.Classes.length > 0 ? data.User.Classes[0].className : 'Not Enrolled');
      return data;
    });

    res.json(resolvedHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
