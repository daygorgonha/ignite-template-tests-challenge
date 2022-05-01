import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("User profile controller", () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        values('${id}', 'exempleuser', 'user@exemple.com.br', '${password}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return user information", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@exemple.com.br",
      password: "1234"
    })

    const { token } = responseToken.body;

    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to return user information with invalid token", async () => {
    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer Incorrect Token`
    });

    expect(response.status).toBe(401);
  });
});


