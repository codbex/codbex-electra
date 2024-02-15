import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";

export interface oc_order_statusEntity {
    readonly order_status_id: number;
    readonly language_id: number;
    name: string;
}

export interface oc_order_statusCreateEntity {
    readonly name: string;
}

export interface oc_order_statusUpdateEntity extends oc_order_statusCreateEntity {
    readonly order_status_id: number;
    readonly language_id: number;
}

export interface oc_order_statusEntityOptions {
    $filter?: {
        equals?: {
            order_status_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
        };
        notEquals?: {
            order_status_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
        };
        contains?: {
            order_status_id?: number;
            language_id?: number;
            name?: string;
        };
        greaterThan?: {
            order_status_id?: number;
            language_id?: number;
            name?: string;
        };
        greaterThanOrEqual?: {
            order_status_id?: number;
            language_id?: number;
            name?: string;
        };
        lessThan?: {
            order_status_id?: number;
            language_id?: number;
            name?: string;
        };
        lessThanOrEqual?: {
            order_status_id?: number;
            language_id?: number;
            name?: string;
        };
    },
    $select?: (keyof oc_order_statusEntity)[],
    $sort?: string | (keyof oc_order_statusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_order_statusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_order_statusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_order_statusRepository {

    private static readonly UPDATE_STATEMENT = "UPDATE `oc_order_status` SET `name` = ? WHERE (`order_status_id` = ?  AND `language_id` = ?)";

    private static readonly DEFINITION = {
        table: "oc_order_status",
        properties: [
            {
                name: "order_status_id",
                column: "order_status_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
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
            }
        ]
    };

    private readonly dao;
    private readonly dataSourceName;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_order_statusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_order_statusEntityOptions): oc_order_statusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_order_statusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_order_statusCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_order_statusUpdateEntity): void {
        const params = [entity.name, entity.order_status_id, entity.language_id];
        update.execute(oc_order_statusRepository.UPDATE_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_order_statusCreateEntity | oc_order_statusUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    order_status_id: entity.order_status_id,
                    language_id: entity.language_id
                }
            }
        };
        const entries = this.findAll(querySettings);
        if (entries.length === 0) {
            return this.create(entity);
        } else {
            this.update(entity);
            return entity.order_status_id;
        }
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_order_status"');
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