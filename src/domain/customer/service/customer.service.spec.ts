import {CustomerService} from "./customer.service";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import {TransactionSequelize} from "../../../infrastructure/transaction-sequelize";
import {Sequelize} from "sequelize-typescript";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import {Mediator} from "../../@shared/service/mediator";
import Address from "../value-object/address";
import LogAfterCustomerCreatedOneHandler from "../event/handler/log-after-customer-created-one.handler";
import {CustomerCreated} from "../event/customer-created.event";
import LogAfterCustomerCreatedTwoHandler from "../event/handler/log-after-customer-created-two.handler";
import LogAfterCustomerAddressChangeHandler from "../event/handler/log-after-customer-address-change.handler";
import {CustomerAddressChanged} from "../event/customer-address.changed";

describe("Customer service unit tests", () => {
  let sequelize: Sequelize;
  let transaction: TransactionSequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();

    transaction = new TransactionSequelize(null, sequelize);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("deveria executar todos os handlers", async () => {
    const repo = new CustomerRepository();
    const mediator = new Mediator();
    const handler1 = new LogAfterCustomerCreatedOneHandler();
    const handler2 = new LogAfterCustomerCreatedTwoHandler();
    const handler3 = new LogAfterCustomerAddressChangeHandler();
    const spy1 = jest.spyOn(handler1, "handle");
    const spy2 = jest.spyOn(handler2, "handle");
    const spy3 = jest.spyOn(handler3, "handle");

    mediator.register(CustomerCreated.name, handler1)
    mediator.register(CustomerCreated.name, handler2)
    mediator.register(CustomerAddressChanged.name, handler3);

    const service = new CustomerService(repo, mediator, transaction);
    const address = new Address("Street 1", 123, "13330-250", "Califórnia");
    const customer = await service.create("Edilson Cichon", address);
    const newAddress = new Address("Street Colatina", 123, "29705-250", "ES");
    await service.changeAddress(customer, newAddress);

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });
});
