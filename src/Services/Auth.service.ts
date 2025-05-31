import { CrudOperationsEnum } from "../Utils";
import { IUser, User } from "../Models";
import BaseService from "./_BaseService";

export class AuthService extends BaseService<Partial<IUser>, IUser> {
  constructor() {
    super({
      Model: User,
      allowedOperations: [
        CrudOperationsEnum.GET_ALL,
        CrudOperationsEnum.CREATE,
        CrudOperationsEnum.UPDATE,
        CrudOperationsEnum.FIND_SINGLE,
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
