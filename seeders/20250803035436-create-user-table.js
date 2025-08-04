"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Roles", [
      {
        fullName: "Administrator",
        username: "admin@gundarconnect.com",
        password:
          "$2b$12$p90Firnvk1q3SG87e2nIWuOIm/8QviDSanJmT.7Ro0f6IUzKmlhlC",
        avatar: "default-avatar.png",
        studentId: "ADMIN001",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.bulkDelete("Roles", {
    //   name: { [Sequelize.Op.in]: ["admin", "user"] },
    // });
  },
};
