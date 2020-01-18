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

  public orderBy(columns: string[], isASC: boolean = true) {
    this.orderbyColumns = columns;
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
          const { column, operator, value } = onCondition;
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
          return `${joinOperator} ${name} ON ${column} ${operator} ${value} \n`;
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
        return `${column} ${operator} ${value} `;
      })
      .join("AND ");
    const listOrCondition = this.whereCondition
      .filter(({ isOr }) => isOr === true)
      .map(({ column, operator, value }) => {
        return `${column} ${operator} ${value} `;
      })
      .join("OR ");
    this.rawSql += "WHERE ";
    this.rawSql += listAndCondition;
    this.rawSql += "OR ";
    this.rawSql += listOrCondition;
  }

  public compileOrderBy() {
    this.rawSql += this.orderbyColumns.join(", ");
  }

  public compile() {
    this.compileSelect();
    this.compileFromTable();
    this.compileJoinCondition();
    this.compileWhereCondition();
    this.compileLimit();
    this.compileOffset();
    this.compileOrderBy();
    return this.rawSql;
  }
}

const a = new Builder();
console.log(
  a
    .select([{ name: "a", alias: "users_a" }])
    .from("users")
    .where({ column: "staffs.id", operator: "=", value: "1", isOr: false })
    .where({ column: "user.id", operator: "!=", value: "2", isOr: false })
    .where({ column: "user.id", operator: "!=", value: "2", isOr: true })
    .where({ column: "user.id", operator: "!=", value: "2", isOr: true })
    .join({
      name: "staffs",
      type: "inner",
      columns: [{ name: "id", alias: "staff_id" }],
      onCondition: { column: "staffs.id", operator: "<", value: "1" }
    })
    .limit(10)
    .offset(10)
    .compile()
);
