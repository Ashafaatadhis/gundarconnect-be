"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "PlatformSettings",
      [
        {
          id: 1,
          name: "GundarConnect",
          description:
            "Platform komunitas mahasiswa Universitas Gunadarma untuk berbagi cerita, bertanya, dan berinteraksi.",
          adminEmail: "admin@gundarconnect.com",
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("PlatformSettings", null, {});
  },
};
