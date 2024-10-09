import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{model: OrderItemModel}],
      }
    );
  }

  async update(entity: Order): Promise<void> {

    const sequelize = OrderModel.sequelize;
    await sequelize.transaction(async (t) => {
      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      });
      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }));
      await OrderItemModel.bulkCreate(items, { transaction: t });
      await OrderModel.update(
        {
          id: entity.id,
          customer_id: entity.customerId,
          total: entity.total()
        },
        { where: { id: entity.id }, transaction: t }
      );
    });
  }

  async find(id: string): Promise<Order> {
    let model;
    try {
      model = await OrderModel.findOne({
        where: { id },
        include: ["customer", "items"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const customer = new Customer(model.customer.id, model.customer.name);
    const address = new Address(
      model.customer.street,
      model.customer.number,
      model.customer.zipcode,
      model.customer.city
    );
    customer.changeAddress(address);
    const items = model.items.map((item) => {
      const product = new Product(item.product_id, item.name, item.price);
      return new OrderItem(item.id, product.name, product.price, product.id, item.quantity);
    });
    return new Order(model.id, model.customer_id, items);
  }

  async findAll(): Promise<Order[]> {
    const models = await OrderModel.findAll({ include: ["customer", "items"] });

    return models.map((model) => {
      const customer = new Customer(model.customer.id, model.customer.name);
      const address = new Address(
        model.customer.street,
        model.customer.number,
        model.customer.zipcode,
        model.customer.city
      );
      customer.changeAddress(address);
      const items = model.items.map((item) => {
        const product = new Product(item.product_id, item.name, item.price);
        return new OrderItem(item.id, product.name, product.price, product.id, item.quantity);
      });

      return new Order(model.id, model.customer_id, items);
    });
  }
}
