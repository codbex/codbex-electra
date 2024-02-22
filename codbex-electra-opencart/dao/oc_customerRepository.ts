import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_customerEntity {
    readonly customer_id: number;
    customer_group_id: number;
    store_id: number;
    language_id: number;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    fax: string;
    password: string;
    salt: string;
    cart?: string;
    wishlist?: string;
    newsletter: boolean;
    address_id: number;
    custom_field: string;
    ip: string;
    status: boolean;
    safe: boolean;
    token: string;
    code: string;
    date_added: Date;
}

export interface oc_customerCreateEntity {
    readonly customer_group_id: number;
    readonly store_id: number;
    readonly language_id: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly email: string;
    readonly telephone: string;
    readonly fax: string;
    readonly password: string;
    readonly salt: string;
    readonly cart?: string;
    readonly wishlist?: string;
    readonly newsletter: boolean;
    readonly address_id: number;
    readonly custom_field: string;
    readonly ip: string;
    readonly status: boolean;
    readonly safe: boolean;
    readonly token: string;
    readonly code: string;
    readonly date_added: Date;
}

export interface oc_customerUpdateEntity extends oc_customerCreateEntity {
    readonly customer_id: number;
}

export interface oc_customerEntityOptions {
    $filter?: {
        equals?: {
            customer_id?: number | number[];
            customer_group_id?: number | number[];
            store_id?: number | number[];
            language_id?: number | number[];
            firstname?: string | string[];
            lastname?: string | string[];
            email?: string | string[];
            telephone?: string | string[];
            fax?: string | string[];
            password?: string | string[];
            salt?: string | string[];
            cart?: string | string[];
            wishlist?: string | string[];
            newsletter?: boolean | boolean[];
            address_id?: number | number[];
            custom_field?: string | string[];
            ip?: string | string[];
            status?: boolean | boolean[];
            safe?: boolean | boolean[];
            token?: string | string[];
            code?: string | string[];
            date_added?: Date | Date[];
        };
        notEquals?: {
            customer_id?: number | number[];
            customer_group_id?: number | number[];
            store_id?: number | number[];
            language_id?: number | number[];
            firstname?: string | string[];
            lastname?: string | string[];
            email?: string | string[];
            telephone?: string | string[];
            fax?: string | string[];
            password?: string | string[];
            salt?: string | string[];
            cart?: string | string[];
            wishlist?: string | string[];
            newsletter?: boolean | boolean[];
            address_id?: number | number[];
            custom_field?: string | string[];
            ip?: string | string[];
            status?: boolean | boolean[];
            safe?: boolean | boolean[];
            token?: string | string[];
            code?: string | string[];
            date_added?: Date | Date[];
        };
        contains?: {
            customer_id?: number;
            customer_group_id?: number;
            store_id?: number;
            language_id?: number;
            firstname?: string;
            lastname?: string;
            email?: string;
            telephone?: string;
            fax?: string;
            password?: string;
            salt?: string;
            cart?: string;
            wishlist?: string;
            newsletter?: boolean;
            address_id?: number;
            custom_field?: string;
            ip?: string;
            status?: boolean;
            safe?: boolean;
            token?: string;
            code?: string;
            date_added?: Date;
        };
        greaterThan?: {
            customer_id?: number;
            customer_group_id?: number;
            store_id?: number;
            language_id?: number;
            firstname?: string;
            lastname?: string;
            email?: string;
            telephone?: string;
            fax?: string;
            password?: string;
            salt?: string;
            cart?: string;
            wishlist?: string;
            newsletter?: boolean;
            address_id?: number;
            custom_field?: string;
            ip?: string;
            status?: boolean;
            safe?: boolean;
            token?: string;
            code?: string;
            date_added?: Date;
        };
        greaterThanOrEqual?: {
            customer_id?: number;
            customer_group_id?: number;
            store_id?: number;
            language_id?: number;
            firstname?: string;
            lastname?: string;
            email?: string;
            telephone?: string;
            fax?: string;
            password?: string;
            salt?: string;
            cart?: string;
            wishlist?: string;
            newsletter?: boolean;
            address_id?: number;
            custom_field?: string;
            ip?: string;
            status?: boolean;
            safe?: boolean;
            token?: string;
            code?: string;
            date_added?: Date;
        };
        lessThan?: {
            customer_id?: number;
            customer_group_id?: number;
            store_id?: number;
            language_id?: number;
            firstname?: string;
            lastname?: string;
            email?: string;
            telephone?: string;
            fax?: string;
            password?: string;
            salt?: string;
            cart?: string;
            wishlist?: string;
            newsletter?: boolean;
            address_id?: number;
            custom_field?: string;
            ip?: string;
            status?: boolean;
            safe?: boolean;
            token?: string;
            code?: string;
            date_added?: Date;
        };
        lessThanOrEqual?: {
            customer_id?: number;
            customer_group_id?: number;
            store_id?: number;
            language_id?: number;
            firstname?: string;
            lastname?: string;
            email?: string;
            telephone?: string;
            fax?: string;
            password?: string;
            salt?: string;
            cart?: string;
            wishlist?: string;
            newsletter?: boolean;
            address_id?: number;
            custom_field?: string;
            ip?: string;
            status?: boolean;
            safe?: boolean;
            token?: string;
            code?: string;
            date_added?: Date;
        };
    },
    $select?: (keyof oc_customerEntity)[],
    $sort?: string | (keyof oc_customerEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_customerEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_customerEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_customerRepository {

    private static readonly DEFINITION = {
        table: "oc_customer",
        properties: [
            {
                name: "customer_id",
                column: "customer_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "customer_group_id",
                column: "customer_group_id",
                type: "INT",
                required: true
            },
            {
                name: "store_id",
                column: "store_id",
                type: "INT",
                required: true
            },
            {
                name: "language_id",
                column: "language_id",
                type: "INT",
                required: true
            },
            {
                name: "firstname",
                column: "firstname",
                type: "VARCHAR",
                required: true
            },
            {
                name: "lastname",
                column: "lastname",
                type: "VARCHAR",
                required: true
            },
            {
                name: "email",
                column: "email",
                type: "VARCHAR",
                required: true
            },
            {
                name: "telephone",
                column: "telephone",
                type: "VARCHAR",
                required: true
            },
            {
                name: "fax",
                column: "fax",
                type: "VARCHAR",
                required: true
            },
            {
                name: "password",
                column: "password",
                type: "VARCHAR",
                required: true
            },
            {
                name: "salt",
                column: "salt",
                type: "VARCHAR",
                required: true
            },
            {
                name: "cart",
                column: "cart",
                type: "TEXT",
            },
            {
                name: "wishlist",
                column: "wishlist",
                type: "TEXT",
            },
            {
                name: "newsletter",
                column: "newsletter",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "address_id",
                column: "address_id",
                type: "INT",
                required: true
            },
            {
                name: "custom_field",
                column: "custom_field",
                type: "TEXT",
                required: true
            },
            {
                name: "ip",
                column: "ip",
                type: "VARCHAR",
                required: true
            },
            {
                name: "status",
                column: "status",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "safe",
                column: "safe",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "token",
                column: "token",
                type: "TEXT",
                required: true
            },
            {
                name: "code",
                column: "code",
                type: "VARCHAR",
                required: true
            },
            {
                name: "date_added",
                column: "date_added",
                type: "DATETIME",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_customerRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_customerEntityOptions): oc_customerEntity[] {
        return this.dao.list(options).map((e: oc_customerEntity) => {
            EntityUtils.setBoolean(e, "newsletter");
            EntityUtils.setBoolean(e, "status");
            EntityUtils.setBoolean(e, "safe");
            return e;
        });
    }

    public findById(id: number): oc_customerEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "newsletter");
        EntityUtils.setBoolean(entity, "status");
        EntityUtils.setBoolean(entity, "safe");
        return entity ?? undefined;
    }

    public create(entity: oc_customerCreateEntity): number {
        EntityUtils.setBoolean(entity, "newsletter");
        EntityUtils.setBoolean(entity, "status");
        EntityUtils.setBoolean(entity, "safe");
        return this.dao.insert(entity);
    }

    public update(entity: oc_customerUpdateEntity): void {
        EntityUtils.setBoolean(entity, "newsletter");
        EntityUtils.setBoolean(entity, "status");
        EntityUtils.setBoolean(entity, "safe");
        this.dao.update(entity);
    }

    public upsert(entity: oc_customerCreateEntity | oc_customerUpdateEntity): number {
        const id = (entity as oc_customerUpdateEntity).customer_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_customerUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_customer"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

}