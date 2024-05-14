import { query } from "sdk/db";
import { dao as daoApi, update } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_settingEntity {
    readonly setting_id: number;
    store_id: number;
    code: string;
    key: string;
    value: string;
    serialized: boolean;
}

export interface oc_settingCreateEntity {
    readonly store_id: number;
    readonly code: string;
    readonly key: string;
    readonly value: string;
    readonly serialized: boolean;
}

export interface oc_settingUpdateEntity extends oc_settingCreateEntity {
    readonly setting_id: number;
}

export interface oc_settingEntityOptions {
    $filter?: {
        equals?: {
            setting_id?: number | number[];
            store_id?: number | number[];
            code?: string | string[];
            key?: string | string[];
            value?: string | string[];
            serialized?: boolean | boolean[];
        };
        notEquals?: {
            setting_id?: number | number[];
            store_id?: number | number[];
            code?: string | string[];
            key?: string | string[];
            value?: string | string[];
            serialized?: boolean | boolean[];
        };
        contains?: {
            setting_id?: number;
            store_id?: number;
            code?: string;
            key?: string;
            value?: string;
            serialized?: boolean;
        };
        greaterThan?: {
            setting_id?: number;
            store_id?: number;
            code?: string;
            key?: string;
            value?: string;
            serialized?: boolean;
        };
        greaterThanOrEqual?: {
            setting_id?: number;
            store_id?: number;
            code?: string;
            key?: string;
            value?: string;
            serialized?: boolean;
        };
        lessThan?: {
            setting_id?: number;
            store_id?: number;
            code?: string;
            key?: string;
            value?: string;
            serialized?: boolean;
        };
        lessThanOrEqual?: {
            setting_id?: number;
            store_id?: number;
            code?: string;
            key?: string;
            value?: string;
            serialized?: boolean;
        };
    },
    $select?: (keyof oc_settingEntity)[],
    $sort?: string | (keyof oc_settingEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_settingEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_settingEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_settingRepository {

    private static readonly UPDATE_CFG_BY_KEY_STATEMENT = "UPDATE `oc_setting` SET `value` = ? WHERE (`key`=?)";

    private static readonly DEFINITION = {
        table: "oc_setting",
        properties: [
            {
                name: "setting_id",
                column: "setting_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "store_id",
                column: "store_id",
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
                name: "key",
                column: "key",
                type: "VARCHAR",
                required: true
            },
            {
                name: "value",
                column: "value",
                type: "TEXT",
                required: true
            },
            {
                name: "serialized",
                column: "serialized",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;
    private readonly dataSourceName;

    constructor(dataSource: string) {
        this.dataSourceName = dataSource;
        this.dao = daoApi.create(oc_settingRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_settingEntityOptions): oc_settingEntity[] {
        return this.dao.list(options).map((e: oc_settingEntity) => {
            EntityUtils.setBoolean(e, "serialized");
            return e;
        });
    }

    public findById(id: number): oc_settingEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "serialized");
        return entity ?? undefined;
    }

    public create(entity: oc_settingCreateEntity): number {
        EntityUtils.setBoolean(entity, "serialized");
        return this.dao.insert(entity);
    }

    public update(entity: oc_settingUpdateEntity): void {
        EntityUtils.setBoolean(entity, "serialized");
        this.dao.update(entity);
    }

    public updateProcessingOrderStatusId(orderStatusId: number): void {
        const statuses = new Array();
        statuses.push(orderStatusId.toString());

        const params = [JSON.stringify(statuses), 'config_processing_status'];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params, this.dataSourceName);
    }

    public updateCompleteOrderStatusId(orderStatusId: number): void {

        const params = [orderStatusId, 'config_order_status_id'];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params, this.dataSourceName);

        const statuses = new Array();
        statuses.push(orderStatusId.toString());

        const params2 = [JSON.stringify(statuses), 'config_complete_status'];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params2, this.dataSourceName);
    }

    public updateFraudOrderStatusId(orderStatusId: number): void {
        const params = [orderStatusId, 'config_fraud_status_id'];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params, this.dataSourceName);
    }

    public updateConfigByKey(key: string, value: string): void {
        const params = [value, key];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params, this.dataSourceName);
    }

    public updatePaymentCodeOrderStatus(value: number): void {
        const params = [value, 'payment_cod_order_status_id'];
        update.execute(oc_settingRepository.UPDATE_CFG_BY_KEY_STATEMENT, params, this.dataSourceName);
    }

    public upsert(entity: oc_settingCreateEntity | oc_settingUpdateEntity): number {
        const id = (entity as oc_settingUpdateEntity).setting_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_settingUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_setting"');
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