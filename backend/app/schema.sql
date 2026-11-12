PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    kind TEXT,
    name_ru TEXT,
    name_kk TEXT,
    name_en TEXT,
    address_ru TEXT,
    address_kk TEXT,
    address_en TEXT,
    phones TEXT,
    email TEXT,
    hours_ru TEXT,
    hours_kk TEXT,
    hours_en TEXT,
    lat REAL,
    lon REAL,
    coords_verified INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    head TEXT,
    note TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fonds (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('org','personal','collection','print')),
    title_ru TEXT,
    title_kk TEXT,
    title_en TEXT,
    years_from INTEGER,
    years_to INTEGER,
    extent TEXT,
    description_ru TEXT,
    description_kk TEXT,
    branch_id INTEGER REFERENCES branches(id),
    source TEXT,
    is_demo INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventories (
    id INTEGER PRIMARY KEY,
    fond_id INTEGER NOT NULL REFERENCES fonds(id),
    number TEXT,
    title_ru TEXT,
    title_kk TEXT,
    title_en TEXT,
    years_from INTEGER,
    years_to INTEGER,
    units_count INTEGER,
    UNIQUE (fond_id, number)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    branch_id INTEGER NULL REFERENCES branches(id),
    display_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY,
    fond_id INTEGER NOT NULL REFERENCES fonds(id),
    inventory_id INTEGER NULL REFERENCES inventories(id),
    level TEXT NOT NULL CHECK (level IN ('fond','opis','delo','doc')),
    code TEXT UNIQUE NOT NULL,
    number TEXT,
    title_ru TEXT,
    title_kk TEXT,
    title_en TEXT,
    years_from INTEGER,
    years_to INTEGER,
    doc_type TEXT,
    place TEXT,
    theme TEXT,
    author TEXT,
    keywords TEXT,
    lang TEXT,
    extent TEXT,
    branch_id INTEGER REFERENCES branches(id),
    pub_status TEXT NOT NULL DEFAULT 'draft' CHECK (pub_status IN ('draft','review','needs_work','approved','published','archived')),
    access_note TEXT,
    description_ru TEXT,
    description_kk TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    status_changed_at TEXT,
    status_changed_by INTEGER REFERENCES users(id),
    is_demo INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS unit_versions (
    id INTEGER PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id),
    version INTEGER,
    data_json TEXT,
    author_id INTEGER REFERENCES users(id),
    reviewer_id INTEGER REFERENCES users(id),
    pub_status TEXT,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id),
    filename TEXT,
    mime TEXT,
    size INTEGER,
    sha256 TEXT,
    kind TEXT NOT NULL DEFAULT 'view' CHECK (kind IN ('master','view')),
    source_file_id INTEGER REFERENCES files(id),
    access TEXT NOT NULL DEFAULT 'needs_check' CHECK (access IN ('public','no_publish','needs_check')),
    origin TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY,
    date TEXT,
    title_ru TEXT,
    title_kk TEXT,
    lead_ru TEXT,
    lead_kk TEXT,
    html_ru TEXT,
    html_kk TEXT,
    image TEXT,
    pub_status TEXT NOT NULL DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS content_blocks (
    key TEXT NOT NULL,
    lang TEXT NOT NULL CHECK (lang IN ('ru', 'kk', 'en')),
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    updated_by TEXT,
    updated_at TEXT,
    PRIMARY KEY (key, lang)
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen_at TEXT,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS login_attempts (
    username TEXT NOT NULL,
    ip TEXT,
    ts TEXT NOT NULL DEFAULT (datetime('now')),
    ok INTEGER NOT NULL DEFAULT 0
);
-- счётчик неудач по IP за окно(SEC-05)
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_ts ON login_attempts(ip, ts);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY,
    ts TEXT NOT NULL DEFAULT (datetime('now')),
    user_id INTEGER NULL REFERENCES users(id),
    username TEXT,
    ip TEXT,
    action TEXT,
    object_type TEXT,
    object_id TEXT,
    result TEXT NOT NULL DEFAULT 'ok' CHECK (result IN ('ok','denied','error')),
    details_json TEXT
);

CREATE TABLE IF NOT EXISTS import_jobs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename TEXT,
    mapping_json TEXT,
    rows_total INTEGER,
    rows_ok INTEGER,
    errors_json TEXT,
    status TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview','applied')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS catalog_fts USING fts5(
    unit_id UNINDEXED,
    title,
    code,
    keywords,
    author,
    place,
    tokenize = 'unicode61 remove_diacritics 2'
);

CREATE INDEX IF NOT EXISTS idx_units_pub_status ON units(pub_status);
CREATE INDEX IF NOT EXISTS idx_units_fond_id ON units(fond_id);
CREATE INDEX IF NOT EXISTS idx_files_unit_id ON files(unit_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON audit_log(ts);

CREATE TABLE IF NOT EXISTS role_permissions (
    role TEXT NOT NULL,
    permission TEXT NOT NULL,
    PRIMARY KEY (role, permission)
);
