const { Result, User, Class } = require('../models');

exports.uploadResults = async (req, res) => {
  try {
    const { classId, testName, totalMarks, testDate, resultsData } = req.body;

    for (const item of resultsData) {
      // Check if marks are provided (allows 0 but skips empty strings)
      if (item.obtainedMarks === '' || item.obtainedMarks === null || item.obtainedMarks === undefined) continue;

      const marks = parseInt(item.obtainedMarks);

      const [result, created] = await Result.findOrCreate({
        where: { 
          testName, 
          testDate, 
          UserId: item.studentId,
          ClassId: classId 
        },
        defaults: { 
          totalMarks, 
          obtainedMarks: marks, 
          remarks: item.remarks 
        }
      });

      if (!created) {
        result.obtainedMarks = marks;
        result.remarks = item.remarks;
        result.totalMarks = totalMarks;
        await result.save();
      }
    }

    res.json({ message: 'Results saved/updated successfully' });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResultsHistory = async (req, res) => {
  try {
    const results = await Result.findAll({
      include: [
        { model: User, attributes: ['fullName', 'username'] },
        { model: Class, attributes: ['className'] }
      ],
      order: [['testDate', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassResults = async (req, res) => {
  try {
    const { classId } = req.params;
    const results = await Result.findAll({
      where: { ClassId: classId },
      include: [{ model: User, attributes: ['fullName'] }],
      order: [['testDate', 'DESC']]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const { userId } = req;
    const results = await Result.findAll({
      where: { UserId: userId },
      include: [{ model: Class, attributes: ['className'] }],
      order: [['testDate', 'DESC']]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    let { obtainedMarks, totalMarks, remarks, testName } = req.body;

    const result = await Result.findByPk(id);
    if (!result) {
      return res.status(404).json({ message: 'Result record not found' });
    }

    // Basic validation
    const obtained = parseInt(obtainedMarks, 10);
    const total = parseInt(totalMarks, 10);

    if (isNaN(obtained) || isNaN(total)) {
      return res.status(400).json({ message: 'Marks must be valid numbers.' });
    }

    result.obtainedMarks = obtained;
    result.totalMarks = total;
    result.remarks = remarks || result.remarks;
    result.testName = testName || result.testName;

    await result.save();

    // Return the updated record with associations
    const updatedResult = await Result.findByPk(id, {
      include: [
        { model: User, attributes: ['fullName', 'username'] },
        { model: Class, attributes: ['className'] }
      ]
    });

    res.json({ message: 'Result updated successfully', result: updatedResult });
  } catch (error) {
    console.error('Update Result Error:', error);
    res.status(500).json({ error: error.message });
  }
};
