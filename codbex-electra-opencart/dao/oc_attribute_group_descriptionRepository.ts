import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";

export interface oc_attribute_group_descriptionEntity {
    readonly attribute_group_id: number;
    readonly language_id: number;
    name: string;
}

export interface oc_attribute_group_descriptionCreateEntity {
    readonly name: string;
}

export interface oc_attribute_group_descriptionUpdateEntity extends oc_attribute_group_descriptionCreateEntity {
    readonly attribute_group_id: number;
    readonly language_id: number;
}

export interface oc_attribute_group_descriptionEntityOptions {
    $filter?: {
        equals?: {
            attribute_group_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
        };
        notEquals?: {
            attribute_group_id?: number | number[];
            language_id?: number | number[];
            name?: string | string[];
        };
        contains?: {
            attribute_group_id?: number;
            language_id?: number;
            name?: string;
        };
        greaterThan?: {
            attribute_group_id?: number;
            language_id?: number;
            name?: string;
        };
        greaterThanOrEqual?: {
            attribute_group_id?: number;
            language_id?: number;
            name?: string;
        };
        lessThan?: {
            attribute_group_id?: number;
            language_id?: number;
            name?: string;
        };
        lessThanOrEqual?: {
            attribute_group_id?: number;
            language_id?: number;
            name?: string;
        };
    },
    $select?: (keyof oc_attribute_group_descriptionEntity)[],
    $sort?: string | (keyof oc_attribute_group_descriptionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_attribute_group_descriptionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_attribute_group_descriptionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_attribute_group_descriptionRepository {

    private static readonly UPDATE_STATEMENT = "UPDATE `oc_attribute_group_description` SET `name` = ? WHERE (`attribute_group_id`=? AND `language_id` = ?)";

    private static readonly DEFINITION = {
        table: "oc_attribute_group_description",
        properties: [
            {
                name: "attribute_group_id",
                column: "attribute_group_id",
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
            }
        ]
    };

    private readonly dao;
    private readonly dataSourceName;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_attribute_group_descriptionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_attribute_group_descriptionEntityOptions): oc_attribute_group_descriptionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_attribute_group_descriptionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_attribute_group_descriptionCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_attribute_group_descriptionUpdateEntity): number {
        const params = [entity.name, entity.attribute_group_id, entity.language_id];
        return update.execute(oc_attribute_group_descriptionRepository.UPDATE_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_attribute_group_descriptionCreateEntity | oc_attribute_group_descriptionUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    attribute_group_id: entity.attribute_group_id,
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_attribute_group_description"');
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