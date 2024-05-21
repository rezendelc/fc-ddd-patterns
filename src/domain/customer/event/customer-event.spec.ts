import EventDispatcher from '../../@shared/event/event-dispatcher';
import Customer from '../entity/customer';
import Address from '../value-object/address';
import CustomerChangedAddressEvent from './customer-changed-address.event';
import CustomerCreatedEvent from './customer-created.event';
import SendConsoleLogWhenCustomerChangedAddressHandler from './handler/send-console-log-when-customer-changed-address.handler';
import SendFirstConsoleLogWhenCustomerIsCreatedHandler from './handler/send-first-console-log-when-customer-is-created.handler';
import SendSecondConsoleLogWhenCustomerIsCreatedHandler from './handler/send-second-console-log-when-customer-is-created.handler';

describe("Customer domain events tests", () => {
  it("should register all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerA = new SendFirstConsoleLogWhenCustomerIsCreatedHandler();
    const eventHandlerB = new SendSecondConsoleLogWhenCustomerIsCreatedHandler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerA);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerB);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(
      2
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerA);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerB);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerA = new SendFirstConsoleLogWhenCustomerIsCreatedHandler();
    const eventHandlerB = new SendSecondConsoleLogWhenCustomerIsCreatedHandler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerA);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerB);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerA);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerB);

    eventDispatcher.unregister("CustomerCreatedEvent", eventHandlerA);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(
      1
    );
    
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerB);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerA = new SendFirstConsoleLogWhenCustomerIsCreatedHandler();
    const eventHandlerB = new SendSecondConsoleLogWhenCustomerIsCreatedHandler();
    
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerA);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerB);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerA);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerB);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify when customer is created events handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerA = new SendFirstConsoleLogWhenCustomerIsCreatedHandler();
    const eventHandlerB = new SendSecondConsoleLogWhenCustomerIsCreatedHandler();
    const spyEventHandlerA = jest.spyOn(eventHandlerA, "handle");
    const spyEventHandlerB = jest.spyOn(eventHandlerB, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerA);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerB);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerA);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerB);

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: '4321ABCD',
      name: "Customer 1",
    });

    // Quando o notify for executado o SendEmailWhenCustomerIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandlerA).toHaveBeenCalled();
    expect(spyEventHandlerB).toHaveBeenCalled();
  });

  it("should notify when customer change address event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendConsoleLogWhenCustomerChangedAddressHandler();
    
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerChangedAddressEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedAddressEvent"][0]
    ).toMatchObject(eventHandler);

    const customerNewAddress = new Address('Rua 1', 2, 'ZipCode 3', 'Cidade 4')

    const customer = new Customer(
      '4321ABCD',
      "Customer 1",
    );

    customer.Address = customerNewAddress

    const customerChangedAddressEvent = new CustomerChangedAddressEvent(customer)

    // Quando o notify for executado o SendEmailWhenCustomerIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(customerChangedAddressEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  })
});
