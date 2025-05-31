import { IUser, User } from "../Models";
import BaseService from "./_BaseService";

export class UserService extends BaseService<Partial<IUser>, IUser> {
  constructor() {
    super({
      Model: User,
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
