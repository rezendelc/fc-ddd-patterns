import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
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

  async find(id: string): Promise<OrderModel> {
    const order = await OrderModel.findByPk(id, {
      include: ["items"],
    })

    if (order === null) {
      throw new Error('Order not found.')
    }

    return order
  }

  async findAll(): Promise<OrderModel[]> {
    const order = await OrderModel.findAll({
      include: ["items"],
    })

    console.log(order)
    return order
  }
}