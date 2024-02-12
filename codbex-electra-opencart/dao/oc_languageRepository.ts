import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_languageEntity {
    readonly language_id: number;
    name: string;
    code: string;
    locale: string;
    image: string;
    directory: string;
    sort_order: number;
    status: boolean;
}

export interface oc_languageCreateEntity {
    readonly name: string;
    readonly code: string;
    readonly locale: string;
    readonly image: string;
    readonly directory: string;
    readonly sort_order: number;
    readonly status: boolean;
}

export interface oc_languageUpdateEntity extends oc_languageCreateEntity {
    readonly language_id: number;
}

export interface oc_languageEntityOptions {
    $filter?: {
        equals?: {
            language_id?: number | number[];
            name?: string | string[];
            code?: string | string[];
            locale?: string | string[];
            image?: string | string[];
            directory?: string | string[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
        };
        notEquals?: {
            language_id?: number | number[];
            name?: string | string[];
            code?: string | string[];
            locale?: string | string[];
            image?: string | string[];
            directory?: string | string[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
        };
        contains?: {
            language_id?: number;
            name?: string;
            code?: string;
            locale?: string;
            image?: string;
            directory?: string;
            sort_order?: number;
            status?: boolean;
        };
        greaterThan?: {
            language_id?: number;
            name?: string;
            code?: string;
            locale?: string;
            image?: string;
            directory?: string;
            sort_order?: number;
            status?: boolean;
        };
        greaterThanOrEqual?: {
            language_id?: number;
            name?: string;
            code?: string;
            locale?: string;
            image?: string;
            directory?: string;
            sort_order?: number;
            status?: boolean;
        };
        lessThan?: {
            language_id?: number;
            name?: string;
            code?: string;
            locale?: string;
            image?: string;
            directory?: string;
            sort_order?: number;
            status?: boolean;
        };
        lessThanOrEqual?: {
            language_id?: number;
            name?: string;
            code?: string;
            locale?: string;
            image?: string;
            directory?: string;
            sort_order?: number;
            status?: boolean;
        };
    },
    $select?: (keyof oc_languageEntity)[],
    $sort?: string | (keyof oc_languageEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_languageEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_languageEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_languageRepository {

    private static readonly DEFINITION = {
        table: "oc_language",
        properties: [
            {
                name: "language_id",
                column: "language_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "name",
                column: "name",
                type: "VARCHAR",
                required: true
            },
            {
                name: "code",
                column: "code",
                type: "VARCHAR",
                required: true
            },
            {
                name: "locale",
                column: "locale",
                type: "VARCHAR",
                required: true
            },
            {
                name: "image",
                column: "image",
                type: "VARCHAR",
                required: true
            },
            {
                name: "directory",
                column: "directory",
                type: "VARCHAR",
                required: true
            },
            {
                name: "sort_order",
                column: "sort_order",
                type: "INT",
                required: true
            },
            {
                name: "status",
                column: "status",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_languageRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_languageEntityOptions): oc_languageEntity[] {
        return this.dao.list(options).map((e: oc_languageEntity) => {
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_languageEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_languageCreateEntity): number {
        EntityUtils.setBoolean(entity, "status");
        return this.dao.insert(entity);
    }

    public update(entity: oc_languageUpdateEntity): void {
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_languageCreateEntity | oc_languageUpdateEntity): number {
        const id = (entity as oc_languageUpdateEntity).language_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_languageUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_language"');
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