import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_manufacturerEntity {
    readonly manufacturer_id: number;
    name: string;
    image?: string;
    sort_order: number;
}

export interface oc_manufacturerCreateEntity {
    readonly name: string;
    readonly image?: string;
    readonly sort_order: number;
}

export interface oc_manufacturerUpdateEntity extends oc_manufacturerCreateEntity {
    readonly manufacturer_id: number;
}

export interface oc_manufacturerEntityOptions {
    $filter?: {
        equals?: {
            manufacturer_id?: number | number[];
            name?: string | string[];
            image?: string | string[];
            sort_order?: number | number[];
        };
        notEquals?: {
            manufacturer_id?: number | number[];
            name?: string | string[];
            image?: string | string[];
            sort_order?: number | number[];
        };
        contains?: {
            manufacturer_id?: number;
            name?: string;
            image?: string;
            sort_order?: number;
        };
        greaterThan?: {
            manufacturer_id?: number;
            name?: string;
            image?: string;
            sort_order?: number;
        };
        greaterThanOrEqual?: {
            manufacturer_id?: number;
            name?: string;
            image?: string;
            sort_order?: number;
        };
        lessThan?: {
            manufacturer_id?: number;
            name?: string;
            image?: string;
            sort_order?: number;
        };
        lessThanOrEqual?: {
            manufacturer_id?: number;
            name?: string;
            image?: string;
            sort_order?: number;
        };
    },
    $select?: (keyof oc_manufacturerEntity)[],
    $sort?: string | (keyof oc_manufacturerEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_manufacturerEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_manufacturerEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_manufacturerRepository {

    private static readonly DEFINITION = {
        table: "oc_manufacturer",
        properties: [
            {
                name: "manufacturer_id",
                column: "manufacturer_id",
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
                name: "image",
                column: "image",
                type: "VARCHAR",
            },
            {
                name: "sort_order",
                column: "sort_order",
                type: "INT",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_manufacturerRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_manufacturerEntityOptions): oc_manufacturerEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_manufacturerEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_manufacturerCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_manufacturerUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_manufacturerCreateEntity | oc_manufacturerUpdateEntity): number {
        const id = (entity as oc_manufacturerUpdateEntity).manufacturer_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_manufacturerUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_manufacturer"');
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