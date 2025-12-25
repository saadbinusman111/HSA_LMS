const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Enrollment = require('./Enrollment');
const Material = require('./Material');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Message = require('./Message');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Result = require('./Result');

// User <-> Class (Enrollment)
User.belongsToMany(Class, { through: Enrollment, foreignKey: 'UserId' });
Class.belongsToMany(User, { through: Enrollment, foreignKey: 'ClassId' });

// Class <-> Material
Class.hasMany(Material);
Material.belongsTo(Class);

// Class <-> Assignment
Class.hasMany(Assignment);
Assignment.belongsTo(Class);

// Assignment <-> Submission
Assignment.hasMany(Submission);
Submission.belongsTo(Assignment);
User.hasMany(Submission);
Submission.belongsTo(User);

// Class <-> Message (Group Chat / Announcements)
Class.hasMany(Message);
Message.belongsTo(Class);
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });

// Attendance
User.hasMany(Attendance);
Attendance.belongsTo(User);
Class.hasMany(Attendance);
Attendance.belongsTo(Class);

// Fees
User.hasMany(Fee);
Fee.belongsTo(User);

// Results
User.hasMany(Result);
Result.belongsTo(User);
Class.hasMany(Result);
Result.belongsTo(Class);

module.exports = {
  sequelize,
  User,
  Class,
  Enrollment,
  Material,
  Assignment,
  Submission,
  Message,
  Attendance,
  Fee,
  Result
};