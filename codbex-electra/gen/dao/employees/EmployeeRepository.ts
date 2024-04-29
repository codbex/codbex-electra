import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface EmployeeEntity {
    readonly Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    Status: number;
    Image?: string;
    Code?: string;
    UpdatedBy: string;
    DateModified: Date;
}

export interface EmployeeCreateEntity {
    readonly FirstName: string;
    readonly LastName: string;
    readonly Email: string;
    readonly Status: number;
    readonly Image?: string;
    readonly Code?: string;
}

export interface EmployeeUpdateEntity extends EmployeeCreateEntity {
    readonly Id: number;
}

export interface EmployeeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Email?: string | string[];
            Status?: number | number[];
            Image?: string | string[];
            Code?: string | string[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            FirstName?: string | string[];
            LastName?: string | string[];
            Email?: string | string[];
            Status?: number | number[];
            Image?: string | string[];
            Code?: string | string[];
            UpdatedBy?: string | string[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            FirstName?: string;
            LastName?: string;
            Email?: string;
            Status?: number;
            Image?: string;
            Code?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            FirstName?: string;
            LastName?: string;
            Email?: string;
            Status?: number;
            Image?: string;
            Code?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            FirstName?: string;
            LastName?: string;
            Email?: string;
            Status?: number;
            Image?: string;
            Code?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            FirstName?: string;
            LastName?: string;
            Email?: string;
            Status?: number;
            Image?: string;
            Code?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            FirstName?: string;
            LastName?: string;
            Email?: string;
            Status?: number;
            Image?: string;
            Code?: string;
            UpdatedBy?: string;
            DateModified?: Date;
        };
    },
    $select?: (keyof EmployeeEntity)[],
    $sort?: string | (keyof EmployeeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class EmployeeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EMPLOYEE",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "FirstName",
                column: "EMPLOYEE_FIRSTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "LastName",
                column: "EMPLOYEE_LASTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Email",
                column: "EMPLOYEE_EMAIL",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Status",
                column: "EMPLOYEE_STATUS",
                type: "INTEGER",
                required: true
            },
            {
                name: "Image",
                column: "EMPLOYEE_IMAGE",
                type: "VARCHAR",
            },
            {
                name: "Code",
                column: "EMPLOYEE_CODE",
                type: "VARCHAR",
            },
            {
                name: "UpdatedBy",
                column: "EMPLOYEE_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DateModified",
                column: "EMPLOYEE_DATEADDED",
                type: "TIMESTAMP",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EmployeeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeeEntityOptions): EmployeeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): EmployeeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: EmployeeCreateEntity): number {
        // @ts-ignore
        (entity as EmployeeEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as EmployeeEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeeUpdateEntity): void {
        // @ts-ignore
        (entity as EmployeeEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as EmployeeEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeeCreateEntity | EmployeeUpdateEntity): number {
        const id = (entity as EmployeeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeeUpdateEntity);
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
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EMPLOYEE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-employees-Employee", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-employees-Employee").send(JSON.stringify(data));
    }
}
