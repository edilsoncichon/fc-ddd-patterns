import { AgreggateRoot } from "../../@shared/domain/aggregate-root";
import Address from "../value-object/address";
import { CustomerCreated } from "../event/customer-created.event";
import { CustomerNameChanged } from "../event/customer-name-changed.event";
import {CustomerAddressChanged} from "../event/customer-address.changed";

export default class Customer extends AgreggateRoot {
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;

  constructor(id: string, name: string) {
    super()
    this._id = id;
    this._name = name;
    this.validate();
  }

  static create(id: string, name: string, address: Address): Customer {
    const customer = new Customer(id, name);
    customer.Address = address;
    customer.addEvent(new CustomerCreated(id, {name, address}));

    return customer
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
    this.addEvent(new CustomerNameChanged(this.id, {name}));
  }

  get Address(): Address {
    return this._address;
  }

  changeAddress(address: Address) {
    this._address = address;
    this.addEvent(new CustomerAddressChanged(this.id, {name: this._name, address}));
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }
}
