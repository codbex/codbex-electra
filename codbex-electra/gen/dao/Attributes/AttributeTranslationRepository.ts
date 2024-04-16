import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AttributeTranslationEntity {
    readonly Id: number;
    Attribute: number;
    Language: number;
    Text: string;
}

export interface AttributeTranslationCreateEntity {
    readonly Attribute: number;
    readonly Language: number;
    readonly Text: string;
}

export interface AttributeTranslationUpdateEntity extends AttributeTranslationCreateEntity {
    readonly Id: number;
}

export interface AttributeTranslationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Attribute?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Attribute?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        contains?: {
            Id?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        greaterThan?: {
            Id?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        lessThan?: {
            Id?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
    },
    $select?: (keyof AttributeTranslationEntity)[],
    $sort?: string | (keyof AttributeTranslationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttributeTranslationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttributeTranslationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class AttributeTranslationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ATTRIBUTETRANSLATION",
        properties: [
            {
                name: "Id",
                column: "ATTRIBUTETRANSLATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Attribute",
                column: "ATTRIBUTETRANSLATION_ATTRIBUTE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Language",
                column: "ATTRIBUTETRANSLATION_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Text",
                column: "ATTRIBUTETRANSLATION_TEXT",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AttributeTranslationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttributeTranslationEntityOptions): AttributeTranslationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AttributeTranslationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AttributeTranslationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ATTRIBUTETRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTETRANSLATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttributeTranslationUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ATTRIBUTETRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTETRANSLATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttributeTranslationCreateEntity | AttributeTranslationUpdateEntity): number {
        const id = (entity as AttributeTranslationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttributeTranslationUpdateEntity);
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
            table: "CODBEX_ATTRIBUTETRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTETRANSLATION_ID",
                value: id
            }
        });
    }

    public count(options?: AttributeTranslationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTETRANSLATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttributeTranslationEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Attributes-AttributeTranslation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Attributes-AttributeTranslation").send(JSON.stringify(data));
    }
}
