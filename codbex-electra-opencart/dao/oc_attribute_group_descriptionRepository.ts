import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

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
        value: number;
    }
}

export class oc_attribute_group_descriptionRepository {

    private static readonly DEFINITION = {
        table: "oc_attribute_group_description",
        properties: [
            {
                name: "attribute_group_id",
                column: "attribute_group_id",
                type: "INT",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "language_id",
                column: "language_id",
                type: "INT",
                id: true,
                autoIncrement: true,
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

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_attribute_group_descriptionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_attribute_group_descriptionEntityOptions): oc_attribute_group_descriptionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_attribute_group_descriptionEntity | undefined {
    public findById(id: number): oc_attribute_group_descriptionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_attribute_group_descriptionCreateEntity): number {
    public create(entity: oc_attribute_group_descriptionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "oc_attribute_group_description",
            entity: entity,
            key: {
                name: "attribute_group_id",
                column: "attribute_group_id",
                value: id
                name: "language_id",
                column: "language_id",
                value: id
            }
        });
        return id;
    }

    public update(entity: oc_attribute_group_descriptionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "oc_attribute_group_description",
            entity: entity,
            key: {
                name: "attribute_group_id",
                column: "attribute_group_id",
                value: entity.attribute_group_id
                name: "language_id",
                column: "language_id",
                value: entity.language_id
            }
        });
    }

    public upsert(entity: oc_attribute_group_descriptionCreateEntity | oc_attribute_group_descriptionUpdateEntity): number {
    public upsert(entity: oc_attribute_group_descriptionCreateEntity | oc_attribute_group_descriptionUpdateEntity): number {
        const id = (entity as oc_attribute_group_descriptionUpdateEntity).attribute_group_idlanguage_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_attribute_group_descriptionUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "oc_attribute_group_description",
            entity: entity,
            key: {
                name: "attribute_group_id",
                column: "attribute_group_id",
                value: id
                name: "language_id",
                column: "language_id",
                value: id
            }
        });
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

    private async triggerEvent(data: oc_attribute_group_descriptionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("DemoStoreOpenCartDB/oc_attribute_group_description/oc_attribute_group_description", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("DemoStoreOpenCartDB/oc_attribute_group_description/oc_attribute_group_description").send(JSON.stringify(data));
    }
}