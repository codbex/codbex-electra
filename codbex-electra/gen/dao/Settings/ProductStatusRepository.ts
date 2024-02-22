import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductStatusEntity {
    readonly Id: number;
    Name: string;
}

export interface ProductStatusCreateEntity {
    readonly Name: string;
}

export interface ProductStatusUpdateEntity extends ProductStatusCreateEntity {
    readonly Id: number;
}

export interface ProductStatusEntityOptions {
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
    $select?: (keyof ProductStatusEntity)[],
    $sort?: string | (keyof ProductStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTSTATUS",
        properties: [
            {
                name: "Id",
                column: "PRODUCTSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCTSTATUS_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProductStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductStatusEntityOptions): ProductStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductStatusCreateEntity | ProductStatusUpdateEntity): number {
        const id = (entity as ProductStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductStatusUpdateEntity);
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
            table: "CODBEX_PRODUCTSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: ProductStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: ProductStatusEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/ProductStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/ProductStatus").send(JSON.stringify(data));
    }
}