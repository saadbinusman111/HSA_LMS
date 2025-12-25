const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token.split(" ")[1], 'hsa_lms_super_secret_key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const verifyTeacher = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.userRole === 'teacher') {
      next();
    } else {
      res.status(403).json({ message: 'Requires Teacher Role' });
    }
  });
};

module.exports = { verifyToken, verifyTeacher };