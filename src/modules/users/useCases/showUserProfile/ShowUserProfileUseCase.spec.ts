import request from "supertest";
import { app } from "../../../../app";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";


let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to list user information", async () => {
    const user = {
      name: "User exemple",
      email: "user@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    await expect(
      showUserProfileUseCase.execute(response.id)
    ).resolves.toHaveProperty("id");
  });

  it("should not be able to list uncreated user information", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    await expect(
      showUserProfileUseCase.execute("incorrectId")
    ).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });
});
