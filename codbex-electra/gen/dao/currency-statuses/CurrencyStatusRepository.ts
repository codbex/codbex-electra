import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CurrencyStatusEntity {
    readonly Id: number;
    Name: string;
}

export interface CurrencyStatusCreateEntity {
    readonly Name: string;
}

export interface CurrencyStatusUpdateEntity extends CurrencyStatusCreateEntity {
    readonly Id: number;
}

export interface CurrencyStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof CurrencyStatusEntity)[],
    $sort?: string | (keyof CurrencyStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CurrencyStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CurrencyStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CurrencyStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CURRENCYSTATUS",
        properties: [
            {
                name: "Id",
                column: "CURRENCYSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CURRENCYSTATUS_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CurrencyStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CurrencyStatusEntityOptions): CurrencyStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CurrencyStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CurrencyStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CURRENCYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCYSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CurrencyStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CURRENCYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCYSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CurrencyStatusCreateEntity | CurrencyStatusUpdateEntity): number {
        const id = (entity as CurrencyStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CurrencyStatusUpdateEntity);
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
            table: "CODBEX_CURRENCYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCYSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: CurrencyStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCYSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CurrencyStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-currency-statuses-CurrencyStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-currency-statuses-CurrencyStatus").send(JSON.stringify(data));
    }
}
