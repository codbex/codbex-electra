import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalesOrderPaymentEntity {
    readonly Id: number;
    Zone?: number;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Address1?: string;
    Address2?: string;
    Country?: number;
    City?: string;
    Postcode?: string;
    Method?: string;
    Code?: string;
    AddressFormat?: string;
    CustomField?: string;
    SalesOrder?: number;
}

export interface SalesOrderPaymentCreateEntity {
    readonly Zone?: number;
    readonly FirstName?: string;
    readonly LastName?: string;
    readonly Company?: string;
    readonly Address1?: string;
    readonly Address2?: string;
    readonly Country?: number;
    readonly City?: string;
    readonly Postcode?: string;
    readonly Method?: string;
    readonly Code?: string;
    readonly AddressFormat?: string;
    readonly CustomField?: string;
    readonly SalesOrder?: number;
}

export interface SalesOrderPaymentUpdateEntity extends SalesOrderPaymentCreateEntity {
    readonly Id: number;
}

export interface SalesOrderPaymentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Zone?: number | number[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Company?: string | string[];
            Address1?: string | string[];
            Address2?: string | string[];
            Country?: number | number[];
            City?: string | string[];
            Postcode?: string | string[];
            Method?: string | string[];
            Code?: string | string[];
            AddressFormat?: string | string[];
            CustomField?: string | string[];
            SalesOrder?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Zone?: number | number[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Company?: string | string[];
            Address1?: string | string[];
            Address2?: string | string[];
            Country?: number | number[];
            City?: string | string[];
            Postcode?: string | string[];
            Method?: string | string[];
            Code?: string | string[];
            AddressFormat?: string | string[];
            CustomField?: string | string[];
            SalesOrder?: number | number[];
        };
        contains?: {
            Id?: number;
            Zone?: number;
            FirstName?: string;
            LastName?: string;
            Company?: string;
            Address1?: string;
            Address2?: string;
            Country?: number;
            City?: string;
            Postcode?: string;
            Method?: string;
            Code?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
        greaterThan?: {
            Id?: number;
            Zone?: number;
            FirstName?: string;
            LastName?: string;
            Company?: string;
            Address1?: string;
            Address2?: string;
            Country?: number;
            City?: string;
            Postcode?: string;
            Method?: string;
            Code?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Zone?: number;
            FirstName?: string;
            LastName?: string;
            Company?: string;
            Address1?: string;
            Address2?: string;
            Country?: number;
            City?: string;
            Postcode?: string;
            Method?: string;
            Code?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
        lessThan?: {
            Id?: number;
            Zone?: number;
            FirstName?: string;
            LastName?: string;
            Company?: string;
            Address1?: string;
            Address2?: string;
            Country?: number;
            City?: string;
            Postcode?: string;
            Method?: string;
            Code?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Zone?: number;
            FirstName?: string;
            LastName?: string;
            Company?: string;
            Address1?: string;
            Address2?: string;
            Country?: number;
            City?: string;
            Postcode?: string;
            Method?: string;
            Code?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
    },
    $select?: (keyof SalesOrderPaymentEntity)[],
    $sort?: string | (keyof SalesOrderPaymentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderPaymentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderPaymentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderPaymentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDERPAYMENT",
        properties: [
            {
                name: "Id",
                column: "SALESORDERPAYMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Zone",
                column: "SALESORDERPAYMENT_ZONE",
                type: "INTEGER",
            },
            {
                name: "FirstName",
                column: "SALESORDERPAYMENT_FIRSTNAME",
                type: "VARCHAR",
            },
            {
                name: "LastName",
                column: "SALESORDERPAYMENT_LASTNAME",
                type: "VARCHAR",
            },
            {
                name: "Company",
                column: "SALESORDERPAYMENT_COMPANY",
                type: "VARCHAR",
            },
            {
                name: "Address1",
                column: "SALESORDERPAYMENT_ADDRESS1",
                type: "VARCHAR",
            },
            {
                name: "Address2",
                column: "SALESORDERPAYMENT_ADDRESS2",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "SALESORDERPAYMENT_COUNTRY",
                type: "INTEGER",
            },
            {
                name: "City",
                column: "SALESORDERPAYMENT_CITY",
                type: "VARCHAR",
            },
            {
                name: "Postcode",
                column: "SALESORDERPAYMENT_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "Method",
                column: "SALESORDERPAYMENT_METHOD",
                type: "VARCHAR",
            },
            {
                name: "Code",
                column: "SALESORDERPAYMENT_CODE",
                type: "VARCHAR",
            },
            {
                name: "AddressFormat",
                column: "SALESORDERPAYMENT_ADDRESSFORMAT",
                type: "VARCHAR",
            },
            {
                name: "CustomField",
                column: "SALESORDERPAYMENT_CUSTOMFIELD",
                type: "VARCHAR",
            },
            {
                name: "SalesOrder",
                column: "SALESORDERPAYMENT_SALESORDER",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesOrderPaymentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderPaymentEntityOptions): SalesOrderPaymentEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderPaymentEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderPaymentCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDERPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERPAYMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderPaymentUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDERPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERPAYMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderPaymentCreateEntity | SalesOrderPaymentUpdateEntity): number {
        const id = (entity as SalesOrderPaymentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderPaymentUpdateEntity);
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
            table: "CODBEX_SALESORDERPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERPAYMENT_ID",
                value: id
            }
        });
    }



    public count(SalesOrder: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT" WHERE "SALESORDERPAYMENT_SALESORDER" = ?', [SalesOrder]);
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERPAYMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderPaymentEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderPayment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/SalesOrders/SalesOrderPayment").send(JSON.stringify(data));
    }
}