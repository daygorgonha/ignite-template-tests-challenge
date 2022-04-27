import { isTransformDescriptor } from "tsyringe/dist/typings/providers/injection-token";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
     name: "User exemple",
     email: "user@exemple.com",
     password: "1234",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const userCreated = await inMemoryUsersRepository.findByEmail(
      user.email,
    );

    expect(userCreated).toHaveProperty("id")
  });

  it("should not be able to create a new user with email exists", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await expect(
      createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      })
    ).rejects.toEqual({ message: "User already exists", statusCode: 400 });

  })
});
