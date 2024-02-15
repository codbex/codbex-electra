import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_category_pathEntity {
    readonly category_id: number;
    readonly path_id: number;
    level: number;
}

export interface oc_category_pathCreateEntity {
    readonly level: number;
}

export interface oc_category_pathUpdateEntity extends oc_category_pathCreateEntity {
    readonly category_id: number;
    readonly path_id: number;
}

export interface oc_category_pathEntityOptions {
    $filter?: {
        equals?: {
            category_id?: number | number[];
            path_id?: number | number[];
            level?: number | number[];
        };
        notEquals?: {
            category_id?: number | number[];
            path_id?: number | number[];
            level?: number | number[];
        };
        contains?: {
            category_id?: number;
            path_id?: number;
            level?: number;
        };
        greaterThan?: {
            category_id?: number;
            path_id?: number;
            level?: number;
        };
        greaterThanOrEqual?: {
            category_id?: number;
            path_id?: number;
            level?: number;
        };
        lessThan?: {
            category_id?: number;
            path_id?: number;
            level?: number;
        };
        lessThanOrEqual?: {
            category_id?: number;
            path_id?: number;
            level?: number;
        };
    },
    $select?: (keyof oc_category_pathEntity)[],
    $sort?: string | (keyof oc_category_pathEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_category_pathEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_category_pathEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_category_pathRepository {

    private static readonly DEFINITION = {
        table: "oc_category_path",
        properties: [
            {
                name: "category_id",
                column: "category_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "path_id",
                column: "path_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "level",
                column: "level",
                type: "INT",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_category_pathRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_category_pathEntityOptions): oc_category_pathEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_category_pathEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_category_pathCreateEntity): number {
        return this.dao.insert(entity);

    }

    public update(entity: oc_category_pathUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_category_pathCreateEntity | oc_category_pathUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    category_id: entity.category_id,
                    path_id: entity.path_id
                }
            }
        };
        const entries = this.findAll(querySettings);
        if (entries.length === 0) {
            this.create(entity);
        }
        // update not needed in this case
    }
    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_category_path"');
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