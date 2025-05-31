import { CrudOperationsEnum } from "../Utils";
import { ICar, Car } from "../Models";
import BaseService from "./_BaseService";

export class CarService extends BaseService<Partial<ICar>, ICar> {
  constructor() {
    super({
        Model: Car,
    allowedOperations: [
        CrudOperationsEnum.GET_ALL,
        CrudOperationsEnum.CREATE,
        CrudOperationsEnum.UPDATE,
        CrudOperationsEnum.FIND_SINGLE,
        CrudOperationsEnum.SOFT_DELETE,
        CrudOperationsEnum.FIND_OR_CREATE
      ],
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