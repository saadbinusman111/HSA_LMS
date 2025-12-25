const { Fee, User, Class } = require('../models');

exports.getFeesByClass = async (req, res) => {
  try {
    const { classId, month, year } = req.params;
    
    // Get students in this class
    const classObj = await Class.findByPk(classId, {
      include: [{
        model: User,
        where: { role: 'student' },
        attributes: ['id', 'fullName'],
        through: { attributes: [] }
      }]
    });

    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    // Get fee records for these students for this month/year
    const feeRecords = await Fee.findAll({
      where: { 
        UserId: classObj.Users.map(u => u.id),
        month,
        year
      }
    });

    const studentFees = classObj.Users.map(student => {
      const record = feeRecords.find(r => r.UserId === student.id);
      return {
        id: student.id,
        fullName: student.fullName,
        feeStatus: record ? record.status : 'pending',
        amount: record ? record.amount : 0,
        feeId: record ? record.id : null
      };
    });

    res.json(studentFees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markFeePaid = async (req, res) => {
  try {
    const { studentId, month, year, amount, status } = req.body;

    const [fee, created] = await Fee.findOrCreate({
      where: { UserId: studentId, month, year },
      defaults: { amount, status, paidDate: status === 'paid' ? new Date() : null }
    });

    if (!created) {
      fee.status = status;
      fee.amount = amount;
      fee.paidDate = status === 'paid' ? new Date() : null;
      await fee.save();
    }

    res.json({ message: 'Fee updated successfully', fee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const { userId } = req;
    const fees = await Fee.findAll({
      where: { UserId: userId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFeesHistory = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [{ model: User, attributes: ['fullName', 'username'] }],
      order: [['year', 'DESC'], ['month', 'DESC'], ['updatedAt', 'DESC']]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
