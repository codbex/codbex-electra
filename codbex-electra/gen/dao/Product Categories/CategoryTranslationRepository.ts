import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CategoryTranslationEntity {
    readonly Id: number;
    Category: number;
    Language: number;
    Name: string;
    Description: string;
    MetaTitle: string;
    MetaDescription: string;
    MetaKeyword: string;
}

export interface CategoryTranslationCreateEntity {
    readonly Category: number;
    readonly Language: number;
    readonly Name: string;
    readonly Description: string;
    readonly MetaTitle: string;
    readonly MetaDescription: string;
    readonly MetaKeyword: string;
}

export interface CategoryTranslationUpdateEntity extends CategoryTranslationCreateEntity {
    readonly Id: number;
}

export interface CategoryTranslationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Category?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            MetaTitle?: string | string[];
            MetaDescription?: string | string[];
            MetaKeyword?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Category?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            MetaTitle?: string | string[];
            MetaDescription?: string | string[];
            MetaKeyword?: string | string[];
        };
        contains?: {
            Id?: number;
            Category?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        greaterThan?: {
            Id?: number;
            Category?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Category?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        lessThan?: {
            Id?: number;
            Category?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Category?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
    },
    $select?: (keyof CategoryTranslationEntity)[],
    $sort?: string | (keyof CategoryTranslationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CategoryTranslationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CategoryTranslationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CategoryTranslationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CATEGORYTRANSLATION",
        properties: [
            {
                name: "Id",
                column: "CATEGORYTRANSLATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Category",
                column: "CATEGORYTRANSLATION_CATEGORY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Language",
                column: "CATEGORYTRANSLATION_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "CATEGORYTRANSLATION_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "CATEGORYTRANSLATION_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaTitle",
                column: "CATEGORYTRANSLATION_METATITLE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaDescription",
                column: "CATEGORYTRANSLATION_METADESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaKeyword",
                column: "CATEGORYTRANSLATION_METAKEYWORD",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CategoryTranslationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CategoryTranslationEntityOptions): CategoryTranslationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CategoryTranslationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CategoryTranslationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CATEGORYTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORYTRANSLATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CategoryTranslationUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CATEGORYTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORYTRANSLATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CategoryTranslationCreateEntity | CategoryTranslationUpdateEntity): number {
        const id = (entity as CategoryTranslationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CategoryTranslationUpdateEntity);
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
            table: "CODBEX_CATEGORYTRANSLATION",
            entity: entity,
            key: {
                name: "Id",
                column: "CATEGORYTRANSLATION_ID",
                value: id
            }
        });
    }

    public count(options?: CategoryTranslationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CATEGORYTRANSLATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CategoryTranslationEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Product Categories-CategoryTranslation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Product Categories-CategoryTranslation").send(JSON.stringify(data));
    }
}
