import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

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
        value: number;
        value: number;
    }
}

export class oc_product_attributeRepository {

    private static readonly DEFINITION = {
        table: "oc_product_attribute",
        properties: [
            {
                name: "product_id",
                column: "product_id",
                type: "INT",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "attribute_id",
                column: "attribute_id",
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
                name: "text",
                column: "text",
                type: "TEXT",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_product_attributeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_product_attributeEntityOptions): oc_product_attributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_product_attributeEntity | undefined {
    public findById(id: number): oc_product_attributeEntity | undefined {
    public findById(id: number): oc_product_attributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_product_attributeCreateEntity): number {
    public create(entity: oc_product_attributeCreateEntity): number {
    public create(entity: oc_product_attributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "oc_product_attribute",
            entity: entity,
            key: {
                name: "product_id",
                column: "product_id",
                value: id
                name: "attribute_id",
                column: "attribute_id",
                value: id
                name: "language_id",
                column: "language_id",
                value: id
            }
        });
        return id;
    }

    public update(entity: oc_product_attributeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "oc_product_attribute",
            entity: entity,
            key: {
                name: "product_id",
                column: "product_id",
                value: entity.product_id
                name: "attribute_id",
                column: "attribute_id",
                value: entity.attribute_id
                name: "language_id",
                column: "language_id",
                value: entity.language_id
            }
        });
    }

    public upsert(entity: oc_product_attributeCreateEntity | oc_product_attributeUpdateEntity): number {
    public upsert(entity: oc_product_attributeCreateEntity | oc_product_attributeUpdateEntity): number {
    public upsert(entity: oc_product_attributeCreateEntity | oc_product_attributeUpdateEntity): number {
        const id = (entity as oc_product_attributeUpdateEntity).product_idattribute_idlanguage_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_product_attributeUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
    public deleteById(id: number): void {
    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "oc_product_attribute",
            entity: entity,
            key: {
                name: "product_id",
                column: "product_id",
                value: id
                name: "attribute_id",
                column: "attribute_id",
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

    private async triggerEvent(data: oc_product_attributeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("DemoStoreOpenCartDB/oc_product_attribute/oc_product_attribute", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("DemoStoreOpenCartDB/oc_product_attribute/oc_product_attribute").send(JSON.stringify(data));
    }
}