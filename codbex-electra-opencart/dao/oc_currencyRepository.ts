import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_currencyEntity {
    readonly currency_id: number;
    title: string;
    code: string;
    symbol_left: string;
    symbol_right: string;
    decimal_place: string;
    value: number;
    status: boolean;
    date_modified: Date;
}

export interface oc_currencyCreateEntity {
    readonly title: string;
    readonly code: string;
    readonly symbol_left: string;
    readonly symbol_right: string;
    readonly decimal_place: string;
    readonly value: number;
    readonly status: boolean;
    readonly date_modified: Date;
}

export interface oc_currencyUpdateEntity extends oc_currencyCreateEntity {
    readonly currency_id: number;
}

export interface oc_currencyEntityOptions {
    $filter?: {
        equals?: {
            currency_id?: number | number[];
            title?: string | string[];
            code?: string | string[];
            symbol_left?: string | string[];
            symbol_right?: string | string[];
            decimal_place?: string | string[];
            value?: number | number[];
            status?: boolean | boolean[];
            date_modified?: Date | Date[];
        };
        notEquals?: {
            currency_id?: number | number[];
            title?: string | string[];
            code?: string | string[];
            symbol_left?: string | string[];
            symbol_right?: string | string[];
            decimal_place?: string | string[];
            value?: number | number[];
            status?: boolean | boolean[];
            date_modified?: Date | Date[];
        };
        contains?: {
            currency_id?: number;
            title?: string;
            code?: string;
            symbol_left?: string;
            symbol_right?: string;
            decimal_place?: string;
            value?: number;
            status?: boolean;
            date_modified?: Date;
        };
        greaterThan?: {
            currency_id?: number;
            title?: string;
            code?: string;
            symbol_left?: string;
            symbol_right?: string;
            decimal_place?: string;
            value?: number;
            status?: boolean;
            date_modified?: Date;
        };
        greaterThanOrEqual?: {
            currency_id?: number;
            title?: string;
            code?: string;
            symbol_left?: string;
            symbol_right?: string;
            decimal_place?: string;
            value?: number;
            status?: boolean;
            date_modified?: Date;
        };
        lessThan?: {
            currency_id?: number;
            title?: string;
            code?: string;
            symbol_left?: string;
            symbol_right?: string;
            decimal_place?: string;
            value?: number;
            status?: boolean;
            date_modified?: Date;
        };
        lessThanOrEqual?: {
            currency_id?: number;
            title?: string;
            code?: string;
            symbol_left?: string;
            symbol_right?: string;
            decimal_place?: string;
            value?: number;
            status?: boolean;
            date_modified?: Date;
        };
    },
    $select?: (keyof oc_currencyEntity)[],
    $sort?: string | (keyof oc_currencyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_currencyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_currencyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_currencyRepository {

    private static readonly DEFINITION = {
        table: "oc_currency",
        properties: [
            {
                name: "currency_id",
                column: "currency_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "title",
                column: "title",
                type: "VARCHAR",
                required: true
            },
            {
                name: "code",
                column: "code",
                type: "VARCHAR",
                required: true
            },
            {
                name: "symbol_left",
                column: "symbol_left",
                type: "VARCHAR",
                required: true
            },
            {
                name: "symbol_right",
                column: "symbol_right",
                type: "VARCHAR",
                required: true
            },
            {
                name: "decimal_place",
                column: "decimal_place",
                type: "CHAR",
                required: true
            },
            {
                name: "value",
                column: "value",
                type: "DOUBLE",
                required: true
            },
            {
                name: "status",
                column: "status",
                type: "BOOLEAN",
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

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_currencyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_currencyEntityOptions): oc_currencyEntity[] {
        return this.dao.list(options).map((e: oc_currencyEntity) => {
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_currencyEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_currencyCreateEntity): number {
        EntityUtils.setBoolean(entity, "status");
        return this.dao.insert(entity);
    }

    public update(entity: oc_currencyUpdateEntity): void {
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_currencyCreateEntity | oc_currencyUpdateEntity): number {
        const id = (entity as oc_currencyUpdateEntity).currency_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_currencyUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_currency"');
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