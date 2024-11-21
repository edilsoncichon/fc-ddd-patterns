import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import {CustomerAddressChanged} from "../customer-address.changed";

export default class LogAfterCustomerAddressChangeHandler
  implements EventHandlerInterface<CustomerAddressChanged>
{
  handle(event: CustomerAddressChanged): void {
    console.log(`Endereço do cliente: ${event.aggregateId}, ${event.data.name} alterado para: ${event.data.address}`);
  }
}
