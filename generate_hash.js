const bcrypt = require('bcryptjs');
bcrypt.hash('123admin', 10).then(console.log);