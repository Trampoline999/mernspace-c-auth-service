import { EntitySchema } from "typeorm";

export const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "RefreshTokens",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    token: {
      type: "varchar",
      unique: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
  },
});
