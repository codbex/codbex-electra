import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CategoryEntity {
    readonly Id: number;
    Name: string;
    Status: boolean;
    Image?: string;
    DateAdded?: Date;
    DateModified: Date;
}

export interface CategoryCreateEntity {
    readonly Name: string;
    readonly Status: boolean;
    readonly Image?: string;
}

export interface CategoryUpdateEntity extends CategoryCreateEntity {
    readonly Id: number;
}

export interface CategoryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Status?: boolean | boolean[];
            Image?: string | string[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Status?: boolean | boolean[];
            Image?: string | string[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Status?: boolean;
            Image?: string;
            DateAdded?: Date;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Status?: boolean;
            Image?: string;
            DateAdded?: Date;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Status?: boolean;
            Image?: string;
            DateAdded?: Date;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Status?: boolean;
            Image?: string;
            DateAdded?: Date;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Status?: boolean;
            Image?: string;
            DateAdded?: Date;
            DateModified?: Date;
        };
    },
    $select?: (keyof CategoryEntity)[],
    $sort?: string | (keyof CategoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CATEGORY",
        properties: [
            {
                name: "Id",
                column: "CATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Name",
                column: "CATEGORY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Status",
                column: "CATEGORY_STATUS",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "Image",
                column: "CATEGORY_IMAGE",
                type: "VARCHAR",
            },
            {
                name: "DateAdded",
                column: "CATEGORY_DATEADDED",
                type: "TIMESTAMP",
            },
            {
                name: "DateModified",
                column: "CATEGORY_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CategoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CategoryEntityOptions): CategoryEntity[] {
        return this.dao.list(options).map((e: CategoryEntity) => {
            EntityUtils.setBoolean(e, "Status");
            return e;
        });
    }

    public findById(id: number): CategoryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Status");
        return entity ?? undefined;
    }

    public create(entity: CategoryCreateEntity): number {
        EntityUtils.setBoolean(entity, "Status");
        // @ts-ignore
        (entity as CategoryEntity).DateAdded = Date.now();
        // @ts-ignore
        (entity as CategoryEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CategoryUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Status");
        // @ts-ignore
        (entity as CategoryEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CategoryCreateEntity | CategoryUpdateEntity): number {
        const id = (entity as CategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CategoryUpdateEntity);
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
            table: "CODBEX_CATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORY_ID",
                value: id
            }
        });
    }

    public count(options?: CategoryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CategoryEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Product Categories-Category", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Product Categories-Category").send(JSON.stringify(data));
    }
}
