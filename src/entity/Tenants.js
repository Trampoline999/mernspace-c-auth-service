import { EntitySchema } from "typeorm";

export const Tenant = new EntitySchema({
  name: "Tenant",
  tableName: "tenants",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
    },
    address: {
      type: "varchar",
      length: 255,
    },
  },
  relations: {
    users: {
      type: "one-to-many", 
      target: "User",
      inverseSide: "tenant",
    },
  },
});
