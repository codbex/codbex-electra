import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "./EntityUtils";

export interface oc_countryEntity {
    readonly country_id: number;
    name: string;
    iso_code_2: string;
    iso_code_3: string;
    address_format: string;
    postcode_required: boolean;
    status: boolean;
}

export interface oc_countryCreateEntity {
    readonly name: string;
    readonly iso_code_2: string;
    readonly iso_code_3: string;
    readonly address_format: string;
    readonly postcode_required: boolean;
    readonly status: boolean;
}

export interface oc_countryUpdateEntity extends oc_countryCreateEntity {
    readonly country_id: number;
}

export interface oc_countryEntityOptions {
    $filter?: {
        equals?: {
            country_id?: number | number[];
            name?: string | string[];
            iso_code_2?: string | string[];
            iso_code_3?: string | string[];
            address_format?: string | string[];
            postcode_required?: boolean | boolean[];
            status?: boolean | boolean[];
        };
        notEquals?: {
            country_id?: number | number[];
            name?: string | string[];
            iso_code_2?: string | string[];
            iso_code_3?: string | string[];
            address_format?: string | string[];
            postcode_required?: boolean | boolean[];
            status?: boolean | boolean[];
        };
        contains?: {
            country_id?: number;
            name?: string;
            iso_code_2?: string;
            iso_code_3?: string;
            address_format?: string;
            postcode_required?: boolean;
            status?: boolean;
        };
        greaterThan?: {
            country_id?: number;
            name?: string;
            iso_code_2?: string;
            iso_code_3?: string;
            address_format?: string;
            postcode_required?: boolean;
            status?: boolean;
        };
        greaterThanOrEqual?: {
            country_id?: number;
            name?: string;
            iso_code_2?: string;
            iso_code_3?: string;
            address_format?: string;
            postcode_required?: boolean;
            status?: boolean;
        };
        lessThan?: {
            country_id?: number;
            name?: string;
            iso_code_2?: string;
            iso_code_3?: string;
            address_format?: string;
            postcode_required?: boolean;
            status?: boolean;
        };
        lessThanOrEqual?: {
            country_id?: number;
            name?: string;
            iso_code_2?: string;
            iso_code_3?: string;
            address_format?: string;
            postcode_required?: boolean;
            status?: boolean;
        };
    },
    $select?: (keyof oc_countryEntity)[],
    $sort?: string | (keyof oc_countryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_countryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_countryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_countryRepository {

    private static readonly DEFINITION = {
        table: "oc_country",
        properties: [
            {
                name: "country_id",
                column: "country_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "name",
                column: "name",
                type: "VARCHAR",
                required: true
            },
            {
                name: "iso_code_2",
                column: "iso_code_2",
                type: "VARCHAR",
                required: true
            },
            {
                name: "iso_code_3",
                column: "iso_code_3",
                type: "VARCHAR",
                required: true
            },
            {
                name: "address_format",
                column: "address_format",
                type: "TEXT",
                required: true
            },
            {
                name: "postcode_required",
                column: "postcode_required",
                type: "BOOLEAN",
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
        this.dao = daoApi.create(oc_countryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_countryEntityOptions): oc_countryEntity[] {
        return this.dao.list(options).map((e: oc_countryEntity) => {
            EntityUtils.setBoolean(e, "postcode_required");
            EntityUtils.setBoolean(e, "status");
            return e;
        });
    }

    public findById(id: number): oc_countryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "postcode_required");
        EntityUtils.setBoolean(entity, "status");
        return entity ?? undefined;
    }

    public create(entity: oc_countryCreateEntity): number {
        EntityUtils.setBoolean(entity, "postcode_required");
        EntityUtils.setBoolean(entity, "status");
        return this.dao.insert(entity);
    }

    public update(entity: oc_countryUpdateEntity): void {
        EntityUtils.setBoolean(entity, "postcode_required");
        EntityUtils.setBoolean(entity, "status");
        this.dao.update(entity);
    }

    public upsert(entity: oc_countryCreateEntity | oc_countryUpdateEntity): number {
        const id = (entity as oc_countryUpdateEntity).country_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_countryUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_country"');
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