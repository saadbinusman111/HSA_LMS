const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function reset() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  await User.upsert({
    username: 'admin',
    password: hashedPassword,
    role: 'teacher',
    fullName: 'Saad Bin Usman'
  });
  console.log('Teacher admin reset to: admin / 123456');
  process.exit();
}

reset();