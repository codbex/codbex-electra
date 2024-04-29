import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PermissionEntity {
    readonly Id: number;
    Name: string;
}

export interface PermissionCreateEntity {
    readonly Name: string;
}

export interface PermissionUpdateEntity extends PermissionCreateEntity {
    readonly Id: number;
}

export interface PermissionEntityOptions {
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
    $select?: (keyof PermissionEntity)[],
    $sort?: string | (keyof PermissionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PermissionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PermissionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PermissionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PERMISSION",
        properties: [
            {
                name: "Id",
                column: "PERMISSION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PERMISSION_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PermissionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PermissionEntityOptions): PermissionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PermissionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PermissionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "PERMISSION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PermissionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "PERMISSION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PermissionCreateEntity | PermissionUpdateEntity): number {
        const id = (entity as PermissionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PermissionUpdateEntity);
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
            table: "CODBEX_PERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "PERMISSION_ID",
                value: id
            }
        });
    }

    public count(options?: PermissionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PERMISSION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PermissionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-permissions-Permission", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-permissions-Permission").send(JSON.stringify(data));
    }
}
