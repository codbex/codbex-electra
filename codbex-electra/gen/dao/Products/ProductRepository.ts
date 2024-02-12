import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProductEntity {
    readonly Id: number;
    Model: string;
    Manufacturer: number;
    Status: boolean;
    Quantity: number;
    Price: number;
    Image: string;
    SKU: string;
    UPC: string;
    EAN: string;
    JAN: string;
    ISBN: string;
    MPN: string;
    DateAvailable: Date;
    Weight: number;
    Length: number;
    Width: number;
    Height: number;
    DateAdded: Date;
    DateModified: Date;
    UpdatedBy: string;
    Points: number;
    Shipping: boolean;
    Location: string;
    Subtract: boolean;
    Minimum: number;
    StockStatus: number;
}

export interface ProductCreateEntity {
    readonly Model: string;
    readonly Manufacturer: number;
    readonly Status: boolean;
    readonly Quantity: number;
    readonly Price: number;
    readonly Image: string;
    readonly SKU: string;
    readonly UPC: string;
    readonly EAN: string;
    readonly JAN: string;
    readonly ISBN: string;
    readonly MPN: string;
    readonly DateAvailable: Date;
    readonly Weight: number;
    readonly Length: number;
    readonly Width: number;
    readonly Height: number;
    readonly DateAdded: Date;
    readonly Points: number;
    readonly Shipping: boolean;
    readonly Location: string;
    readonly Subtract: boolean;
    readonly Minimum: number;
    readonly StockStatus: number;
}

export interface ProductUpdateEntity extends ProductCreateEntity {
    readonly Id: number;
}

export interface ProductEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Model?: string | string[];
            Manufacturer?: number | number[];
            Status?: boolean | boolean[];
            Quantity?: number | number[];
            Price?: number | number[];
            Image?: string | string[];
            SKU?: string | string[];
            UPC?: string | string[];
            EAN?: string | string[];
            JAN?: string | string[];
            ISBN?: string | string[];
            MPN?: string | string[];
            DateAvailable?: Date | Date[];
            Weight?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Height?: number | number[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            UpdatedBy?: string | string[];
            Points?: number | number[];
            Shipping?: boolean | boolean[];
            Location?: string | string[];
            Subtract?: boolean | boolean[];
            Minimum?: number | number[];
            StockStatus?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Model?: string | string[];
            Manufacturer?: number | number[];
            Status?: boolean | boolean[];
            Quantity?: number | number[];
            Price?: number | number[];
            Image?: string | string[];
            SKU?: string | string[];
            UPC?: string | string[];
            EAN?: string | string[];
            JAN?: string | string[];
            ISBN?: string | string[];
            MPN?: string | string[];
            DateAvailable?: Date | Date[];
            Weight?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Height?: number | number[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            UpdatedBy?: string | string[];
            Points?: number | number[];
            Shipping?: boolean | boolean[];
            Location?: string | string[];
            Subtract?: boolean | boolean[];
            Minimum?: number | number[];
            StockStatus?: number | number[];
        };
        contains?: {
            Id?: number;
            Model?: string;
            Manufacturer?: number;
            Status?: boolean;
            Quantity?: number;
            Price?: number;
            Image?: string;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            DateAvailable?: Date;
            Weight?: number;
            Length?: number;
            Width?: number;
            Height?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Points?: number;
            Shipping?: boolean;
            Location?: string;
            Subtract?: boolean;
            Minimum?: number;
            StockStatus?: number;
        };
        greaterThan?: {
            Id?: number;
            Model?: string;
            Manufacturer?: number;
            Status?: boolean;
            Quantity?: number;
            Price?: number;
            Image?: string;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            DateAvailable?: Date;
            Weight?: number;
            Length?: number;
            Width?: number;
            Height?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Points?: number;
            Shipping?: boolean;
            Location?: string;
            Subtract?: boolean;
            Minimum?: number;
            StockStatus?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Model?: string;
            Manufacturer?: number;
            Status?: boolean;
            Quantity?: number;
            Price?: number;
            Image?: string;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            DateAvailable?: Date;
            Weight?: number;
            Length?: number;
            Width?: number;
            Height?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Points?: number;
            Shipping?: boolean;
            Location?: string;
            Subtract?: boolean;
            Minimum?: number;
            StockStatus?: number;
        };
        lessThan?: {
            Id?: number;
            Model?: string;
            Manufacturer?: number;
            Status?: boolean;
            Quantity?: number;
            Price?: number;
            Image?: string;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            DateAvailable?: Date;
            Weight?: number;
            Length?: number;
            Width?: number;
            Height?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Points?: number;
            Shipping?: boolean;
            Location?: string;
            Subtract?: boolean;
            Minimum?: number;
            StockStatus?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Model?: string;
            Manufacturer?: number;
            Status?: boolean;
            Quantity?: number;
            Price?: number;
            Image?: string;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            DateAvailable?: Date;
            Weight?: number;
            Length?: number;
            Width?: number;
            Height?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Points?: number;
            Shipping?: boolean;
            Location?: string;
            Subtract?: boolean;
            Minimum?: number;
            StockStatus?: number;
        };
    },
    $select?: (keyof ProductEntity)[],
    $sort?: string | (keyof ProductEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCT",
        properties: [
            {
                name: "Id",
                column: "PRODUCT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Model",
                column: "PRODUCT_MODEL",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Manufacturer",
                column: "PRODUCT_MANUFACTURER",
                type: "INTEGER",
                required: true
            },
            {
                name: "Status",
                column: "PRODUCT_STATUS",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "Quantity",
                column: "PRODUCT_QUANTITY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Price",
                column: "PRODUCT_PRICE",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Image",
                column: "PRODUCT_IMAGE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "SKU",
                column: "PRODUCT_SKU",
                type: "VARCHAR",
                required: true
            },
            {
                name: "UPC",
                column: "PRODUCT_UPC",
                type: "VARCHAR",
                required: true
            },
            {
                name: "EAN",
                column: "PRODUCT_EAN",
                type: "VARCHAR",
                required: true
            },
            {
                name: "JAN",
                column: "PRODUCT_JAN",
                type: "VARCHAR",
                required: true
            },
            {
                name: "ISBN",
                column: "PRODUCT_ISBN",
                type: "VARCHAR",
                required: true
            },
            {
                name: "MPN",
                column: "PRODUCT_MPN",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DateAvailable",
                column: "PRODUCT_DATEAVAILABLE",
                type: "DATE",
                required: true
            },
            {
                name: "Weight",
                column: "PRODUCT_WEIGHT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Length",
                column: "PRODUCT_LENGTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Width",
                column: "PRODUCT_WIDTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Height",
                column: "PRODUCT_HEIGHT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "DateAdded",
                column: "PRODUCT_DATEADDED",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "DateModified",
                column: "PRODUCT_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "UpdatedBy",
                column: "PRODUCT_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Points",
                column: "PRODUCT_POINTS",
                type: "INTEGER",
                required: true
            },
            {
                name: "Shipping",
                column: "PRODUCT_SHIPPING",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "Location",
                column: "PRODUCT_LOCATION",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Subtract",
                column: "PRODUCT_SUBTRACT",
                type: "BOOLEAN",
                required: true
            },
            {
                name: "Minimum",
                column: "PRODUCT_MINIMUM",
                type: "INTEGER",
                required: true
            },
            {
                name: "StockStatus",
                column: "PRODUCT_STOCKSTATUS",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProductRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductEntityOptions): ProductEntity[] {
        return this.dao.list(options).map((e: ProductEntity) => {
            EntityUtils.setBoolean(e, "Status");
            EntityUtils.setDate(e, "DateAvailable");
            EntityUtils.setBoolean(e, "Shipping");
            EntityUtils.setBoolean(e, "Subtract");
            return e;
        });
    }

    public findById(id: number): ProductEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Status");
        EntityUtils.setDate(entity, "DateAvailable");
        EntityUtils.setBoolean(entity, "Shipping");
        EntityUtils.setBoolean(entity, "Subtract");
        return entity ?? undefined;
    }

    public create(entity: ProductCreateEntity): number {
        EntityUtils.setBoolean(entity, "Status");
        EntityUtils.setLocalDate(entity, "DateAvailable");
        EntityUtils.setBoolean(entity, "Shipping");
        EntityUtils.setBoolean(entity, "Subtract");
        // @ts-ignore
        (entity as ProductEntity).DateModified = Date.now();
        // @ts-ignore
        (entity as ProductEntity).UpdatedBy = require("security/user").getName();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Status");
        // EntityUtils.setLocalDate(entity, "DateAvailable");
        EntityUtils.setBoolean(entity, "Shipping");
        EntityUtils.setBoolean(entity, "Subtract");
        // @ts-ignore
        (entity as ProductEntity).DateModified = Date.now();
        // @ts-ignore
        (entity as ProductEntity).UpdatedBy = require("security/user").getName();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductCreateEntity | ProductUpdateEntity): number {
        const id = (entity as ProductUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductUpdateEntity);
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
            table: "CODBEX_PRODUCT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/Product", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Products/Product").send(JSON.stringify(data));
    }
}