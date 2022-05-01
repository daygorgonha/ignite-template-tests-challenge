import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { OperationType } from "@modules/statements/entities/Statement";

let connection: Connection;

describe("[Statement] - Create statement user controller", () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userId = uuid();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        values('${userId}', 'exempleuser', 'user@exemple.com.br', '${password}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to deposit a value for the user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "deposit test"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to withdraw a value from the user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    });

    const { token } = responseToken.body;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "deposit test"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 50,
      description: "withdraw test"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual(OperationType.WITHDRAW);
  });

  it("should not be able to withdraw an amount without sufficient balance", async () => {
    await request(app).post("/api/v1/users").send({
        name: "userexample2",
        email: "user2@exemple.com.br",
        password: "1234"
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user2@exemple.com.br",
      password: "1234"
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 150,
      description: "withdraw test"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Insufficient funds" })
  });

  it("should not be able to create statement with invalid token", async () => {
    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .set({
      Authorization: `Bearer Incorrect Token`
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "JWT invalid token!" })
  });
});
