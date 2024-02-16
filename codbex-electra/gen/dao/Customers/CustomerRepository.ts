import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CustomerEntity {
    readonly Id: number;
    Email?: string;
    FirstName?: string;
    LastName?: string;
    Store?: number;
    Status?: number;
    Telephone?: string;
    DateAdded?: Date;
    Code?: string;
    CustomField?: string;
    Language?: number;
}

export interface CustomerCreateEntity {
    readonly Email?: string;
    readonly FirstName?: string;
    readonly LastName?: string;
    readonly Store?: number;
    readonly Status?: number;
    readonly Telephone?: string;
    readonly Code?: string;
    readonly CustomField?: string;
    readonly Language?: number;
}

export interface CustomerUpdateEntity extends CustomerCreateEntity {
    readonly Id: number;
}

export interface CustomerEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Email?: string | string[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Store?: number | number[];
            Status?: number | number[];
            Telephone?: string | string[];
            DateAdded?: Date | Date[];
            Code?: string | string[];
            CustomField?: string | string[];
            Language?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Email?: string | string[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Store?: number | number[];
            Status?: number | number[];
            Telephone?: string | string[];
            DateAdded?: Date | Date[];
            Code?: string | string[];
            CustomField?: string | string[];
            Language?: number | number[];
        };
        contains?: {
            Id?: number;
            Email?: string;
            FirstName?: string;
            LastName?: string;
            Store?: number;
            Status?: number;
            Telephone?: string;
            DateAdded?: Date;
            Code?: string;
            CustomField?: string;
            Language?: number;
        };
        greaterThan?: {
            Id?: number;
            Email?: string;
            FirstName?: string;
            LastName?: string;
            Store?: number;
            Status?: number;
            Telephone?: string;
            DateAdded?: Date;
            Code?: string;
            CustomField?: string;
            Language?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Email?: string;
            FirstName?: string;
            LastName?: string;
            Store?: number;
            Status?: number;
            Telephone?: string;
            DateAdded?: Date;
            Code?: string;
            CustomField?: string;
            Language?: number;
        };
        lessThan?: {
            Id?: number;
            Email?: string;
            FirstName?: string;
            LastName?: string;
            Store?: number;
            Status?: number;
            Telephone?: string;
            DateAdded?: Date;
            Code?: string;
            CustomField?: string;
            Language?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Email?: string;
            FirstName?: string;
            LastName?: string;
            Store?: number;
            Status?: number;
            Telephone?: string;
            DateAdded?: Date;
            Code?: string;
            CustomField?: string;
            Language?: number;
        };
    },
    $select?: (keyof CustomerEntity)[],
    $sort?: string | (keyof CustomerEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CustomerEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CustomerEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CustomerRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CUSTOMER",
        properties: [
            {
                name: "Id",
                column: "CUSTOMER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Email",
                column: "CUSTOMER_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "FirstName",
                column: "CUSTOMER_FIRSTNAME",
                type: "VARCHAR",
            },
            {
                name: "LastName",
                column: "CUSTOMER_LASTNAME",
                type: "VARCHAR",
            },
            {
                name: "Store",
                column: "CUSTOMER_STORE",
                type: "INTEGER",
            },
            {
                name: "Status",
                column: "CUSTOMER_STATUS",
                type: "INTEGER",
            },
            {
                name: "Telephone",
                column: "CUSTOMER_TELEPHONE",
                type: "VARCHAR",
            },
            {
                name: "DateAdded",
                column: "CUSTOMER_DATE_ADDED",
                type: "TIMESTAMP",
            },
            {
                name: "Code",
                column: "CUSTOMER_CODE",
                type: "VARCHAR",
            },
            {
                name: "CustomField",
                column: "CUSTOMER_CUSTOMFIELD",
                type: "VARCHAR",
            },
            {
                name: "Language",
                column: "CUSTOMER_LANGUAGE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(CustomerRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CustomerEntityOptions): CustomerEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CustomerEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CustomerCreateEntity): number {
        // @ts-ignore
        (entity as CustomerEntity).DateAdded = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CustomerUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CustomerCreateEntity | CustomerUpdateEntity): number {
        const id = (entity as CustomerUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CustomerUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
    }

    public count(options?: CustomerEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: CustomerEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CustomerEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Customers/Customer", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Customers/Customer").send(JSON.stringify(data));
    }
}