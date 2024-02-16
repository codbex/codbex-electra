import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GroupEmployeeEntity {
    readonly Id: number;
    Employee?: number;
    Group?: number;
    UpdatedBy?: string;
    DateModified?: Date;
}

export interface GroupEmployeeCreateEntity {
    readonly Employee?: number;
    readonly Group?: number;
}

export interface GroupEmployeeUpdateEntity extends GroupEmployeeCreateEntity {
    readonly Id: number;
}

export interface GroupEmployeeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Group?: number | number[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Group?: number | number[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Employee?: number;
            Group?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            Employee?: number;
            Group?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Group?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            Employee?: number;
            Group?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Group?: number;
            UpdatedBy?: string;
            DateModified?: Date;
        };
    },
    $select?: (keyof GroupEmployeeEntity)[],
    $sort?: string | (keyof GroupEmployeeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GroupEmployeeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GroupEmployeeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class GroupEmployeeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GROUPEMPLOYEE",
        properties: [
            {
                name: "Id",
                column: "GROUPEMPLOYEE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Employee",
                column: "GROUPEMPLOYEE_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Group",
                column: "GROUPEMPLOYEE_GROUP",
                type: "INTEGER",
            },
            {
                name: "UpdatedBy",
                column: "GROUPEMPLOYEE_UPDATEDBY",
                type: "VARCHAR",
            },
            {
                name: "DateModified",
                column: "GROUPEMPLOYEE_DATEMODIFIED",
                type: "TIMESTAMP",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(GroupEmployeeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GroupEmployeeEntityOptions): GroupEmployeeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GroupEmployeeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GroupEmployeeCreateEntity): number {
        // @ts-ignore
        (entity as GroupEmployeeEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GROUPEMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPEMPLOYEE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GroupEmployeeUpdateEntity): void {
        // @ts-ignore
        (entity as GroupEmployeeEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GROUPEMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPEMPLOYEE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GroupEmployeeCreateEntity | GroupEmployeeUpdateEntity): number {
        const id = (entity as GroupEmployeeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GroupEmployeeUpdateEntity);
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
            table: "CODBEX_GROUPEMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "GROUPEMPLOYEE_ID",
                value: id
            }
        });
    }

    public count(options?: GroupEmployeeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: GroupEmployeeEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GROUPEMPLOYEE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GroupEmployeeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Access/GroupEmployee", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Access/GroupEmployee").send(JSON.stringify(data));
    }
}