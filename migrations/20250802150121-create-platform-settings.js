"use strict";

/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PlatformSettings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // Moderation settings
      autoModeration: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      bannedWords: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },

      // Timestamps
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Insert default row
    await queryInterface.bulkInsert(
      "PlatformSettings",
      [
        {
          name: "GundarConnect",
          description:
            "Platform komunitas mahasiswa Universitas Gunadarma untuk berbagi cerita, bertanya, dan berinteraksi.",

          autoModeration: true,
          bannedWords: "spam, jual, beli, promosi, kasar",
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PlatformSettings");
  },
};
