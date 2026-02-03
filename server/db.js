const sqlite = require('better-sqlite3');
const db = new sqlite('data/tokens.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    refresh_token TEXT
  )
`).run();

function saveRefreshToken(userId, refreshToken) {
    const stmt = db.prepare(`
        INSERT INTO users (id,refresh_token)
        VALUES (?,?)
        ON CONFLICT(id) DO UPDATE SET refresh_token=excluded.refresh_token
    `);
    return stmt.run(userId, refreshToken);
}

function displayAllData() {
    const rows = db.prepare('SELECT * FROM users').all();
    rows.forEach(row => {
        console.log(`ID: ${row.id} | Token: ${row.refresh_token}`);
    });

    return rows;
}

function getAllRefreshTokens() {
    const stmt = db.prepare('SELECT refresh_token FROM users');
    const rows = stmt.all(); 
    return rows.map(row => row.refresh_token);
}

function getRefreshToken(userId) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(userId);
    return row ? row.refresh_token : null;
}

module.exports = { saveRefreshToken, displayAllData, getRefreshToken, getAllRefreshTokens };