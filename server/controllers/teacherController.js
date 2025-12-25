const { User, Class, Fee, Attendance } = require('../models');
const { Sequelize } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalClasses = await Class.count();
    
    // Monthly Fees
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const monthlyFees = await Fee.sum('amount', {
      where: { month: currentMonth, year: currentYear, status: 'paid' }
    }) || 0;

    // Overall Attendance Percentage
    const totalAttendanceRecords = await Attendance.count();
    const presentRecords = await Attendance.count({ where: { status: 'present' } });
    const attendanceRate = totalAttendanceRecords === 0 ? 100 : Math.round((presentRecords / totalAttendanceRecords) * 100);

    // Recent Attendance (Last 5 records)
    const recentAttendanceRecords = await Attendance.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          attributes: ['fullName'],
          include: [{ model: Class, attributes: ['className'], through: { attributes: [] } }]
        },
        { model: Class, attributes: ['className'] }
      ]
    });

    const recentAttendance = recentAttendanceRecords.map(record => {
      const data = record.get({ plain: true });
      data.resolvedClassName = data.Class?.className || 
                               (data.User?.Classes && data.User.Classes.length > 0 ? data.User.Classes[0].className : 'Not Enrolled');
      return data;
    });

    res.json({
      totalStudents,
      totalClasses,
      monthlyFees,
      attendanceRate,
      recentAttendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
