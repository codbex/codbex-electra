import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface EmployeeStatusEntity {
    readonly Id: number;
    Name: string;
}

export interface EmployeeStatusCreateEntity {
    readonly Name: string;
}

export interface EmployeeStatusUpdateEntity extends EmployeeStatusCreateEntity {
    readonly Id: number;
}

export interface EmployeeStatusEntityOptions {
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
    $select?: (keyof EmployeeStatusEntity)[],
    $sort?: string | (keyof EmployeeStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeeStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeeStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class EmployeeStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EMPLOYEESTATUS",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "EMPLOYEESTATUS_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(EmployeeStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeeStatusEntityOptions): EmployeeStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): EmployeeStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: EmployeeStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EMPLOYEESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeeStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EMPLOYEESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeeStatusCreateEntity | EmployeeStatusUpdateEntity): number {
        const id = (entity as EmployeeStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeeStatusUpdateEntity);
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
            table: "CODBEX_EMPLOYEESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEESTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeeStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: EmployeeStatusEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EMPLOYEESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeeStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/EmployeeStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/EmployeeStatus").send(JSON.stringify(data));
    }
}