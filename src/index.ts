import { JoinTable, Columns, WhereCondition } from "./interfaces";

export default class Builder {
  rawSql: string = "";
  operators: string[] = ["<", ">", ">=", "<=", "!=", "="];
  columns: Columns[] = [];
  fromTable: string;
  whereCondition: WhereCondition[] = [];
  joinTables: JoinTable[] = [];
  limitNumber: number;
  orderbyColumns: string[];
  offsetNumber: number;
  isOrderByDESC: boolean = true;

  public select(columns: Columns[]) {
    this.columns.push(...columns);
    this.rawSql = "SELECT ";
    return this;
  }

  public from(table: string) {
    this.fromTable = table;
    return this;
  }

  public where(condition: WhereCondition) {
    if (this.operators.includes(condition.operator)) {
      this.whereCondition.push(condition);
      return this;
    }
    throw new Error("operator should be >, <, >=, <=, !=, =");
  }

  public limit(number: number) {
    this.limitNumber = number;
    return this;
  }

  public orderBy(columns: string[], isDESC: boolean = false) {
    this.isOrderByDESC = isDESC;
    this.orderbyColumns = columns;
    return this;
  }

  public offset(number: number) {
    this.offsetNumber = number;
    return this;
  }

  public join(tablesJoin: JoinTable) {
    this.joinTables.push(tablesJoin);
    this.columns.push(...tablesJoin.columns);
    return this;
  }

  public compileJoinCondition() {
    const isHasJoinOperator = this.joinTables.length !== 0;
    if (isHasJoinOperator) {
      this.rawSql += this.joinTables
        .map(({ type, name, onCondition }) => {
          let joinOperator = "";
          if (type === "left") {
            joinOperator += "LEFT JOIN";
          }

          if (type === "right") {
            joinOperator += "RIGHT JOIN";
          }

          if (type === "inner") {
            joinOperator += "INNER JOIN";
          }
          const listAndCondition = onCondition
            .filter(({ isOr }) => isOr === false)
            .map(({ column, operator, value }) => {
              return `${column} ${operator} ${value} `;
            })
            .join("AND ");
          const listOrCondition = onCondition
            .filter(({ isOr }) => isOr === true)
            .map(({ column, operator, value }) => {
              return `${column} ${operator} ${value} `;
            })
            .join("OR ");
          return `${joinOperator} ${name} ON ( ${listAndCondition} ${listOrCondition}) \n`;
        })
        .reduce((previous, current) => previous + current, "");
    }
    return;
  }

  public compileLimit() {
    const isHasLimitOperator = this.limitNumber !== undefined;
    if (isHasLimitOperator) {
      this.rawSql += `\nLIMIT ${this.limitNumber} `;
    }
  }

  public compileOrderBy() {
    this.rawSql += `\nORDER BY ${this.orderbyColumns.join(", ")}`;
    if (this.isOrderByDESC) {
      this.rawSql += " DESC";
    }
  }

  public compileOffset() {
    const isHasOffsetOperator = this.offsetNumber !== undefined;
    if (isHasOffsetOperator) {
      this.rawSql += `\nOFFSET ${this.offsetNumber}`;
    }
  }

  public compileSelect() {
    this.rawSql += this.columns
      .map(({ name, alias }) => {
        return `\n ${name} AS ${alias} `;
      })
      .join(",");
  }

  public compileFromTable() {
    this.rawSql += `FROM ${this.fromTable} \n`;
  }

  public compileWhereCondition() {
    const listAndCondition = this.whereCondition
      .filter(({ isOr }) => isOr === false)
      .map(({ column, operator, value }) => {
        return `(${column} ${operator} ${value}) `;
      })
      .join("AND ");
    const listOrCondition = this.whereCondition
      .filter(({ isOr }) => isOr === true)
      .map(({ column, operator, value }) => {
        return `(${column} ${operator} ${value}) `;
      })
      .join("OR ");
    this.rawSql += "WHERE ";
    this.rawSql += `${listAndCondition}`;

    const isHasOrCondtions = listOrCondition.length !== 0;
    if (isHasOrCondtions) {
      this.rawSql += " OR ";
      this.rawSql += `${listOrCondition}`;
    }
  }

  public compile() {
    this.compileSelect();
    this.compileFromTable();
    this.compileJoinCondition();
    this.compileWhereCondition();
    this.compileLimit();
    this.compileOffset();
    this.compileOrderBy();
    this.rawSql += ";";
    return this.rawSql;
  }
}
