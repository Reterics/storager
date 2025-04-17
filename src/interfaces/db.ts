export type DBType = 'firebase' | 'sql';

export interface DBManagerOptions {
  db: DBType;
}
