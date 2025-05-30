//NOTE: DO NOT TAMPER WITH THIS FILE ANYHOW
export enum ROUTES {
    auth = '/auth',
    customer = "/customer",
    apiV1 = "/api/v1",
    car = "/car",
    sale = "/sale",
    health = "/health",
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
  GET_ALL = "getAll",
  UPDATE = "update",
  DELETE = "delete",
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
}