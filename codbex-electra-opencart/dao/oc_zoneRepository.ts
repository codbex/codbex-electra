import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_zoneEntity {
    readonly zone_id: number;
    country_id: number;
    name: string;
    code: string;
    status: boolean;
}

export interface oc_zoneCreateEntity {
    readonly country_id: number;
    readonly name: string;
    readonly code: string;
    readonly status: boolean;
}

export interface oc_zoneUpdateEntity extends oc_zoneCreateEntity {
    readonly zone_id: number;
}

export interface oc_zoneEntityOptions {
    $filter?: {
        equals?: {
            zone_id?: number | number[];
            country_id?: number | number[];
            name?: string | string[];
            code?: string | string[];
            status?: boolean | boolean[];
        };
        notEquals?: {
            zone_id?: number | number[];
            country_id?: number | number[];
            name?: string | string[];
            code?: string | string[];
            status?: boolean | boolean[];
        };
        contains?: {
            zone_id?: number;
            country_id?: number;
            name?: string;
            code?: string;
            status?: boolean;
        };
        greaterThan?: {
            zone_id?: number;
            country_id?: number;
            name?: string;
            code?: string;
            status?: boolean;
        };
        greaterThanOrEqual?: {
            zone_id?: number;
            country_id?: number;
            name?: string;
            code?: string;
            status?: boolean;
        };
        lessThan?: {
            zone_id?: number;
            country_id?: number;
            name?: string;
            code?: string;
            status?: boolean;
        };
        lessThanOrEqual?: {
            zone_id?: number;
            country_id?: number;
            name?: string;
            code?: string;
            status?: boolean;
        };
    },
    $select?: (keyof oc_zoneEntity)[],
    $sort?: string | (keyof oc_zoneEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_zoneEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_zoneEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_zoneRepository {

    private static readonly DEFINITION = {
        table: "oc_zone",
        properties: [
            {
                name: "zone_id",
                column: "zone_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "country_id",
                column: "country_id",
                type: "INT",
                required: true
            },
            {
                name: "name",
                column: "name",
                type: "VARCHAR",
                required: true
            },
            {
                name: "code",
                column: "code",
                type: "VARCHAR",
                required: true
            },
            {
                name: "status",
                column: "status",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_zoneRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_zoneEntityOptions): oc_zoneEntity[] {
        return this.dao.list(options).map((e: oc_zoneEntity) => {
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_zoneEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_zoneCreateEntity): number {
        EntityUtils.setBoolean(entity, "status");
        return this.dao.insert(entity);
    }

    public update(entity: oc_zoneUpdateEntity): void {
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_zoneCreateEntity | oc_zoneUpdateEntity): number {
        const id = (entity as oc_zoneUpdateEntity).zone_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_zoneUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_zone"');
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