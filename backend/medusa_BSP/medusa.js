// medusa-framework/medusa.config.js
/**
 * @fileoverview Medusa Framework configuration for Supabase integration.
 * Compatible with Node.js 20+, CommonJS syntax, and Google JS Style Guide.
 */

require('dotenv').config();

/**
 * Tạo URL kết nối Postgres trực tiếp từ Supabase URL.
 * Supabase_URL có dạng: https://<ref>.supabase.co
 * → host DB thực tế sẽ là: <ref>.supabase.co
 */
const supabaseHost = process.env.SUPABASE_URL
  ? process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '.supabase.co')
  : 'localhost';

// Supabase dùng DB username mặc định là "postgres"
const databaseUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${supabaseHost}:5432/postgres`;

module.exports = {
  projectConfig: {
    /**
     * Database connection — dùng SSL bắt buộc với Supabase.
     */
    databaseUrl,
    databaseExtra: {
      ssl: { rejectUnauthorized: false },
    },

    /**
     * CORS: cho phép frontend (React/Next) và admin dashboard truy cập.
     * Có thể chỉnh tùy domain của bạn.
     */
    storeCors: 'http://localhost:3000,http://localhost:5001',
    adminCors: 'http://localhost:7001,http://localhost:5001',

    /**
     * Redis có thể thêm sau nếu bạn dùng queue hoặc cache.
     */
    redisUrl: null,
  },

  /**
   * Modules: để mặc định.
   * Bạn có thể thêm custom plugin hoặc module ở đây (Stripe, File Service, v.v.).
   */
  modules: {},

  /**
   * Cổng chạy Medusa (không trùng với Express 5001).
   */
  serverConfig: {
    port: 9000,
  },
};
  