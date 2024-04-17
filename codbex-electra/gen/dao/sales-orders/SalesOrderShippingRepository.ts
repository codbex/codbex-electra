import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalesOrderShippingEntity {
    readonly Id: number;
    Zone: number;
    FirstName: string;
    LastName: string;
    Company?: string;
    Address1?: string;
    Address2?: string;
    Country: number;
    City?: string;
    Postcode?: string;
    Method?: string;
    Code?: string;
    UpdatedBy?: string;
    AddressFormat?: string;
    CustomField?: string;
    SalesOrder: number;
}

export interface SalesOrderShippingCreateEntity {
    readonly Zone: number;
    readonly FirstName: string;
    readonly LastName: string;
    readonly Company?: string;
    readonly Address1?: string;
    readonly Address2?: string;
    readonly Country: number;
    readonly City?: string;
    readonly Postcode?: string;
    readonly Method?: string;
    readonly Code?: string;
    readonly AddressFormat?: string;
    readonly CustomField?: string;
    readonly SalesOrder: number;
}

export interface SalesOrderShippingUpdateEntity extends SalesOrderShippingCreateEntity {
    readonly Id: number;
}

export interface SalesOrderShippingEntityOptions {
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
            UpdatedBy?: string | string[];
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
            UpdatedBy?: string | string[];
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
            UpdatedBy?: string;
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
            UpdatedBy?: string;
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
            UpdatedBy?: string;
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
            UpdatedBy?: string;
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
            UpdatedBy?: string;
            AddressFormat?: string;
            CustomField?: string;
            SalesOrder?: number;
        };
    },
    $select?: (keyof SalesOrderShippingEntity)[],
    $sort?: string | (keyof SalesOrderShippingEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderShippingEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderShippingEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderShippingRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDERSHIPPING",
        properties: [
            {
                name: "Id",
                column: "SALESORDERSHIPPING_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Zone",
                column: "SALESORDERSHIPPING_ZONE",
                type: "INTEGER",
                required: true
            },
            {
                name: "FirstName",
                column: "SALESORDERSHIPPING_FIRSTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "LastName",
                column: "SALESORDERSHIPPING_LASTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Company",
                column: "SALESORDERSHIPPING_COMPANY",
                type: "VARCHAR",
            },
            {
                name: "Address1",
                column: "SALESORDERSHIPPING_ADDRESS1",
                type: "VARCHAR",
            },
            {
                name: "Address2",
                column: "SALESORDERSHIPPING_ADDRESS2",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "SALESORDERSHIPPING_COUNTRY",
                type: "INTEGER",
                required: true
            },
            {
                name: "City",
                column: "SALESORDERSHIPPING_CITY",
                type: "VARCHAR",
            },
            {
                name: "Postcode",
                column: "SALESORDERSHIPPING_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "Method",
                column: "SALESORDERSHIPPING_METHOD",
                type: "VARCHAR",
            },
            {
                name: "Code",
                column: "SALESORDERSHIPPING_CODE",
                type: "VARCHAR",
            },
            {
                name: "UpdatedBy",
                column: "SALESORDERSHIPPING_UPDATEDBY",
                type: "VARCHAR",
            },
            {
                name: "AddressFormat",
                column: "SALESORDERSHIPPING_ADDRESSFORMAT",
                type: "VARCHAR",
            },
            {
                name: "CustomField",
                column: "SALESORDERSHIPPING_CUSTOMFIELD",
                type: "VARCHAR",
            },
            {
                name: "SalesOrder",
                column: "SALESORDERSHIPPING_SALESORDER",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalesOrderShippingRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderShippingEntityOptions): SalesOrderShippingEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderShippingEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderShippingCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDERSHIPPING",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERSHIPPING_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderShippingUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDERSHIPPING",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERSHIPPING_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderShippingCreateEntity | SalesOrderShippingUpdateEntity): number {
        const id = (entity as SalesOrderShippingUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderShippingUpdateEntity);
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
            table: "CODBEX_SALESORDERSHIPPING",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERSHIPPING_ID",
                value: id
            }
        });
    }

    public count(options?: SalesOrderShippingEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERSHIPPING"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderShippingEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-sales-orders-SalesOrderShipping", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-sales-orders-SalesOrderShipping").send(JSON.stringify(data));
    }
}
