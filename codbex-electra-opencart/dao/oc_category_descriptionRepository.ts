import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";

export interface oc_category_descriptionEntity {
    readonly category_id: number;
    readonly language_id: number;
    name: string;
    description: string;
    meta_title: string;
    meta_description: string;
    meta_keyword: string;
}

export interface oc_category_descriptionCreateEntity {
    readonly name: string;
    readonly description: string;
    readonly meta_title: string;
    readonly meta_description: string;
    readonly meta_keyword: string;
}

export interface oc_category_descriptionUpdateEntity extends oc_category_descriptionCreateEntity {
    readonly category_id: number;
    readonly language_id: number;
}

export interface oc_category_descriptionEntityOptions {
    $filter?: {
        equals?: {
            category_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
            description?: string | string[];
            meta_title?: string | string[];
            meta_description?: string | string[];
            meta_keyword?: string | string[];
        };
        notEquals?: {
            category_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
            description?: string | string[];
            meta_title?: string | string[];
            meta_description?: string | string[];
            meta_keyword?: string | string[];
        };
        contains?: {
            category_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        greaterThan?: {
            category_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        greaterThanOrEqual?: {
            category_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        lessThan?: {
            category_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
        lessThanOrEqual?: {
            category_id?: number;
            language_id?: number;
            name?: string;
            description?: string;
            meta_title?: string;
            meta_description?: string;
            meta_keyword?: string;
        };
    },
    $select?: (keyof oc_category_descriptionEntity)[],
    $sort?: string | (keyof oc_category_descriptionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_category_descriptionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_category_descriptionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_category_descriptionRepository {

    private static readonly UPDATE_STATEMENT = "UPDATE `oc_category_description` SET `name` = ?, `description` = ?, `meta_title` = ?, `meta_description` = ?, `meta_keyword` = ? WHERE (`category_id` = ? AND `language_id` = ?)";

    private static readonly DEFINITION = {
        table: "oc_category_description",
        properties: [
            {
                name: "category_id",
                column: "category_id",
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

    private readonly dataSourceName;
    private readonly dao;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_category_descriptionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_category_descriptionEntityOptions): oc_category_descriptionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_category_descriptionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_category_descriptionCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_category_descriptionUpdateEntity): number {
        const params = [entity.name, entity.description,
        entity.meta_title, entity.meta_description, entity.meta_keyword,
        entity.category_id, entity.language_id
        ];
        return update.execute(oc_category_descriptionRepository.UPDATE_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_category_descriptionCreateEntity | oc_category_descriptionUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    category_id: entity.category_id,
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_category_description"');
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