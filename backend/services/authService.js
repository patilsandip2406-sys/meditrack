const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

// Mongoose hashed the password in a pre('save') hook on the model.
// Prisma has no such hooks - hashing moves explicitly into the service,
// which is arguably clearer: "how a password is stored" is a business
// rule, not a database concern.
const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

exports.register = async ({ name, email, password, role }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepo.create({ name, email, password: hashedPassword, role });

  return { token: signToken(user), user: { id: user.id, name, email, role: user.role } };
};

exports.login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  return {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};