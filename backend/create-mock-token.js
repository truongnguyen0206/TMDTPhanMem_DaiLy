// Script tạo mock JWT token để test API
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Tạo mock token cho Admin user
const mockPayload = {
  userId: 1,
  username: 'admin',
  role: 'Admin',
  role_id: 1,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const mockToken = jwt.sign(mockPayload, JWT_SECRET);

console.log('🔑 Mock JWT Token for testing:');
console.log('=====================================');
console.log(mockToken);
console.log('=====================================');
console.log('');
console.log('📋 Copy token này vào Postman environment variable "token"');
console.log('');
console.log('🔍 Token payload:');
console.log(JSON.stringify(mockPayload, null, 2));
console.log('');
console.log('✅ Token sẽ hết hạn sau 24 giờ');
console.log('🚀 Bạn có thể sử dụng token này để test API trong Postman');
