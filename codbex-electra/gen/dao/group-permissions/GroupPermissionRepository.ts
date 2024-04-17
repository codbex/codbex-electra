import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GroupPermissionEntity {
    readonly Id: number;
    Group: number;
    Permission: number;
    UpdatedBy: string;
    DateModified: Date;
}

export interface GroupPermissionCreateEntity {
    readonly Group: number;
    readonly Permission: number;
}

export interface GroupPermissionUpdateEntity extends GroupPermissionCreateEntity {
    readonly Id: number;
}

export interface GroupPermissionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Group?: number | number[];
            Permission?: number | number[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Group?: number | number[];
            Permission?: number | number[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Group?: number;
            Permission?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            Group?: number;
            Permission?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Group?: number;
            Permission?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            Group?: number;
            Permission?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Group?: number;
            Permission?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
    },
    $select?: (keyof GroupPermissionEntity)[],
    $sort?: string | (keyof GroupPermissionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GroupPermissionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GroupPermissionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class GroupPermissionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GROUPPERMISSION",
        properties: [
            {
                name: "Id",
                column: "GROUPPERMISSION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Group",
                column: "GROUPPERMISSION_GROUP",
                type: "INTEGER",
                required: true
            },
            {
                name: "Permission",
                column: "GROUPPERMISSION_PERMISSION",
                type: "INTEGER",
                required: true
            },
            {
                name: "UpdatedBy",
                column: "GROUPPERMISSION_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DateModified",
                column: "GROUPPERMISSION_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GroupPermissionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GroupPermissionEntityOptions): GroupPermissionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GroupPermissionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GroupPermissionCreateEntity): number {
        // @ts-ignore
        (entity as GroupPermissionEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as GroupPermissionEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GROUPPERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPPERMISSION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GroupPermissionUpdateEntity): void {
        // @ts-ignore
        (entity as GroupPermissionEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as GroupPermissionEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GROUPPERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPPERMISSION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GroupPermissionCreateEntity | GroupPermissionUpdateEntity): number {
        const id = (entity as GroupPermissionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GroupPermissionUpdateEntity);
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
            table: "CODBEX_GROUPPERMISSION",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPPERMISSION_ID",
                value: id
            }
        });
    }

    public count(options?: GroupPermissionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GROUPPERMISSION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GroupPermissionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-group-permissions-GroupPermission", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-group-permissions-GroupPermission").send(JSON.stringify(data));
    }
}
