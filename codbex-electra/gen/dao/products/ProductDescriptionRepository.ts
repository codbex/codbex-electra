import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductDescriptionEntity {
    readonly Id: number;
    Product: number;
    Language: number;
    Name: string;
    Description: string;
    Tag: string;
    MetaTitle: string;
    MetaDescription: string;
    MetaKeyword: string;
}

export interface ProductDescriptionCreateEntity {
    readonly Product: number;
    readonly Language: number;
    readonly Name: string;
    readonly Description: string;
    readonly Tag: string;
    readonly MetaTitle: string;
    readonly MetaDescription: string;
    readonly MetaKeyword: string;
}

export interface ProductDescriptionUpdateEntity extends ProductDescriptionCreateEntity {
    readonly Id: number;
}

export interface ProductDescriptionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Tag?: string | string[];
            MetaTitle?: string | string[];
            MetaDescription?: string | string[];
            MetaKeyword?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
            Tag?: string | string[];
            MetaTitle?: string | string[];
            MetaDescription?: string | string[];
            MetaKeyword?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            Tag?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            Tag?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            Tag?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            Tag?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Language?: number;
            Name?: string;
            Description?: string;
            Tag?: string;
            MetaTitle?: string;
            MetaDescription?: string;
            MetaKeyword?: string;
        };
    },
    $select?: (keyof ProductDescriptionEntity)[],
    $sort?: string | (keyof ProductDescriptionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductDescriptionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductDescriptionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductDescriptionUpdateEntityEvent extends ProductDescriptionEntityEvent {
    readonly previousEntity: ProductDescriptionEntity;
}

export class ProductDescriptionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTDESCRIPTION",
        properties: [
            {
                name: "Id",
                column: "PRODUCTDESCRIPTION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTDESCRIPTION_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Language",
                column: "PRODUCTDESCRIPTION_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "PRODUCTDESCRIPTION_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Description",
                column: "PRODUCTDESCRIPTION_DESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Tag",
                column: "PRODUCTDESCRIPTION_TAG",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaTitle",
                column: "PRODUCTDESCRIPTION_METATITLE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaDescription",
                column: "PRODUCTDESCRIPTION_METADESCRIPTION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MetaKeyword",
                column: "PRODUCTDESCRIPTION_METAKEYWORD",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductDescriptionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductDescriptionEntityOptions): ProductDescriptionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductDescriptionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductDescriptionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTDESCRIPTION",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDESCRIPTION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductDescriptionUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTDESCRIPTION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTDESCRIPTION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductDescriptionCreateEntity | ProductDescriptionUpdateEntity): number {
        const id = (entity as ProductDescriptionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductDescriptionUpdateEntity);
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
            table: "CODBEX_PRODUCTDESCRIPTION",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDESCRIPTION_ID",
                value: id
            }
        });
    }

    public count(options?: ProductDescriptionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDESCRIPTION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductDescriptionEntityEvent | ProductDescriptionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-products-ProductDescription", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-products-ProductDescription").send(JSON.stringify(data));
    }
}
