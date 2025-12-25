const { User } = require('./models');

async function fixUsers() {
  try {
    // Find all teachers
    const teachers = await User.findAll({ where: { role: 'teacher' } });
    console.log(`Found ${teachers.length} teachers.`);

    const admin = teachers.find(u => u.username === 'admin');
    const saad = teachers.find(u => u.username === 'saad');

    if (admin && saad) {
      console.log(`Deleting duplicate teacher user '${saad.username}' (ID: ${saad.id}) to resolve conflicts...`);
      await saad.destroy();
      console.log('Duplicate user deleted.');
    } else {
      console.log('No conflict found between "admin" and "saad".');
    }

    // List remaining
    const remaining = await User.findAll({ where: { role: 'teacher' } });
    console.log('Remaining Teachers:');
    remaining.forEach(u => console.log(`- ${u.username} (ID: ${u.id})`));

  } catch (err) {
    console.error('Error fixing users:', err);
  }
}

fixUsers();