import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface LanguageStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface LanguageStatusCreateEntity {
    readonly Name?: string;
}

export interface LanguageStatusUpdateEntity extends LanguageStatusCreateEntity {
    readonly Id: number;
}

export interface LanguageStatusEntityOptions {
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
    $select?: (keyof LanguageStatusEntity)[],
    $sort?: string | (keyof LanguageStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface LanguageStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<LanguageStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class LanguageStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_LANGUAGESTATUS",
        properties: [
            {
                name: "Id",
                column: "LANGUAGESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "LANGUAGESTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(LanguageStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: LanguageStatusEntityOptions): LanguageStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): LanguageStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: LanguageStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_LANGUAGESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: LanguageStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_LANGUAGESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: LanguageStatusCreateEntity | LanguageStatusUpdateEntity): number {
        const id = (entity as LanguageStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as LanguageStatusUpdateEntity);
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
            table: "CODBEX_LANGUAGESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGESTATUS_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_LANGUAGESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: LanguageStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/LanguageStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/LanguageStatus").send(JSON.stringify(data));
    }
}