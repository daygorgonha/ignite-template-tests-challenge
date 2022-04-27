import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("User Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to return the user's current balance", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple",
      email: "user@exemple.com",
      password: "1234",
    };
    const response = await createUserUseCase.execute(user);

    await expect(
      getBalanceUseCase.execute({ user_id: response.id})
    ).resolves.toEqual({ balance: 0, statement: [] });
  });

  it("should not be able to list uncreated user balance information", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    await expect(
      getBalanceUseCase.execute({ user_id: "incorrectId"})
    ).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });
});
