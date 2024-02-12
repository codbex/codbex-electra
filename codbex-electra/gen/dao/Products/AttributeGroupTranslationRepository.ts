import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AttributeGroupTranslationEntity {
    readonly Id: number;
    AttributeGroup: number;
    Language: number;
    Text: string;
}

export interface AttributeGroupTranslationCreateEntity {
    readonly AttributeGroup: number;
    readonly Language: number;
    readonly Text: string;
}

export interface AttributeGroupTranslationUpdateEntity extends AttributeGroupTranslationCreateEntity {
    readonly Id: number;
}

export interface AttributeGroupTranslationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            AttributeGroup?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            AttributeGroup?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        contains?: {
            Id?: number;
            AttributeGroup?: number;
            Language?: number;
            Text?: string;
        };
        greaterThan?: {
            Id?: number;
            AttributeGroup?: number;
            Language?: number;
            Text?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            AttributeGroup?: number;
            Language?: number;
            Text?: string;
        };
        lessThan?: {
            Id?: number;
            AttributeGroup?: number;
            Language?: number;
            Text?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            AttributeGroup?: number;
            Language?: number;
            Text?: string;
        };
    },
    $select?: (keyof AttributeGroupTranslationEntity)[],
    $sort?: string | (keyof AttributeGroupTranslationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttributeGroupTranslationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttributeGroupTranslationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class AttributeGroupTranslationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
        properties: [
            {
                name: "Id",
                column: "ATTRIBUTEGROUPTRANSLATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "AttributeGroup",
                column: "ATTRIBUTEGROUPTRANSLATION_ATTRIBUTEGROUP",
                type: "INTEGER",
                required: true
            },
            {
                name: "Language",
                column: "ATTRIBUTEGROUPTRANSLATION_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Text",
                column: "ATTRIBUTEGROUPTRANSLATION_TEXT",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(AttributeGroupTranslationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttributeGroupTranslationEntityOptions): AttributeGroupTranslationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AttributeGroupTranslationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AttributeGroupTranslationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUPTRANSLATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttributeGroupTranslationUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUPTRANSLATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttributeGroupTranslationCreateEntity | AttributeGroupTranslationUpdateEntity): number {
        const id = (entity as AttributeGroupTranslationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttributeGroupTranslationUpdateEntity);
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
            table: "CODBEX_ATTRIBUTEGROUPTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUPTRANSLATION_ID",
                value: id
            }
        });
    }



    public count(AttributeGroup: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTEGROUPTRANSLATION" WHERE "ATTRIBUTEGROUPTRANSLATION_ATTRIBUTEGROUP" = ?', [AttributeGroup]);
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTEGROUPTRANSLATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttributeGroupTranslationEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/AttributeGroupTranslation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Products/AttributeGroupTranslation").send(JSON.stringify(data));
    }
}