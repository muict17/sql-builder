import Builder from "./";
const builder = new Builder();
console.log(
  builder
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
      onCondition: [
        { column: "staffs.id", operator: "<", value: "1", isOr: false }
      ]
    })
    .join({
      name: "customers",
      type: "left",
      columns: [{ name: "id", alias: "customers_id" }],
      onCondition: [
        {
          column: "customers.id",
          operator: "=",
          value: "staffs.id",
          isOr: false
        },
        {
          column: "role.id",
          operator: "=",
          value: "customers.role_id",
          isOr: false
        }
      ]
    })
    .limit(10)
    .offset(10)
    .orderBy(["staffs.id, users.id"], false)
    .compile()
);
