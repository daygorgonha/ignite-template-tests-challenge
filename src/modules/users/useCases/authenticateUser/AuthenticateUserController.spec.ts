import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        values('${id}', 'exempleuser', 'user@exemple.com.br', '${password}', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate the registered user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate the user not registered or with invalid password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "Incorrect User",
      password: "Incorrect Password"
    });
    expect(response.status).toBe(401);
  });
});
