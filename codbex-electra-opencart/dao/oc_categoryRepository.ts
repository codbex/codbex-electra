import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_categoryEntity {
    readonly category_id: number;
    image?: string;
    readonly parent_id: number;
    top: boolean;
    column: number;
    sort_order: number;
    status: boolean;
    date_added: Date;
    date_modified: Date;
}

export interface oc_categoryCreateEntity {
    readonly image?: string;
    readonly top: boolean;
    readonly column: number;
    readonly sort_order: number;
    readonly status: boolean;
    readonly date_added: Date;
    readonly date_modified: Date;
}

export interface oc_categoryUpdateEntity extends oc_categoryCreateEntity {
    readonly category_id: number;
    readonly parent_id: number;
}

export interface oc_categoryEntityOptions {
    $filter?: {
        equals?: {
            category_id?: number | number[];
            image?: string | string[];
            parent_id?: number | number[];
            top?: boolean | boolean[];
            column?: number | number[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
            date_added?: Date | Date[];
            date_modified?: Date | Date[];
        };
        notEquals?: {
            category_id?: number | number[];
            image?: string | string[];
            parent_id?: number | number[];
            top?: boolean | boolean[];
            column?: number | number[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
            date_added?: Date | Date[];
            date_modified?: Date | Date[];
        };
        contains?: {
            category_id?: number;
            image?: string;
            parent_id?: number;
            top?: boolean;
            column?: number;
            sort_order?: number;
            status?: boolean;
            date_added?: Date;
            date_modified?: Date;
        };
        greaterThan?: {
            category_id?: number;
            image?: string;
            parent_id?: number;
            top?: boolean;
            column?: number;
            sort_order?: number;
            status?: boolean;
            date_added?: Date;
            date_modified?: Date;
        };
        greaterThanOrEqual?: {
            category_id?: number;
            image?: string;
            parent_id?: number;
            top?: boolean;
            column?: number;
            sort_order?: number;
            status?: boolean;
            date_added?: Date;
            date_modified?: Date;
        };
        lessThan?: {
            category_id?: number;
            image?: string;
            parent_id?: number;
            top?: boolean;
            column?: number;
            sort_order?: number;
            status?: boolean;
            date_added?: Date;
            date_modified?: Date;
        };
        lessThanOrEqual?: {
            category_id?: number;
            image?: string;
            parent_id?: number;
            top?: boolean;
            column?: number;
            sort_order?: number;
            status?: boolean;
            date_added?: Date;
            date_modified?: Date;
        };
    },
    $select?: (keyof oc_categoryEntity)[],
    $sort?: string | (keyof oc_categoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_categoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_categoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_categoryRepository {

    private static readonly DEFINITION = {
        table: "oc_category",
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
                name: "image",
                column: "image",
                type: "VARCHAR",
            },
            {
                name: "parent_id",
                column: "parent_id",
                type: "INT",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "top",
                column: "top",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "column",
                column: "column",
                type: "INT",
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
            },
            {
                name: "date_added",
                column: "date_added",
                type: "DATETIME",
                required: true
            },
            {
                name: "date_modified",
                column: "date_modified",
                type: "DATETIME",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_categoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_categoryEntityOptions): oc_categoryEntity[] {
        return this.dao.list(options).map((e: oc_categoryEntity) => {
            EntityUtils.setBoolean(e, "top");
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_categoryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "top");
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_categoryCreateEntity): number {
        EntityUtils.setBoolean(entity, "top");
        EntityUtils.setBoolean(entity, "status");
        return this.dao.insert(entity);
    }

    public update(entity: oc_categoryUpdateEntity): void {
        EntityUtils.setBoolean(entity, "top");
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_categoryCreateEntity | oc_categoryUpdateEntity): number {
        const id = (entity as oc_categoryUpdateEntity).category_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_categoryUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_category"');
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