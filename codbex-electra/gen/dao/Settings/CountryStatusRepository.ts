import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CountryStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface CountryStatusCreateEntity {
    readonly Name?: string;
}

export interface CountryStatusUpdateEntity extends CountryStatusCreateEntity {
    readonly Id: number;
}

export interface CountryStatusEntityOptions {
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
    $select?: (keyof CountryStatusEntity)[],
    $sort?: string | (keyof CountryStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CountryStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CountryStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CountryStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_COUNTRYSTATUS",
        properties: [
            {
                name: "Id",
                column: "COUNTRYSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "COUNTRYSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(CountryStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CountryStatusEntityOptions): CountryStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CountryStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CountryStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_COUNTRYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "COUNTRYSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CountryStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_COUNTRYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "COUNTRYSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CountryStatusCreateEntity | CountryStatusUpdateEntity): number {
        const id = (entity as CountryStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CountryStatusUpdateEntity);
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
            table: "CODBEX_COUNTRYSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "COUNTRYSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: CountryStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: CountryStatusEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COUNTRYSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CountryStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/CountryStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/CountryStatus").send(JSON.stringify(data));
    }
}