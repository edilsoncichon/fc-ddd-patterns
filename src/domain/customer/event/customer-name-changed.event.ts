import EventInterface from "../../@shared/event/event.interface";

export class CustomerNameChanged implements EventInterface {
  aggregateId: string;
  dataTimeOccurred: Date;
  data: any;

  constructor(aggregateId: string, data: any) {
    this.data = data;
    this.aggregateId = aggregateId;
    this.dataTimeOccurred = new Date();
  }
}
