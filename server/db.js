const sqlite = require('better-sqlite3');
const appDb = new sqlite('data/appDb.db');

appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userInfo (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    refreshToken TEXT
  )
`).run();

appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userChildren (
    parentId TEXT,
    childId TEXT,
    PRIMARY KEY (parentId, childId)
  )
`).run();

//saves information into sqlite userInfo table
const saveInformation = (googleId, email, name, refreshToken) => {
  const stmt = appDb.prepare(`
    INSERT INTO userInfo (id,email,name,refreshToken)
    VALUES (?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET 
      email = excluded.email,
      name = excluded.name,
      refreshToken=excluded.refreshToken
  `);
  return stmt.run(googleId, email, name, refreshToken);
}



//params: parent user id
//return: array of children associated with parentId
const getChildren = (parentId) => {
  const rows = appDb.prepare(`
      SELECT childId FROM userChildren WHERE parentId = ?
    `).all(parentId);
  return rows.map(row => row.childId);
};

//params: parent user id, array of children id
//do: associates list of children id into
const linkParentChildren = (parentId, childIds) => {
  const stmt = appDb.prepare(`
      INSERT OR IGNORE INTO userChildren (parentId, childId) values (?,?)
    `);
  for( const childId of childIds)
    stmt.run(parentId, childId);
};

//params: parent user id, array of children id
//do: delinks parent from listed chlidren
const delinkParentChildren = (parentId, childIds) => {
  const stmt = appDb.prepare(`
      DELETE FROM userChildren WHERE parentId = ? AND childId = ?
    `);
  for( const childId of childIds)
    stmt.run(parentId, childId);
};



//params: userId
//return: refresh token
const getRefreshToken = (userId)  => {
    const stmt = appDb.prepare('SELECT * FROM userInfo WHERE id = ?');
    const row = stmt.get(userId);
    return row ? row.refresh_token : null;
}

//debug
function getAllData(tableName) {
    const rows = appDb.prepare(`SELECT * FROM ${tableName}`).all();
    return rows;
}
module.exports = { saveInformation, getAllData, getRefreshToken};