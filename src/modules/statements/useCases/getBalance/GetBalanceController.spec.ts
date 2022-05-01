import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { OperationType } from "@modules/statements/entities/Statement";

let connection: Connection;

describe("[Statement] - Balance user controller", () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userId = uuid();
    const statementId = uuid();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        values('${userId}', 'exempleuser', 'user@exemple.com.br', '${password}', 'now()')`
    );

    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at)
        values('${statementId}', '${userId}', 'deposit', '100','${OperationType.DEPOSIT}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return transaction histories", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    });

    const { token } = responseToken.body;

    const { status, body: { statement } } = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    })

    expect(status).toBe(200);
    expect(statement.length).toBe(1);
    expect(statement[0]).toHaveProperty("id");
    expect(statement[0].type).toEqual(OperationType.DEPOSIT);
  });

  it("should not be able to return user statement with invalid token", async () => {
    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer Incorrect Token`
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "JWT invalid token!" })
  });
});
