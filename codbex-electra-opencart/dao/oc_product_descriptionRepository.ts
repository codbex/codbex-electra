import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";

export interface oc_product_descriptionEntity {
    readonly product_id: number;
    readonly language_id: number;
    name: string;
    description: string;
    tag: string;
    meta_title: string;
    meta_description: string;
    meta_keyword: string;
}

export interface oc_product_descriptionCreateEntity {
    readonly name: string;
    readonly description: string;
    readonly tag: string;
    readonly meta_title: string;
    readonly meta_description: string;
    readonly meta_keyword: string;
}

export interface oc_product_descriptionUpdateEntity extends oc_product_descriptionCreateEntity {
    readonly product_id: number;
    readonly language_id: number;
}

export interface oc_product_descriptionEntityOptions {
    $filter?: {
        equals?: {
            product_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
            description?: string | string[];
            tag?: string | string[];
            meta_title?: string | string[];
            meta_description?: string | string[];
            meta_keyword?: string | string[];
        };
        notEquals?: {
            product_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
            description?: string | string[];
            tag?: string | string[];
            meta_title?: string | string[];
            meta_description?: string | string[];
            meta_keyword?: string | string[];
        };
        contains?: {
            product_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            tag?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        greaterThan?: {
            product_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            tag?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        greaterThanOrEqual?: {
            product_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            tag?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        lessThan?: {
            product_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            tag?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        lessThanOrEqual?: {
            product_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            tag?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
    },
    $select?: (keyof oc_product_descriptionEntity)[],
    $sort?: string | (keyof oc_product_descriptionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_product_descriptionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_product_descriptionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_product_descriptionRepository {

    private static readonly UPDATE_STATEMENT = "UPDATE `oc_product_description` SET `name` = ?, `description` = ?, `tag` = ?, `meta_title` = ?, `meta_description` = ?, `meta_keyword` = ? WHERE (`product_id`=? AND `language_id` = ?)";

    private static readonly DEFINITION = {
        table: "oc_product_description",
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
                name: "language_id",
                column: "language_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "name",
                column: "name",
                type: "VARCHAR",
                required: true
            },
            {
                name: "description",
                column: "description",
                type: "TEXT",
                required: true
            },
            {
                name: "tag",
                column: "tag",
                type: "TEXT",
                required: true
            },
            {
                name: "meta_title",
                column: "meta_title",
                type: "VARCHAR",
                required: true
            },
            {
                name: "meta_description",
                column: "meta_description",
                type: "VARCHAR",
                required: true
            },
            {
                name: "meta_keyword",
                column: "meta_keyword",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;
    private readonly dataSourceName;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_product_descriptionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_product_descriptionEntityOptions): oc_product_descriptionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_product_descriptionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_product_descriptionCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_product_descriptionUpdateEntity): number {
        const params = [entity.name, entity.description, entity.tag,
        entity.meta_title, entity.meta_description, entity.meta_keyword,
        entity.product_id, entity.language_id
        ];
        return update.execute(oc_product_descriptionRepository.UPDATE_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_product_descriptionCreateEntity | oc_product_descriptionUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    product_id: entity.product_id,
                    language_id: entity.language_id
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_product_description"');
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