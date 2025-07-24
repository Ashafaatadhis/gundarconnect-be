"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("About", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      bio1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bio2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skillsTechnical: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      skillsSoft: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      skillsLanguages: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      experience: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("About");
  },
};
