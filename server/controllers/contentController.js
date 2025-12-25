const { Material, Assignment, Submission, Class, User, Message } = require('../models');

// Add Material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, type, classId, category, linkUrl } = req.body;
    let url = linkUrl;

    if (req.file) {
      url = `/uploads/${req.file.filename}`;
    }

    const material = await Material.create({
      title,
      type,
      url,
      category,
      ClassId: classId
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Materials
exports.getClassMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll({ where: { ClassId: req.params.classId } });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      ClassId: classId
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Assignments with Submissions
exports.getClassAssignments = async (req, res) => {
  try {
    const { userId, userRole } = req;
    
    // If student, include THEIR submission
    // If teacher, include ALL submissions
    
    const assignments = await Assignment.findAll({ 
      where: { ClassId: req.params.classId },
      include: userRole === 'teacher' 
        ? [{ model: Submission, include: [User] }] // Teacher sees all
        : [{ model: Submission, where: { UserId: userId }, required: false }] // Student sees theirs
    });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const { userId } = req;
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const submission = await Submission.create({
      fileUrl: `/uploads/${req.file.filename}`,
      AssignmentId: assignmentId,
      UserId: userId,
      status: 'submitted'
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { ClassId: req.params.classId },
      include: [{ model: User, as: 'Sender', attributes: ['fullName', 'role'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Post Message
exports.postMessage = async (req, res) => {
  try {
    const { content, classId } = req.body;
    const { userId } = req;
    
    const message = await Message.create({
      content,
      ClassId: classId,
      senderId: userId
    });
    
    // Return with sender info for immediate display
    const fullMessage = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'Sender', attributes: ['fullName', 'role'] }]
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
