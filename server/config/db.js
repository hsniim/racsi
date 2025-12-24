require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,  // Railway MySQL internal port selalu 3306
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  ssl: {
    rejectUnauthorized: false  // Railway TCP Proxy tidak pakai CA valid, jadi false biar connect sukses
  }
});

module.exports = pool;


/*
CONFIG DATABASE BUAT LOCALHOST


require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,         
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  ssl: {
    rejectUnauthorized: true
  }    
});

module.exports = pool;
*/