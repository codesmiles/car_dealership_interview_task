import { Model, UpdateQuery, FilterQuery, Schema, ClientSession, Document } from "mongoose";

import { CrudOperationsEnum, PaginatedResponse } from "../Utils";

abstract class BaseAbstract<T, I> {
    abstract create(payload: T): Promise<I>;
    abstract getAll(
        queries: {
            page: number;
            pageSize: number;
            queries: object;
            search?: string;
        },
        options?: {
            session?: ClientSession,
            populate?: string[]
        }): Promise<PaginatedResponse<I>>;
    abstract count(query: object, session?: ClientSession): Promise<number>;
    abstract update(query: object, payload: UpdateQuery<I>, session?: ClientSession): Promise<I | null>;
    abstract delete(id: string, session?: ClientSession): Promise<void>;
    abstract search(query: string, session?: ClientSession): Promise<I[] | null>;
    abstract exists(query: object, session?: ClientSession): Promise<boolean>;
    abstract findSingle(data: { payload: Partial<I>; populate?: string[] }, session?: ClientSession): Promise<I | null>;
    abstract softDelete(id: string, session?: ClientSession): Promise<void>;
    ;
    abstract findOrCreate(payload: Partial<I>, key: keyof I, session?: ClientSession): Promise<I>;

}

// Create a type instead of an interface
type MongoFilters<T> = FilterQuery<T> & {
    $text?: { $search: string };
};

type BaseServiceConstructorType<I> = {
    // Model: Model<I, SanitizeQueryHelpers<I>>;
    Model: Model<I>;
    serializer?: string[];
    allowedOperations?: CrudOperationsEnum[];
}

/**
 * Type for the projection object used in Mongoose queries.
 * @typedef {Object} ProjectionType
 * @property {string} [key] - The key of the field to project.
 * @property {0|1|{ $meta: "textScore" }} [value] - The value of the field to project.
*/
type ProjectionType = {
    [key: string]: 0 | 1 | { $meta: "textScore" };
};

/**
 * Function to handle not allowed operations.
 * @param {CrudOperationsEnum} operation - The operation that is not allowed.
 * @returns {never} - Throws an error.
 */
const notAllowedMsg = (operation: CrudOperationsEnum): never => {
    const err = new Error(`Operation ${operation} not allowed`);
    console.log(err)
    throw err;
};


/**
 * BaseService class that provides CRUD operations for Mongoose models.
 * @template T - Type of the payload for create and update operations.
 * @template I - Type of the Mongoose model instance.
 */
export default class BaseService<T, I> extends BaseAbstract<T, I> {
    private readonly Model: Model<I>;
    private readonly allowedOperations: CrudOperationsEnum[];
    protected readonly serializer: string[];

    /**
     * Constructor for BaseService.
     * @param {BaseServiceConstructorType<I>} builder - Object containing the model and allowed operations.
     */
    public constructor(builder: BaseServiceConstructorType<I>) {
        super();
        this.Model = builder.Model;
        this.serializer = builder.serializer || [];
        this.allowedOperations = builder.allowedOperations || Object.values(CrudOperationsEnum);
    }

    /**
     * finds a single document in the database.
     * @param payload object
     * @param options {projection?: object}
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns I | null
     */
    async findSingle(data: { payload: Partial<I>; populate?: string[] }, session?: ClientSession): Promise<I | null> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.FIND_SINGLE)) {
            notAllowedMsg(CrudOperationsEnum.FIND_SINGLE);
        }
        console.log("Filtered Fields", this.serializer);
        const { payload, populate } = data;
        let query = this.Model.findOne(payload)
            .select(this.serializer.map(field => `-${field}`));

        if (session) {
            query = query.session(session);
        }
        if (populate?.length) {
            query = query.populate(populate.map(path => ({ path })));
        }
        const findSingle = await query.exec();
        return findSingle as I | null;
    }

    /**
     * Creates a new document in the database.
     * @param {T} payload - The data to create the document with.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<I>} - The created document.
     */
    async create(payload: T, session?: ClientSession, populate?: string[],): Promise<I> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.CREATE)) {
            notAllowedMsg(CrudOperationsEnum.CREATE);
        }
        let create = new this.Model(payload);
        await create.save({ session });

        if (populate?.length) {
            create = await (create as Document).populate(
                populate.map(path => ({ path }))
            );
        }

        return create as I;
    }

    /**
     * Retrieves all documents from the database with optional pagination and search.
     * @param {object} queries - The query parameters for pagination and search.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<PaginatedResponse<I>>} - The paginated response containing the documents.
     */
    async getAll(
        queries: { page?: number; pageSize?: number; queries?: object; search?: string; },
        options?: {
            session?: ClientSession,
            populate?: string[]
        }): Promise<PaginatedResponse<I>> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.GET_ALL)) {
            notAllowedMsg(CrudOperationsEnum.GET_ALL);
        }

        console.log("Filtered Fields", this.serializer);

        const page = Number(queries.page) || 1;
        const pageSize = Number(queries.pageSize) || 5;
        const mongoFilters: MongoFilters<I> = { ...queries.queries };

        const skip = (page - 1) * pageSize;
        const total = await this.Model.countDocuments({ isDeleted: false, ...mongoFilters });

        // Only add text search if search query is provided and is not empty
        const isTextSearch = Boolean(queries.search);
        if (isTextSearch && queries.search) { // Add extra check for TypeScript
            mongoFilters.$text = { $search: queries.search };
        }

        // Build projection object for select()
        const projection: ProjectionType = {};
        this.serializer.forEach(field => {
            projection[field] = 0;
        });
        if (isTextSearch) {
            projection.score = { $meta: "textScore" };
        }

        const formattedQueries = {} as Record<string, MongoFilters<I | T>>;
        for (const [key, value] of Object.entries(mongoFilters)) {
            const schemaPath = this.Model.schema.path(key);
            if (!schemaPath) continue; // Skip if field is not in schema
            const isArrayField = schemaPath instanceof Schema.Types.Array || schemaPath.instance === 'Array';
            formattedQueries[key] = isArrayField ? { $in: Array.isArray(value) ? value : [value] } : value;
        }

        let data = await this.Model.find({ isDeleted: false, ...formattedQueries })
            .select(projection)
            .sort(
                isTextSearch
                    ? { score: { $meta: "textScore" } }
                    : { createdAt: "desc" }
            )
            .skip(skip)
            .limit(pageSize)
        
        const {session, populate } = options || {};
        // Apply session if provided
        if (session) {
            data.forEach(doc => doc.$session(session));
        }

        if (populate?.length) {
            data = await this.Model.populate(data, populate.map(path => ({ path })));
        }

        return {
            payload: data as PaginatedResponse<I>["payload"],
            meta: {
                page,
                total,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    /**
   * Find Or Create 
   * @param {Partial<I>} payload an array of value you want to check
   * @param {keyof I} key the key you want to find
   * @param {ClientSession} session  - Transaction session(Optional).
   * @returns {I} array of data of existing and created documents
   */
    async findOrCreate(payload: Partial<I>, key: keyof I, session?: ClientSession): Promise<I> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.FIND_OR_CREATE)) {
            notAllowedMsg(CrudOperationsEnum.FIND_OR_CREATE);
        }

        console.log("Filtered Fields", this.serializer);
        const value = payload[key];
        const filter = { [key]: value, isDeleted: false } as FilterQuery<T>;
        const doc = await this.Model.findOne(filter, session).select(this.serializer.map(field => `-${field}`)).exec()
            ?? await this.Model.create(payload as I, { session });
        return doc as I;
    }
    /**
     * Find Many Or Create Many
     * @param {string[]} identifiers an array of value you want to check
     * @param {keyof I} key the key you want to find
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns array of data of existing and created documents
     */
    async findManyOrCreateMany(identifiers: string[], key: keyof I, session?: ClientSession): Promise<I[]> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.FIND_MANY_OR_CREATE_MANY)) {
            notAllowedMsg(CrudOperationsEnum.FIND_MANY_OR_CREATE_MANY);
        }
        console.log("Filtered Fields", this.serializer);
        const filter = { [key]: { $in: identifiers } } as FilterQuery<I>;
        const existingDocs = await this.Model.find({ isDeleted: false, ...filter }, session).select(this.serializer.map(field => `-${field}`)).exec();

        const existingValues = existingDocs.map(doc => doc[key] as string);
        const toCreate = identifiers.filter(val => !existingValues.includes(val));

        const createdDocs = await this.Model.insertMany(
            toCreate.map(val => ({ [key]: val })), { ordered: false, session });

        // Step 4: Return all
        return [...existingDocs, ...createdDocs] as I[];
    }


    /**
     * Updates a document in the database.
     * @param {object} query - The query to find the document to update.
     * @param {UpdateQuery<I>} payload - The data to update the document with.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<I | null>} - The updated document or null if not found.
     */
    async update(query: object, payload: UpdateQuery<I>, session?: ClientSession): Promise<I | null> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.UPDATE)) {
            notAllowedMsg(CrudOperationsEnum.UPDATE);
        }
        console.log("Filtered Fields", this.serializer);
        const update = await this.Model.findOneAndUpdate({ isDeleted: false, ...query }, payload, {
            new: true,
            session
        }).select(this.serializer.map(field => `-${field}`)).exec();
        return update as I | null;
    }

    /**
     * Deletes a document from the database.
     * @param {string} id - The ID of the document to delete.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<void>} - A promise that resolves when the document is deleted.
     */
    async delete(id: string, session?: ClientSession): Promise<void> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.DELETE)) {
            notAllowedMsg(CrudOperationsEnum.DELETE);
        }
        console.log("Filtered Fields", this.serializer);

        await this.Model.findByIdAndDelete(id, session);
    }

    /**
     * Soft deletes a document in the database.
     * @param {string} _id - The ID of the document to soft delete.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<void>} - A promise that resolves when the document is soft deleted.
     */
    async softDelete(_id: string, session?: ClientSession): Promise<void> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.SOFT_DELETE)) {
            notAllowedMsg(CrudOperationsEnum.SOFT_DELETE);
        }
        await this.Model.updateOne({ _id }, { isDeleted: true, deletedAt: new Date() }, { session });
    }

    /**
     * Checks if a document exists in the database.
     * @param {object} query - The query to find the document.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<boolean>} - True if the document exists, false otherwise.
     */
    async exists(query: object, session?: ClientSession): Promise<boolean> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.EXISTS)) {
            notAllowedMsg(CrudOperationsEnum.EXISTS);
        }
        const exists = await this.Model.exists({ isDeleted: false, ...query }).session(session as ClientSession);
        return !!exists;
    }

    /**
     * Searches for documents in the database based on a query.
     * @param {string} query  - The search query.
     * @param {ClientSession} session  - Transaction session(Optional).
     * @returns {Promise<I[] | null>} - An array of matching documents or null if none found.
     */
    async search(query: string, session?: ClientSession): Promise<I[] | null> {
        console.log("Filtered Fields", this.serializer);
        await this.Model.syncIndexes()
        console.log(`indexes synced`);
        const results = await this.Model.find({
            isDeleted: false,
            $text: { $search: query }
        }, session)
            .select({
                ...Object.fromEntries(this.serializer.map(field => [field, 0])),
                score: { $meta: "textScore" }
            })
            .sort({ score: { $meta: "textScore" } })
            .exec();

        return results;
    }

    /**
     * Counts the number of documents in the database.
     * @param {object} query - The query to count documents.
     * @returns {Promise<number>} - The count of documents.
     */
    async count(query?: object): Promise<number> {
        if (!this.allowedOperations.includes(CrudOperationsEnum.COUNT)) {
            notAllowedMsg(CrudOperationsEnum.COUNT);
        }
        const count = await this.Model.countDocuments({ isDeleted: false, ...query });
        return count;
    }

}
