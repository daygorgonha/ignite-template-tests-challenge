import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { OperationType } from "@modules/statements/entities/Statement";

let connection: Connection;

describe("[Statement] - Statement information operation controller", () => {
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

  it("should be able to return user operation description", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    });

    const { token } = responseToken.body;

    const { body: {id} } = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "deposit test"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to return the description of the operation with an invalid token", async () => {
    const response = await request(app)
    .get("/api/v1/statements/8e90c618-c9a0-4d9c-95af-337ef1ec9fcc")
    .set({
      Authorization: `Bearer Incorrect Token`
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "JWT invalid token!" })
  });
});
