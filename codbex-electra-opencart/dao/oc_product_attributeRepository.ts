import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";

export interface oc_product_attributeEntity {
    readonly product_id: number;
    readonly attribute_id: number;
    readonly language_id: number;
    text: string;
}

export interface oc_product_attributeCreateEntity {
    readonly text: string;
}

export interface oc_product_attributeUpdateEntity extends oc_product_attributeCreateEntity {
    readonly product_id: number;
    readonly attribute_id: number;
    readonly language_id: number;
}

export interface oc_product_attributeEntityOptions {
    $filter?: {
        equals?: {
            product_id?: number | number[];
            attribute_id?: number | number[];
            language_id?: number | number[];
            text?: string | string[];
        };
        notEquals?: {
            product_id?: number | number[];
            attribute_id?: number | number[];
            language_id?: number | number[];
            text?: string | string[];
        };
        contains?: {
            product_id?: number;
            attribute_id?: number;
            language_id?: number;
            text?: string;
        };
        greaterThan?: {
            product_id?: number;
            attribute_id?: number;
            language_id?: number;
            text?: string;
        };
        greaterThanOrEqual?: {
            product_id?: number;
            attribute_id?: number;
            language_id?: number;
            text?: string;
        };
        lessThan?: {
            product_id?: number;
            attribute_id?: number;
            language_id?: number;
            text?: string;
        };
        lessThanOrEqual?: {
            product_id?: number;
            attribute_id?: number;
            language_id?: number;
            text?: string;
        };
    },
    $select?: (keyof oc_product_attributeEntity)[],
    $sort?: string | (keyof oc_product_attributeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_product_attributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_product_attributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_product_attributeRepository {

    private static readonly UPDATE_STATEMENT = "UPDATE `oc_product_attribute` SET `text` = ? WHERE (`product_id`=? AND `language_id`=? AND `attribute_id`=?)";

    private static readonly DEFINITION = {
        table: "oc_product_attribute",
        properties: [
            {
                name: "product_id",
                column: "product_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "attribute_id",
                column: "attribute_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "language_id",
                column: "language_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "text",
                column: "text",
                type: "TEXT",
                required: true
            }
        ]
    };

    private readonly dao;
    private readonly dataSourceName;


    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_product_attributeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_product_attributeEntityOptions): oc_product_attributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_product_attributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_product_attributeCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_product_attributeUpdateEntity): number {
        const params = [entity.text, entity.product_id, entity.language_id, entity.attribute_id];
        return update.execute(oc_product_attributeRepository.UPDATE_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_product_attributeCreateEntity | oc_product_attributeUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    product_id: entity.product_id,
                    language_id: entity.language_id,
                    attribute_id: entity.attribute_id
                }
            }
        };
        const entries = this.findAll(querySettings);
        if (entries.length > 0) {
            this.update(entity);
        } else {
            this.create(entity);
        }
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_product_attribute"');
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