"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserFollowers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      followerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users", // pastikan nama tabelnya sesuai di database
          key: "id",
        },
        onDelete: "CASCADE",
      },
      followingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // ❗Tambahkan unique constraint agar tidak bisa follow 2x
    await queryInterface.addConstraint("UserFollowers", {
      fields: ["followerId", "followingId"],
      type: "unique",
      name: "unique_follow_relation",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserFollowers");
  },
};
