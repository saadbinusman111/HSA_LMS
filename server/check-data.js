const { User, Class, Enrollment } = require('./models');

async function checkData() {
  const saad = await User.findOne({ where: { username: 'saad' } });
  const admin = await User.findOne({ where: { username: 'admin' } });

  if (saad) {
    const classes = await Class.count({ where: { teacherId: saad.id } });
    console.log(`User 'saad' (ID ${saad.id}) has ${classes} classes.`);
  }

  if (admin) {
    const classes = await Class.count({ where: { teacherId: admin.id } });
    console.log(`User 'admin' (ID ${admin.id}) has ${classes} classes.`);
  }
}

checkData();