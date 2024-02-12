import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_productEntity {
    readonly product_id: number;
    model: string;
    sku: string;
    upc: string;
    ean: string;
    jan: string;
    isbn: string;
    mpn: string;
    location: string;
    quantity: number;
    stock_status_id: number;
    image?: string;
    manufacturer_id: number;
    shipping: boolean;
    price: number;
    points: number;
    tax_class_id: number;
    date_available: Date;
    weight: number;
    weight_class_id: number;
    length: number;
    width: number;
    height: number;
    length_class_id: number;
    subtract: boolean;
    minimum: number;
    sort_order: number;
    status: boolean;
    viewed: number;
    date_added: Date;
    date_modified: Date;
}

export interface oc_productCreateEntity {
    readonly model: string;
    readonly sku: string;
    readonly upc: string;
    readonly ean: string;
    readonly jan: string;
    readonly isbn: string;
    readonly mpn: string;
    readonly location: string;
    readonly quantity: number;
    readonly stock_status_id: number;
    readonly image?: string;
    readonly manufacturer_id: number;
    readonly shipping: boolean;
    readonly price: number;
    readonly points: number;
    readonly tax_class_id: number;
    readonly date_available: Date;
    readonly weight: number;
    readonly weight_class_id: number;
    readonly length: number;
    readonly width: number;
    readonly height: number;
    readonly length_class_id: number;
    readonly subtract: boolean;
    readonly minimum: number;
    readonly sort_order: number;
    readonly status: boolean;
    readonly viewed: number;
    readonly date_added: Date;
    readonly date_modified: Date;
}

export interface oc_productUpdateEntity extends oc_productCreateEntity {
    readonly product_id: number;
}

export interface oc_productEntityOptions {
    $filter?: {
        equals?: {
            product_id?: number | number[];
            model?: string | string[];
            sku?: string | string[];
            upc?: string | string[];
            ean?: string | string[];
            jan?: string | string[];
            isbn?: string | string[];
            mpn?: string | string[];
            location?: string | string[];
            quantity?: number | number[];
            stock_status_id?: number | number[];
            image?: string | string[];
            manufacturer_id?: number | number[];
            shipping?: boolean | boolean[];
            price?: number | number[];
            points?: number | number[];
            tax_class_id?: number | number[];
            date_available?: Date | Date[];
            weight?: number | number[];
            weight_class_id?: number | number[];
            length?: number | number[];
            width?: number | number[];
            height?: number | number[];
            length_class_id?: number | number[];
            subtract?: boolean | boolean[];
            minimum?: number | number[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
            viewed?: number | number[];
            date_added?: Date | Date[];
            date_modified?: Date | Date[];
        };
        notEquals?: {
            product_id?: number | number[];
            model?: string | string[];
            sku?: string | string[];
            upc?: string | string[];
            ean?: string | string[];
            jan?: string | string[];
            isbn?: string | string[];
            mpn?: string | string[];
            location?: string | string[];
            quantity?: number | number[];
            stock_status_id?: number | number[];
            image?: string | string[];
            manufacturer_id?: number | number[];
            shipping?: boolean | boolean[];
            price?: number | number[];
            points?: number | number[];
            tax_class_id?: number | number[];
            date_available?: Date | Date[];
            weight?: number | number[];
            weight_class_id?: number | number[];
            length?: number | number[];
            width?: number | number[];
            height?: number | number[];
            length_class_id?: number | number[];
            subtract?: boolean | boolean[];
            minimum?: number | number[];
            sort_order?: number | number[];
            status?: boolean | boolean[];
            viewed?: number | number[];
            date_added?: Date | Date[];
            date_modified?: Date | Date[];
        };
        contains?: {
            product_id?: number;
            model?: string;
            sku?: string;
            upc?: string;
            ean?: string;
            jan?: string;
            isbn?: string;
            mpn?: string;
            location?: string;
            quantity?: number;
            stock_status_id?: number;
            image?: string;
            manufacturer_id?: number;
            shipping?: boolean;
            price?: number;
            points?: number;
            tax_class_id?: number;
            date_available?: Date;
            weight?: number;
            weight_class_id?: number;
            length?: number;
            width?: number;
            height?: number;
            length_class_id?: number;
            subtract?: boolean;
            minimum?: number;
            sort_order?: number;
            status?: boolean;
            viewed?: number;
            date_added?: Date;
            date_modified?: Date;
        };
        greaterThan?: {
            product_id?: number;
            model?: string;
            sku?: string;
            upc?: string;
            ean?: string;
            jan?: string;
            isbn?: string;
            mpn?: string;
            location?: string;
            quantity?: number;
            stock_status_id?: number;
            image?: string;
            manufacturer_id?: number;
            shipping?: boolean;
            price?: number;
            points?: number;
            tax_class_id?: number;
            date_available?: Date;
            weight?: number;
            weight_class_id?: number;
            length?: number;
            width?: number;
            height?: number;
            length_class_id?: number;
            subtract?: boolean;
            minimum?: number;
            sort_order?: number;
            status?: boolean;
            viewed?: number;
            date_added?: Date;
            date_modified?: Date;
        };
        greaterThanOrEqual?: {
            product_id?: number;
            model?: string;
            sku?: string;
            upc?: string;
            ean?: string;
            jan?: string;
            isbn?: string;
            mpn?: string;
            location?: string;
            quantity?: number;
            stock_status_id?: number;
            image?: string;
            manufacturer_id?: number;
            shipping?: boolean;
            price?: number;
            points?: number;
            tax_class_id?: number;
            date_available?: Date;
            weight?: number;
            weight_class_id?: number;
            length?: number;
            width?: number;
            height?: number;
            length_class_id?: number;
            subtract?: boolean;
            minimum?: number;
            sort_order?: number;
            status?: boolean;
            viewed?: number;
            date_added?: Date;
            date_modified?: Date;
        };
        lessThan?: {
            product_id?: number;
            model?: string;
            sku?: string;
            upc?: string;
            ean?: string;
            jan?: string;
            isbn?: string;
            mpn?: string;
            location?: string;
            quantity?: number;
            stock_status_id?: number;
            image?: string;
            manufacturer_id?: number;
            shipping?: boolean;
            price?: number;
            points?: number;
            tax_class_id?: number;
            date_available?: Date;
            weight?: number;
            weight_class_id?: number;
            length?: number;
            width?: number;
            height?: number;
            length_class_id?: number;
            subtract?: boolean;
            minimum?: number;
            sort_order?: number;
            status?: boolean;
            viewed?: number;
            date_added?: Date;
            date_modified?: Date;
        };
        lessThanOrEqual?: {
            product_id?: number;
            model?: string;
            sku?: string;
            upc?: string;
            ean?: string;
            jan?: string;
            isbn?: string;
            mpn?: string;
            location?: string;
            quantity?: number;
            stock_status_id?: number;
            image?: string;
            manufacturer_id?: number;
            shipping?: boolean;
            price?: number;
            points?: number;
            tax_class_id?: number;
            date_available?: Date;
            weight?: number;
            weight_class_id?: number;
            length?: number;
            width?: number;
            height?: number;
            length_class_id?: number;
            subtract?: boolean;
            minimum?: number;
            sort_order?: number;
            status?: boolean;
            viewed?: number;
            date_added?: Date;
            date_modified?: Date;
        };
    },
    $select?: (keyof oc_productEntity)[],
    $sort?: string | (keyof oc_productEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_productEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_productEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_productRepository {

    private static readonly DEFINITION = {
        table: "oc_product",
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
                name: "model",
                column: "model",
                type: "VARCHAR",
                required: true
            },
            {
                name: "sku",
                column: "sku",
                type: "VARCHAR",
                required: true
            },
            {
                name: "upc",
                column: "upc",
                type: "VARCHAR",
                required: true
            },
            {
                name: "ean",
                column: "ean",
                type: "VARCHAR",
                required: true
            },
            {
                name: "jan",
                column: "jan",
                type: "VARCHAR",
                required: true
            },
            {
                name: "isbn",
                column: "isbn",
                type: "VARCHAR",
                required: true
            },
            {
                name: "mpn",
                column: "mpn",
                type: "VARCHAR",
                required: true
            },
            {
                name: "location",
                column: "location",
                type: "VARCHAR",
                required: true
            },
            {
                name: "quantity",
                column: "quantity",
                type: "INT",
                required: true
            },
            {
                name: "stock_status_id",
                column: "stock_status_id",
                type: "INT",
                required: true
            },
            {
                name: "image",
                column: "image",
                type: "VARCHAR",
            },
            {
                name: "manufacturer_id",
                column: "manufacturer_id",
                type: "INT",
                required: true
            },
            {
                name: "shipping",
                column: "shipping",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "price",
                column: "price",
                type: "DECIMAL",
                required: true
            },
            {
                name: "points",
                column: "points",
                type: "INT",
                required: true
            },
            {
                name: "tax_class_id",
                column: "tax_class_id",
                type: "INT",
                required: true
            },
            {
                name: "date_available",
                column: "date_available",
                type: "DATE",
                required: true
            },
            {
                name: "weight",
                column: "weight",
                type: "DECIMAL",
                required: true
            },
            {
                name: "weight_class_id",
                column: "weight_class_id",
                type: "INT",
                required: true
            },
            {
                name: "length",
                column: "length",
                type: "DECIMAL",
                required: true
            },
            {
                name: "width",
                column: "width",
                type: "DECIMAL",
                required: true
            },
            {
                name: "height",
                column: "height",
                type: "DECIMAL",
                required: true
            },
            {
                name: "length_class_id",
                column: "length_class_id",
                type: "INT",
                required: true
            },
            {
                name: "subtract",
                column: "subtract",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "minimum",
                column: "minimum",
                type: "INT",
                required: true
            },
            {
                name: "sort_order",
                column: "sort_order",
                type: "INT",
                required: true
            },
            {
                name: "status",
                column: "status",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "viewed",
                column: "viewed",
                type: "INT",
                required: true
            },
            {
                name: "date_added",
                column: "date_added",
                type: "DATETIME",
                required: true
            },
            {
                name: "date_modified",
                column: "date_modified",
                type: "DATETIME",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_productRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_productEntityOptions): oc_productEntity[] {
        return this.dao.list(options).map((e: oc_productEntity) => {
            EntityUtils.setBoolean(e, "shipping");
            EntityUtils.setDate(e, "date_available");
            EntityUtils.setBoolean(e, "subtract");
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_productEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "shipping");
        EntityUtils.setDate(entity, "date_available");
        EntityUtils.setBoolean(entity, "subtract");
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_productCreateEntity): number {
        EntityUtils.setBoolean(entity, "shipping");
        EntityUtils.setLocalDate(entity, "date_available");
        EntityUtils.setBoolean(entity, "subtract");
        EntityUtils.setBoolean(entity, "status");
        if (!entity.viewed) {
            entity.viewed = 0;
        }
        return this.dao.insert(entity);
    }

    public update(entity: oc_productUpdateEntity): void {
        EntityUtils.setBoolean(entity, "shipping");
        // EntityUtils.setLocalDate(entity, "date_available");
        EntityUtils.setBoolean(entity, "subtract");
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_productCreateEntity | oc_productUpdateEntity): number {
        const id = (entity as oc_productUpdateEntity).product_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_productUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_product"');
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