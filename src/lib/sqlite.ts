// Lightweight SQLite (sql.js) wrapper persisting DB bytes in localStorage
// Works offline and with file:// when sql-wasm.js is loaded from CDN in index.html

const DB_KEY = 'cafe_sqlite_db_bytes_v1';

let SQL: any = null;
let db: any = null;

const ensureSqlLoaded = async (): Promise<any> => {
  if (SQL) return SQL;
  // @ts-ignore global from script tag
  const initSqlJs = (window as any).initSqlJs;
  if (!initSqlJs) throw new Error('sql.js not loaded');
  SQL = await initSqlJs({ locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
  return SQL;
};

export const openDatabase = async () => {
  await ensureSqlLoaded();
  if (db) return db;
  const bytesBase64 = localStorage.getItem(DB_KEY);
  if (bytesBase64) {
    const bytes = Uint8Array.from(atob(bytesBase64), c => c.charCodeAt(0));
    db = new SQL.Database(bytes);
  } else {
    db = new SQL.Database();
    bootstrapSchema();
    persist();
  }
  return db;
};

export const persist = () => {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(data)));
  localStorage.setItem(DB_KEY, base64);
};

const bootstrapSchema = () => {
  db.run(`
    PRAGMA journal_mode = OFF;
    PRAGMA synchronous = OFF;
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      nom TEXT,
      prenom TEXT,
      poste TEXT,
      salaireParJour REAL,
      salaireTotal REAL,
      joursTravailles INTEGER,
      soldeMaladie REAL,
      avance REAL,
      absences INTEGER,
      deleted INTEGER DEFAULT 0,
      deletedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS presences (
      employeeId TEXT,
      date TEXT,
      status TEXT,
      PRIMARY KEY (employeeId, date)
    );
    CREATE TABLE IF NOT EXISTS achats (
      id TEXT PRIMARY KEY,
      date TEXT,
      article TEXT,
      quantite REAL,
      montant REAL
    );
    CREATE TABLE IF NOT EXISTS stock (
      id TEXT PRIMARY KEY,
      nom TEXT,
      quantite REAL,
      unite TEXT,
      dateAjout TEXT
    );
    CREATE TABLE IF NOT EXISTS maintenances (
      id TEXT PRIMARY KEY,
      date TEXT,
      service TEXT,
      temps TEXT,
      description TEXT,
      montant REAL
    );
    CREATE TABLE IF NOT EXISTS recettes (
      id TEXT PRIMARY KEY,
      date TEXT,
      items TEXT,
      total REAL
    );
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      nom TEXT,
      consommationStock TEXT
    );
    CREATE TABLE IF NOT EXISTS monthly_archives (
      id TEXT PRIMARY KEY,
      month TEXT,
      employees TEXT,
      expenses TEXT,
      revenues TEXT,
      archivedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
};

// Employees API
export const sqlGetEmployees = async () => {
  await openDatabase();
  const res = db.exec(`SELECT * FROM employees WHERE deleted = 0`);
  const rows = res[0]?.values || [];
  const employees = rows.map((r: any[]) => ({
    id: r[0], nom: r[1], prenom: r[2], poste: r[3], salaireParJour: r[4], salaireTotal: r[5],
    joursTravailles: r[6], soldeMaladie: r[7], avance: r[8], absences: r[9], presences: [] as any[]
  }));
  // attach presences
  employees.forEach((e: any) => {
    const pres = db.exec(`SELECT date, status FROM presences WHERE employeeId = '${e.id}'`)[0]?.values || [];
    e.presences = pres.map((p: any[]) => ({ date: p[0], status: p[1] }));
  });
  return employees;
};

export const sqlSaveEmployees = async (employees: any[]) => {
  await openDatabase();
  db.run('BEGIN');
  db.run('DELETE FROM employees');
  db.run('DELETE FROM presences');
  const empStmt = db.prepare(`INSERT INTO employees (id, nom, prenom, poste, salaireParJour, salaireTotal, joursTravailles, soldeMaladie, avance, absences, deleted, deletedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const presStmt = db.prepare(`INSERT INTO presences (employeeId, date, status) VALUES (?,?,?)`);
  for (const e of employees) {
    empStmt.run([e.id, e.nom, e.prenom, e.poste, e.salaireParJour ?? 0, e.salaireTotal ?? null, e.joursTravailles ?? 0, e.soldeMaladie ?? 0, e.avance ?? 0, e.absences ?? 0, e.deleted ? 1 : 0, e.deletedAt ?? null]);
    if (Array.isArray(e.presences)) {
      for (const p of e.presences) presStmt.run([e.id, p.date, p.status]);
    }
  }
  empStmt.free();
  presStmt.free();
  db.run('COMMIT');
  persist();
};


