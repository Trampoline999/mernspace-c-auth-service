import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users", // Maps to the "users" table in PostgreSQL
  columns: {
    id: {
      primary: true,
      type: "int", // PostgreSQL specific column type
      generated: true, // Auto-incrementing primary key
    },
    firstName: {
      type: "varchar",
    },
    lastName: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    role: {
      type: "varchar",
    },
  },
});
