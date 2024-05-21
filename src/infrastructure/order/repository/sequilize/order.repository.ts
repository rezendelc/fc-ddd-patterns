import Order from "../../../../domain/checkout/entity/order";
import OrderItem from '../../../../domain/checkout/entity/order_item';
import OrderRepositoryInterface from '../../../../domain/checkout/repository/order-repository.interface';
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

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
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    // Atualizar o pedido principal
    await OrderModel.update(
      {
        total: entity.total(),
      },
      {
        where: { id: entity.id },
      }
    );
  
    // Remover todos os itens antigos do pedido
    await OrderItemModel.destroy({
      where: { order_id: entity.id },
    });
  
    // Atualiza os novos itens do pedido
    await OrderItemModel.bulkCreate(
      entity.items.map((item) => ({
        order_id: entity.id,
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findByPk(id, {
        include: ["items"],
        rejectOnEmpty: true
      })
    } catch (error) {
      throw new Error("Order not found");
    }

    const order = new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map(item => new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      ))
    )

    return order
  }

  async findAll(): Promise<Order[]> {
    const orderModel = await OrderModel.findAll({
      include: ["items"],
    })

    const order = orderModel.map(order => {
      return new Order(
        order.id,
        order.customer_id,
        order.items.map(item => new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        ))
      )
    })

    return order
  }
}