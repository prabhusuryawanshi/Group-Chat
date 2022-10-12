require('dotenv').config();
const ENV = require('../utility/environemt');

const jwt = require('jsonwebtoken');

const createToken = async id => {
  const token = await jwt.sign({ data: id }, ENV.JWT_SECRET, { expiresIn: '72h' });
  return token;
};

const checkToken = async (id, token) => {
  const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);
  return decodedToken.data == id;
};

exports.createToken = createToken;
exports.checkToken = checkToken;
