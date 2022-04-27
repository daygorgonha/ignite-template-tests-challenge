import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Input and output the user input", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to deposit a value in the user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple",
      email: "user@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    await expect(
      createStatementUseCase.execute(statement)
    ).resolves.toHaveProperty("id");

  });

  it("should be able to deposit to withdraw a value from the user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 2",
      email: "user2@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const statementDeposit: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test 2",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw: ICreateStatementDTO = {
      user_id: response.id,
      description: "output test",
      amount: 25,
      type: OperationType.WITHDRAW,
    };

    await expect(
      createStatementUseCase.execute(statementWithdraw)
    ).resolves.toHaveProperty("id");
  });

  it("should not be able to deposit balance from an uncreated user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 3",
      email: "user3@exemple.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      user_id: "incorrectId",
      description: "input test 3",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });

  it("should not be able to withdraw balance from an uncreated user", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 4",
      email: "user4@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const statementDeposit: ICreateStatementDTO = {
      user_id: response.id,
      description: "input test 4",
      amount: 50,
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw: ICreateStatementDTO = {
      user_id: "incorrectId",
      description: "output test",
      amount: 25,
      type: OperationType.WITHDRAW,
    };

    await expect(
      createStatementUseCase.execute(statementWithdraw)
    ).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });

  it("should not be possible to withdraw an amount from the user without sufficient balance", async () => {
    const user: ICreateUserDTO = {
      name: "User exemple 5",
      email: "user5@exemple.com",
      password: "1234",
    };

    const response = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      user_id: response.id,
      description: "output test",
      amount: 25,
      type: OperationType.WITHDRAW,
    };

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toEqual({ message: "Insufficient funds", statusCode: 400 });
  });
});
