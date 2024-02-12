import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface LanguageEntity {
    readonly Id: number;
    Name: string;
    Code: string;
    Locale: string;
    Status: number;
}

export interface LanguageCreateEntity {
    readonly Name: string;
    readonly Code: string;
    readonly Locale: string;
    readonly Status: number;
}

export interface LanguageUpdateEntity extends LanguageCreateEntity {
    readonly Id: number;
}

export interface LanguageEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Code?: string | string[];
            Locale?: string | string[];
            Status?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Code?: string | string[];
            Locale?: string | string[];
            Status?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Code?: string;
            Locale?: string;
            Status?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Code?: string;
            Locale?: string;
            Status?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Code?: string;
            Locale?: string;
            Status?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Code?: string;
            Locale?: string;
            Status?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Code?: string;
            Locale?: string;
            Status?: number;
        };
    },
    $select?: (keyof LanguageEntity)[],
    $sort?: string | (keyof LanguageEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface LanguageEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<LanguageEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class LanguageRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_LANGUAGE",
        properties: [
            {
                name: "Id",
                column: "LANGUAGE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "LANGUAGE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Code",
                column: "LANGUAGE_CODE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Locale",
                column: "LANGUAGE_LOCALE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Status",
                column: "LANGUAGE_STATUS",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(LanguageRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: LanguageEntityOptions): LanguageEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): LanguageEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: LanguageCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_LANGUAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: LanguageUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_LANGUAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: LanguageCreateEntity | LanguageUpdateEntity): number {
        const id = (entity as LanguageUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as LanguageUpdateEntity);
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
            table: "CODBEX_LANGUAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "LANGUAGE_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_LANGUAGE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: LanguageEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/Language", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/Language").send(JSON.stringify(data));
    }
}