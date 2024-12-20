import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import CustomerRepositoryInterface from "../../../../domain/customer/repository/customer-repository.interface";
import CustomerModel from "./customer.model";
import {TransactionInterface} from "../../../../domain/@shared/domain/transaction.interface";

export default class CustomerRepository implements CustomerRepositoryInterface {

  private transaction: TransactionInterface

  public setTransaction(transaction: TransactionInterface): void {
    this.transaction = transaction;
  }

  async create(entity: Customer): Promise<void> {
    await CustomerModel.create({
      id: entity.id,
      name: entity.name,
      street: entity.Address.street,
      number: entity.Address.number,
      zipcode: entity.Address.zip,
      city: entity.Address.city,
      active: entity.isActive(),
      rewardPoints: entity.rewardPoints,
    },
      {
        transaction: this.transaction.getTransaction()
      }
    );
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      {
        where: {
          id: entity.id,
        },
        transaction: this.transaction.getTransaction()
      }
    );
  }

  async find(id: string): Promise<Customer> {
    let customerModel;
    try {
      customerModel = await CustomerModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
        transaction: this.transaction.getTransaction()
      });
    } catch (error) {
      throw new Error("Customer not found");
    }

    const customer = new Customer(id, customerModel.name);
    customer.Address = new Address(
      customerModel.street,
      customerModel.number,
      customerModel.zipcode,
      customerModel.city
    );
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    const customerModels = await CustomerModel.findAll({
      transaction: this.transaction.getTransaction()
    });

    return customerModels.map((model) => {
      const customer = new Customer(model.id, model.name);
      customer.addRewardPoints(model.rewardPoints);
      customer.Address = new Address(model.street, model.number, model.zipcode, model.city);
      if (model.active) {
        customer.activate();
      }
      return customer;
    });
  }
}
