const { User } = require('./models');

async function listUsers() {
  const users = await User.findAll();
  users.forEach(u => {
    console.log(`ID: ${u.id} | Role: ${u.role} | Username: ${u.username} | Name: ${u.fullName}`);
  });
}

listUsers();