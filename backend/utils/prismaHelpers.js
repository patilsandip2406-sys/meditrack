// Prisma throws (error.code === 'P2025') when you update/delete a row
// that doesn't exist. Mongoose just returned null - this restores that
// behavior so the service layer above doesn't need to change.
async function orNullIfMissing(promise) {
  try {
    return await promise;
  } catch (err) {
    if (err.code === 'P2025') return null;
    throw err;
  }
}
module.exports = { orNullIfMissing };