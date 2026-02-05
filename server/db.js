const sqlite = require('better-sqlite3');
const appDb = new sqlite('data/appDb.db');

appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userInfo (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    refreshToken TEXT NOT NULL
  )
`).run();

appDb.prepare(`
  CREATE TABLE IF NOT EXISTS userChildren (
    parentId TEXT NOT NULL,
    childId TEXT NOT NULL,
    PRIMARY KEY (parentId, childId)
  )
`).run();

//saves information into sqlite userInfo table
const saveUserProfile = (googleId, email, name, refreshToken) => {
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

//gets information from sqlite userInfo table
const getUserProfile = (googleId) => {
  const stmt = appDb.prepare(`
      SELECT * FROM userInfo WHERE id = ?
  `);
  return stmt.get(googleId);
}

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

//params: parent user id, array of children id
//do: delinks parent from listed chlidren
const setParentChildren = (parentId, childIds) => {
  // delete all entries with parent
  appDb.prepare('DELETE FROM userChildren WHERE parentId = ?').run(parentId);

  // insert all new links
  const insertStmt = appDb.prepare(`
      INSERT OR IGNORE INTO userChildren (parentId, childId) VALUES (?,?)
  `);
  for (const childId of childIds) {
    insertStmt.run(parentId, childId);
  }
};

//params: parent user id
//return: array of child profiles (id, email, name, token)
const getChildrenProfiles = (parentId) => {
  return appDb.prepare(`
    SELECT u.id, u.email, u.name, u.refreshToken
    FROM userInfo u
    JOIN userChildren c ON u.id = c.childId
    WHERE c.parentId = ?
  `).all(parentId);
};

//params: parent user id
//return: array of children associated with parentId
const getChildren = (parentId) => {
  const rows = appDb.prepare(`
      SELECT childId FROM userChildren WHERE parentId = ?
    `).all(parentId);
  return rows.map(row => row.childId);
};

//debug
function getAllData(tableName) {
    const rows = appDb.prepare(`SELECT * FROM ${tableName}`).all();
    return rows;
}
module.exports = { 
  saveUserProfile, 
  getUserProfile, 
  getChildrenProfiles, 

  linkParentChildren, 
  delinkParentChildren,
  setParentChildren,
  getChildren,
  
  getAllData
};