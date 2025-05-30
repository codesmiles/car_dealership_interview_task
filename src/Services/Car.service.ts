import { CrudOperationsEnum } from "../Utils";
import { ICar, Car } from "../Models";
import BaseService from "./_BaseService";

export class CarService extends BaseService<Partial<ICar>, ICar> {
  constructor() {
    super({
      Model: Car,
      serializer: [
        "createdAt",
        "updatedAt",
        "deletedAt",
        "isDeleted",
        "__v"
      ],
    });
  }

}