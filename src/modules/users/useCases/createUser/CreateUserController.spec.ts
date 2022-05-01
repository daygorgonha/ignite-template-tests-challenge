import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user controller", () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "userexemple",
      email: "exemple@exemple.com",
      password: "1234"
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a user with already registered email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "userexemple2",
      email: "exemple2@exemple.com",
      password: "1234"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "userexemple2",
      email: "exemple2@exemple.com",
      password: "1234"
    });

    expect(response.status).toBe(400);
  });
});
