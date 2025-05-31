import { ISale, Sale } from "../Models";
import BaseService from "./_BaseService";

export class SaleService extends BaseService<Partial<ISale>, ISale> {
  constructor() {
    super({
        Model: Sale,
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