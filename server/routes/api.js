const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, verifyTeacher } = require('../middleware/authJwt');
const classController = require('../controllers/classController');
const contentController = require('../controllers/contentController');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const feeController = require('../controllers/feeController');
const teacherController = require('../controllers/teacherController');
const resultController = require('../controllers/resultController');
const { User, Enrollment, Class } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// === AUTH & SETTINGS ===
router.post('/login', authController.login);
router.post('/change-password', verifyToken, authController.changePassword);
router.post('/change-username', verifyToken, authController.changeUsername);

// === STUDENT SPECIFIC ROUTES ===
router.get('/student/classes', verifyToken, studentController.getMyClasses);
router.get('/student/assignments', verifyToken, studentController.getMyAssignments);
router.get('/student/attendance', verifyToken, studentController.getMyAttendance);
router.get('/student/fees', verifyToken, feeController.getStudentFees);

// === CLASS ROUTES ===
router.post('/classes', verifyTeacher, classController.createClass);
router.get('/classes', verifyToken, classController.getAllClasses);
router.get('/classes/:id', verifyToken, classController.getClassDetails);
router.delete('/classes/:id', verifyTeacher, classController.deleteClass);
router.post('/enroll', verifyTeacher, classController.enrollStudent);
router.delete('/classes/:classId/students/:userId', verifyTeacher, classController.removeStudentFromClass);

// === FLEXIBLE ENROLLED STUDENTS FETCH ROUTE ===
router.get('/classes/:classId/students', verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // 1. Delegate to controller if explicitly defined
    if (typeof classController.getClassStudents === 'function') {
      return classController.getClassStudents(req, res);
    }

    // 2. Fetch raw enrollments for classId
    const rawEnrollments = await Enrollment.findAll({
      where: { classId },
      raw: true
    });

    // 3. Extract student IDs checking all standard column naming variations
    const extractedStudentIds = rawEnrollments
      .map(e => e.studentId || e.userId || e.User_id || e.StudentId || e.user_id)
      .filter(Boolean);

    if (extractedStudentIds.length > 0) {
      const students = await User.findAll({
        where: {
          id: { [Op.in]: extractedStudentIds },
          role: 'student'
        },
        attributes: ['id', 'fullName', 'username', 'role']
      });
      return res.json(students);
    }

    // 4. Association Fallback: Attempt relational join if keys were auto-aliased
    try {
      const joinedEnrollments = await Enrollment.findAll({
        where: { classId },
        include: [{
          model: User,
          attributes: ['id', 'fullName', 'username', 'role']
        }]
      });

      const joinedStudents = joinedEnrollments
        .map(e => e.User)
        .filter(u => u && u.role === 'student');

      if (joinedStudents.length > 0) {
        return res.json(joinedStudents);
      }
    } catch (assocErr) {
      console.warn('Include fallback error:', assocErr.message);
    }

    // 5. Direct Fallback: Fetch target class name and check if student usernames/names match class grade
    const targetClass = await Class.findByPk(classId);
    if (targetClass && targetClass.name) {
      const classNameClean = targetClass.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const allStudents = await User.findAll({
        where: { role: 'student' },
        attributes: ['id', 'fullName', 'username', 'role']
      });

      const matchedStudents = allStudents.filter(st => {
        const uname = (st.username || '').toLowerCase();
        const fname = (st.fullName || '').toLowerCase();
        return uname.includes(classNameClean) || fname.includes(classNameClean);
      });

      if (matchedStudents.length > 0) {
        return res.json(matchedStudents);
      }
    }

    // Default empty array if no students are assigned
    res.json([]);
  } catch (err) {
    console.error('Error fetching class students:', err);
    res.status(500).json({ error: err.message });
  }
});

// === STUDENT MANAGEMENT (TEACHER ONLY) ===
router.post('/register-student', verifyTeacher, authController.registerStudent);

router.get('/students', verifyTeacher, async (req, res) => {
  try {
    const students = await User.findAll({ where: { role: 'student' } });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students/:id/reset-password', verifyTeacher, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ 
      password: hashedPassword,
      password_text: newPassword 
    }, { where: { id: req.params.id } });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', verifyTeacher, authController.deleteStudent);

// === CONTENT ROUTES ===
router.post('/material', verifyTeacher, upload.single('file'), contentController.uploadMaterial);
router.get('/classes/:classId/materials', verifyToken, contentController.getClassMaterials);

// === ASSIGNMENT ROUTES ===
router.post('/assignments', verifyTeacher, contentController.createAssignment);
router.get('/classes/:classId/assignments', verifyToken, contentController.getClassAssignments);
router.post('/submit-assignment', verifyToken, upload.single('file'), contentController.submitAssignment);

// === DISCUSSION ROUTES ===
router.get('/classes/:classId/messages', verifyToken, contentController.getMessages);
router.post('/messages', verifyToken, contentController.postMessage);

// === ATTENDANCE ROUTES ===
router.get('/attendance/:classId/:date', verifyTeacher, attendanceController.getAttendanceByClass);
router.post('/attendance/mark', verifyTeacher, attendanceController.markAttendance);
router.get('/attendance-global/:date', verifyTeacher, attendanceController.getGlobalAttendance);
router.post('/attendance/mark-global', verifyTeacher, attendanceController.markGlobalAttendance);
router.get('/attendance-history', verifyTeacher, attendanceController.getAttendanceHistory);

// === FEE ROUTES ===
router.get('/fees/:classId/:month/:year', verifyTeacher, feeController.getFeesByClass);
router.post('/fees/mark', verifyTeacher, feeController.markFeePaid);
router.get('/fees-history', verifyTeacher, feeController.getAllFeesHistory);

// === RESULT & REPORT ROUTES ===
router.post('/results/upload', verifyTeacher, resultController.uploadResults);
router.put('/results/:id', verifyTeacher, resultController.updateResult);
router.delete('/results/:id', verifyTeacher, resultController.deleteResult);
router.get('/results/class/:classId', verifyTeacher, resultController.getClassResults);
router.get('/results/history', verifyTeacher, resultController.getAllResultsHistory);
router.get('/student/results', verifyToken, resultController.getMyResults);

// === STUDENT PDF REPORT ROUTE ===
router.get('/report/:studentId', verifyToken, async (req, res) => {
  if (typeof resultController.getStudentReport === 'function') {
    return resultController.getStudentReport(req, res);
  }
  
  try {
    const { studentId } = req.params;
    const student = await User.findByPk(studentId, {
      attributes: ['id', 'fullName', 'username', 'role']
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Report route connected', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === TEACHER DASHBOARD ===
router.get('/teacher/stats', verifyTeacher, teacherController.getDashboardStats);

// === DIAGNOSTIC ROUTE ===
router.get('/diagnose-enrollments', verifyTeacher, async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll();
    const users = await User.findAll({ attributes: ['id', 'fullName', 'role'] });
    const classes = await Class.findAll();
    res.json({ enrollments, users, classes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
