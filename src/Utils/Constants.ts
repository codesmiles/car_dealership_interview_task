//NOTE: DO NOT TAMPER WITH THIS FILE ANYHOW
export enum ROUTES {
    auth = '/auth',
    customer = "/customer",
    apiV1 = "/api/v1",
    car = "/car",
    sale = "/sale",
    health = "/",
    user = "/user",
    createUser = "/create-user",
    loginUser = "/login",

}

export enum UserRoles {
    EMPLOYEE = "employee",
    CUSTOMER = "customer"
}

export enum CrudOperationsEnum {
  COUNT = "count",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  GET_ALL = "getAll",
  EXISTS = "exists",
  FIND_MANY = "findMany",
  SOFT_DELETE = "softDelete",
  FIND_SINGLE = "findSingle",
  FIND_OR_CREATE = "findOrCreate",
  FIND_MANY_OR_CREATE_MANY = "findManyOrCreateMany"
}


export enum ResponseMessageEnum {
    INVALID_LOGIN_CREDENTIALS = "invalid email or password",
    USER_ALREADY_EXISTS = "Admin already exists",
    UNAUTHORIZED = "Unauthorized",
    VALIDATION_ERROR_MESSAGE = "Validation Error",
    CAR_NOT_FOUND = "Car not found",
    CAR_ALREADY_SOLD = "Car already sold",
    USER_NOT_FOUND = "User not found",
    CAR_QUANTITY_NOT_UPDATED = "Car quantity not updated",
    SALE_NOT_CREATED = "Sale not created",
}