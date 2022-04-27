import auth from "@config/auth";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple",
      email: "user@exemple.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    auth.jwt.secret = user.password;

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    await expect (
      authenticateUserUseCase.execute({
        email: "falsetest@exemple.com",
        password: "1234",
      })
    ).rejects.toEqual({ message: "Incorrect email or password", statusCode: 401 });
  });

  it("should not be able to autheticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      })
    ).rejects.toEqual({ message: "Incorrect email or password", statusCode: 401 });
  });
});
