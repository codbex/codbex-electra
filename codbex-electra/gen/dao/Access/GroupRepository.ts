import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GroupEntity {
    readonly Id: number;
    Name: string;
    UpdatedBy: string;
    DateModified: Date;
}

export interface GroupCreateEntity {
    readonly Name: string;
}

export interface GroupUpdateEntity extends GroupCreateEntity {
    readonly Id: number;
}

export interface GroupEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
    },
    $select?: (keyof GroupEntity)[],
    $sort?: string | (keyof GroupEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GroupEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GroupEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class GroupRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GROUP",
        properties: [
            {
                name: "Id",
                column: "GROUP_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "GROUP_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "UpdatedBy",
                column: "GROUP_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DateModified",
                column: "GROUP_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GroupRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GroupEntityOptions): GroupEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GroupEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GroupCreateEntity): number {
        // @ts-ignore
        (entity as GroupEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUP_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GroupUpdateEntity): void {
        // @ts-ignore
        (entity as GroupEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUP_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GroupCreateEntity | GroupUpdateEntity): number {
        const id = (entity as GroupUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GroupUpdateEntity);
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
            table: "CODBEX_GROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUP_ID",
                value: id
            }
        });
    }

    public count(options?: GroupEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GROUP"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GroupEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Access-Group", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Access-Group").send(JSON.stringify(data));
    }
}
