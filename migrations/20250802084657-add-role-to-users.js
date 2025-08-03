"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "user",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "role");
  },
};
