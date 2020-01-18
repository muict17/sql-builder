export interface JoinCondition {
  column: string;
  operator: string;
  value: string;
  isOr: boolean;
}

export interface JoinTable {
  name: string;
  type: string;
  onCondition: JoinCondition[];
  columns: Columns[];
}

export interface Columns {
  name: string;
  alias: string;
}

export interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  isOr: boolean;
}
