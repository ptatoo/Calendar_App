const sqlite = require('better-sqlite3');
const tokenDb = new sqlite('data/tokens.db');
const usersDb = new sqlite('data/users.db');

tokenDb.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    refresh_token TEXT
  )
`).run();

usersDb.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    children TEXT
  )
`).run();

function linkParentToChild(parentId, childId){

}

function saveInformation(userId, refreshToken) {
    const stmt = tokenDb.prepare(`
        INSERT INTO users (id,refresh_token)
        VALUES (?,?)
        ON CONFLICT(id) DO UPDATE SET refresh_token=excluded.refresh_token
    `);
    return stmt.run(userId, refreshToken);
}

function displayAllData() {
    const rows = tokenDb.prepare('SELECT * FROM users').all();
    rows.forEach(row => {
        console.log(`ID: ${row.id} | Token: ${row.refresh_token}`);
    });

    return rows;
}

function getAllRefreshTokens() {
    const stmt = tokenDb.prepare('SELECT refresh_token FROM users');
    const rows = stmt.all(); 
    return rows.map(row => row.refresh_token);
}

function getRefreshToken(userId) {
    const stmt = tokenDb.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(userId);
    return row ? row.refresh_token : null;
}

module.exports = { saveInformation, displayAllData, getRefreshToken, getAllRefreshTokens };