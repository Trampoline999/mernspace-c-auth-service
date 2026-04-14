import { Buffer } from "buffer";

//write utility function..
export const truncateTable = async (connection) => {
  const entities = connection.entityMetadatas;
  
  // Get table names in reverse order to handle FK constraints
  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .reverse();
  
  // Use TRUNCATE with CASCADE to handle FK constraints
  await connection.query(`TRUNCATE TABLE ${tableNames.join(", ")} CASCADE`);
};

export const isJwt = (token) => {
  if (token === null) {
    return false;
  }
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      Buffer.from(part, "base64").toString("utf-8");
    });
    return true;
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return false;
  }
};
