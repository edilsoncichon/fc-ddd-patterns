import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const order = await createOrder("123");

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: order.items[0].id,
          name: order.items[0].name,
          price: order.items[0].price,
          quantity: order.items[0].quantity,
          order_id: order.id,
          product_id: order.items[0].productId,
        },
      ],
    });
  });

  it("should update a order", async () => {
    const order = await createOrder("123");

    const orderRepository = new OrderRepository();
    const customerRepository = new CustomerRepository();
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const newCustomer = new Customer("321", "New Customer");
    newCustomer.changeAddress(address)
    await customerRepository.create(newCustomer);
    order.changeCustomerId(newCustomer.id)
    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: newCustomer.id,
      total: order.total(),
      items: [
        {
          id: order.items[0].id,
          name: order.items[0].name,
          price: order.items[0].price,
          quantity: order.items[0].quantity,
          order_id: order.id,
          product_id: order.items[0].productId,
        },
      ],
    });
  });

  it("should find a order", async () => {
    const orderRepository = new OrderRepository();

    const order = await createOrder("123");

    const orderResult = await orderRepository.find(order.id);

    expect(order).toStrictEqual(orderResult);
  });

  it("should throw an error when order is not found", async () => {
    const repository = new OrderRepository();

    expect(async () => {
      await repository.find("456ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const order1 = await createOrder("123");
    const order2 = await createOrder("124");

    const orders = await new OrderRepository().findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });
});

async function createOrder(orderId: string) {
  const customerRepository = new CustomerRepository();
  const customer = new Customer(`${orderId}_123`, "Customer 1");
  const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
  customer.changeAddress(address);
  await customerRepository.create(customer);
  const productRepository = new ProductRepository();
  const product = new Product(`${orderId}_123`, "Product 1", 10);
  await productRepository.create(product);
  const orderItem = new OrderItem(`${orderId}_1`, product.name, product.price, product.id, 2);
  const order = new Order(orderId, customer.id, [orderItem]);
  const orderRepository = new OrderRepository();
  await orderRepository.create(order);
  return order;
}
