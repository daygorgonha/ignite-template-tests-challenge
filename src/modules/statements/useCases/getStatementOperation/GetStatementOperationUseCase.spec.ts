import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("detail user operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to return a specific operation", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple",
      email: "user@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: response.id,
        statement_id: statement.id
      })
    ).resolves.toHaveProperty("id");
  });

  it("should not be able to return operation information from uncreated user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: "incorrectId",
        statement_id: statement.id
      })
    ).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });

  it("should not be able to return uncreated operation information", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 3",
      email: "user3@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: response.id,
        statement_id: "incorrectId"
      })
    ).rejects.toEqual({ message: "Statement not found", statusCode: 404 });
  });
});
