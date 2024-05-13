import { dao as daoApi, update } from "sdk/db";

export interface oc_order_totalEntity {
    readonly order_total_id: number;
    order_id: number;
    code: string;
    title: string;
    value: number;
    sort_order: number;
}

export interface oc_order_totalCreateEntity {
    readonly order_id: number;
    readonly code: string;
    readonly title: string;
    readonly value: number;
    readonly sort_order: number;
}

export interface oc_order_totalUpdateEntity extends oc_order_totalCreateEntity {
    readonly order_total_id: number;
}

export interface oc_order_totalEntityOptions {
    $filter?: {
        equals?: {
            order_total_id?: number | number[];
            order_id?: number | number[];
            code?: string | string[];
            title?: string | string[];
            value?: number | number[];
            sort_order?: number | number[];
        };
        notEquals?: {
            order_total_id?: number | number[];
            order_id?: number | number[];
            code?: string | string[];
            title?: string | string[];
            value?: number | number[];
            sort_order?: number | number[];
        };
        contains?: {
            order_total_id?: number;
            order_id?: number;
            code?: string;
            title?: string;
            value?: number;
            sort_order?: number;
        };
        greaterThan?: {
            order_total_id?: number;
            order_id?: number;
            code?: string;
            title?: string;
            value?: number;
            sort_order?: number;
        };
        greaterThanOrEqual?: {
            order_total_id?: number;
            order_id?: number;
            code?: string;
            title?: string;
            value?: number;
            sort_order?: number;
        };
        lessThan?: {
            order_total_id?: number;
            order_id?: number;
            code?: string;
            title?: string;
            value?: number;
            sort_order?: number;
        };
        lessThanOrEqual?: {
            order_total_id?: number;
            order_id?: number;
            code?: string;
            title?: string;
            value?: number;
            sort_order?: number;
        };
    },
    $select?: (keyof oc_order_totalEntity)[],
    $sort?: string | (keyof oc_order_totalEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_order_totalEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_order_totalEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface oc_order_totalUpdateEntityEvent extends oc_order_totalEntityEvent {
    readonly previousEntity: oc_order_totalEntity;
}

export class oc_order_totalRepository {

    public static readonly TOTAL_CODE = 'total';
    public static readonly TAX_CODE = 'tax';
    public static readonly SHIPPING_CODE = 'shipping';
    public static readonly SUBTOTAL_CODE = 'sub_total';

    private static readonly UPDATE_BY_CODE = "UPDATE `oc_order_total` SET `value` = ? WHERE (`order_id` = ? AND `code`=?)";

    private static readonly DEFINITION = {
        table: "oc_order_total",
        properties: [
            {
                name: "order_total_id",
                column: "order_total_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "order_id",
                column: "order_id",
                type: "INT",
                required: true
            },
            {
                name: "code",
                column: "code",
                type: "VARCHAR",
                required: true
            },
            {
                name: "title",
                column: "title",
                type: "VARCHAR",
                required: true
            },
            {
                name: "value",
                column: "value",
                type: "DECIMAL",
                required: true
            },
            {
                name: "sort_order",
                column: "sort_order",
                type: "INT",
                required: true
            }
        ]
    };

    private readonly dataSourceName;
    private readonly dao;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_order_totalRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_order_totalEntityOptions): oc_order_totalEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_order_totalEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_order_totalCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_order_totalUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_order_totalCreateEntity | oc_order_totalUpdateEntity): number {
        const id = (entity as oc_order_totalUpdateEntity).order_total_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_order_totalUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public updateOrderSubTotal(orderId: number, value: number): void {
        this.updateByCode(orderId, value, oc_order_totalRepository.SUBTOTAL_CODE);
    }

    public updateOrderShipping(orderId: number, value: number): void {
        this.updateByCode(orderId, value, oc_order_totalRepository.SHIPPING_CODE);
    }

    public updateOrderTaxes(orderId: number, value: number): void {
        this.updateByCode(orderId, value, oc_order_totalRepository.TAX_CODE);
    }

    public updateOrderTotal(orderId: number, value: number): void {
        this.updateByCode(orderId, value, oc_order_totalRepository.TOTAL_CODE);
    }


    private updateByCode(orderId: number, value: number, code: string): void {
        const params = [value, orderId, code];
        update.execute(oc_order_totalRepository.UPDATE_BY_CODE, params, this.dataSourceName);
    }

}
