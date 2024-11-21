import {AgreggateRoot} from "../domain/aggregate-root"
import EventDispatcher from "../event/event-dispatcher";

export class Mediator {

  eventDispatcher: EventDispatcher;

  constructor() {
    this.eventDispatcher = new EventDispatcher();
  }

  register(eventName: string, handler: any) {
    this.eventDispatcher.register(eventName, handler);
  }

  async publish(aggregate: AgreggateRoot) {
    const events = aggregate.events
    for (const event of events) {
      this.eventDispatcher.notify(event);
    }
    aggregate.clearEvents();
  }
}
