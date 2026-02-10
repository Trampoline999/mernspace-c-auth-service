//write utility function..
export const truncateTable = async (connection) => {
  const entities = await connection.entitiesMetaData();

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};
