import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CurrencyEntity {
    readonly Id: number;
    Title: string;
    Status: number;
    Code: string;
    SymbolLeft?: string;
    SymbolRight?: string;
    DecimalPlace: string;
    Value: number;
    DateModified: Date;
}

export interface CurrencyCreateEntity {
    readonly Title: string;
    readonly Status: number;
    readonly Code: string;
    readonly SymbolLeft?: string;
    readonly SymbolRight?: string;
    readonly DecimalPlace: string;
    readonly Value: number;
}

export interface CurrencyUpdateEntity extends CurrencyCreateEntity {
    readonly Id: number;
}

export interface CurrencyEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Title?: string | string[];
            Status?: number | number[];
            Code?: string | string[];
            SymbolLeft?: string | string[];
            SymbolRight?: string | string[];
            DecimalPlace?: string | string[];
            Value?: number | number[];
            DateModified?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Title?: string | string[];
            Status?: number | number[];
            Code?: string | string[];
            SymbolLeft?: string | string[];
            SymbolRight?: string | string[];
            DecimalPlace?: string | string[];
            Value?: number | number[];
            DateModified?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Title?: string;
            Status?: number;
            Code?: string;
            SymbolLeft?: string;
            SymbolRight?: string;
            DecimalPlace?: string;
            Value?: number;
            DateModified?: Date;
        };
        greaterThan?: {
            Id?: number;
            Title?: string;
            Status?: number;
            Code?: string;
            SymbolLeft?: string;
            SymbolRight?: string;
            DecimalPlace?: string;
            Value?: number;
            DateModified?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Title?: string;
            Status?: number;
            Code?: string;
            SymbolLeft?: string;
            SymbolRight?: string;
            DecimalPlace?: string;
            Value?: number;
            DateModified?: Date;
        };
        lessThan?: {
            Id?: number;
            Title?: string;
            Status?: number;
            Code?: string;
            SymbolLeft?: string;
            SymbolRight?: string;
            DecimalPlace?: string;
            Value?: number;
            DateModified?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Title?: string;
            Status?: number;
            Code?: string;
            SymbolLeft?: string;
            SymbolRight?: string;
            DecimalPlace?: string;
            Value?: number;
            DateModified?: Date;
        };
    },
    $select?: (keyof CurrencyEntity)[],
    $sort?: string | (keyof CurrencyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CurrencyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CurrencyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CurrencyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CURRENCY",
        properties: [
            {
                name: "Id",
                column: "CURRENCY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Title",
                column: "CURRENCY_TITLE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Status",
                column: "CURRENCY_STATUS",
                type: "INTEGER",
                required: true
            },
            {
                name: "Code",
                column: "CURRENCY_CODE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "SymbolLeft",
                column: "CURRENCY_SYMBOLLEFT",
                type: "VARCHAR",
            },
            {
                name: "SymbolRight",
                column: "CURRENCY_SYMBOLRIGHT",
                type: "VARCHAR",
            },
            {
                name: "DecimalPlace",
                column: "CURRENCY_DECIMALPLACE",
                type: "CHAR",
                required: true
            },
            {
                name: "Value",
                column: "CURRENCY_VALUE",
                type: "DOUBLE",
                required: true
            },
            {
                name: "DateModified",
                column: "CURRENCY_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CurrencyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CurrencyEntityOptions): CurrencyEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CurrencyEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CurrencyCreateEntity): number {
        // @ts-ignore
        (entity as CurrencyEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CurrencyUpdateEntity): void {
        // @ts-ignore
        (entity as CurrencyEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CurrencyCreateEntity | CurrencyUpdateEntity): number {
        const id = (entity as CurrencyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CurrencyUpdateEntity);
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
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: id
            }
        });
    }

    public count(options?: CurrencyEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CurrencyEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-currencies-Currency", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-currencies-Currency").send(JSON.stringify(data));
    }
}
