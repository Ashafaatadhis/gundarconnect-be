const bcrypt = require('bcryptjs');
const plainText = '';
const hash = '$$2b$10$pdw7LlnLDPAG4P8likHrkeVkXrLPObMnWaGqM8WDOuqJXFKM7SajS'; // Contoh hash dari 'ganteng'

bcrypt.compare(plainText, hash)
  .then(result => {
    console.log(result); // true jika cocok, false jika tidak
  });