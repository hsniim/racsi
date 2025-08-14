const bcrypt = require('bcryptjs');

const password = 'minrac21';
const saltRounds = 10;

// Generate hash
const hashedPassword = bcrypt.hashSync(password, saltRounds);

console.log('Hashed Password:', hashedPassword);