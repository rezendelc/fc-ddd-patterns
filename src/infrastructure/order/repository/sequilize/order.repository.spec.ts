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
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItemA = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItemA]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const productB = new Product("321", "Product 2", 50);
    await productRepository.create(productB);

    const orderItemB = new OrderItem(
      "2",
      productB.name,
      productB.price,
      productB.id,
      1
    );

    const updatedOrder = new Order(order.id, order.customerId, [orderItemA, orderItemB])

    await orderRepository.update(updatedOrder)

    const newOrderModel = await OrderModel.findOne({
      where: { id: updatedOrder.id },
      include: ["items"],
    });

    expect(newOrderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: updatedOrder.total(),
      items: [
        {
          id: orderItemA.id,
          name: orderItemA.name,
          price: orderItemA.price,
          quantity: orderItemA.quantity,
          order_id: "123",
          product_id: "123",
        },
        {
          id: orderItemB.id,
          name: orderItemB.name,
          price: orderItemB.price,
          quantity: orderItemB.quantity,
          order_id: "123",
          product_id: "321",
        },
      ],
    });
  })

  it("should find one order from id", async() => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderResult = await orderRepository.find(order.id);

    expect(orderResult).toStrictEqual(order);
  })

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("456ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async() => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const productA = new Product("123", "Product A", 10);
    await productRepository.create(productA);

    const productB = new Product("321", "Product B", 30);
    await productRepository.create(productB);

    const orderItemA = new OrderItem(
      "1",
      productA.name,
      productA.price,
      productA.id,
      2
    );

    const orderItemB = new OrderItem(
      "2",
      productB.name,
      productB.price,
      productB.id,
      2
    );

    const orderA = new Order("123", "123", [orderItemA]);
    const orderB = new Order("456", "123", [orderItemB]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(orderA);
    await orderRepository.create(orderB);

    const orderResult = await orderRepository.findAll();

    expect(orderResult).toHaveLength(2);
    expect(orderResult).toContainEqual(orderA);
    expect(orderResult).toContainEqual(orderB);
  });
});
