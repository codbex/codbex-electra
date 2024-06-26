import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CountryEntity {
    readonly Id: number;
    Name: string;
    Status: number;
    IsoCode2: string;
    IsoCode3: string;
    PostcodeRequired: boolean;
}

export interface CountryCreateEntity {
    readonly Name: string;
    readonly Status: number;
    readonly IsoCode2: string;
    readonly IsoCode3: string;
    readonly PostcodeRequired: boolean;
}

export interface CountryUpdateEntity extends CountryCreateEntity {
    readonly Id: number;
}

export interface CountryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Status?: number | number[];
            IsoCode2?: string | string[];
            IsoCode3?: string | string[];
            PostcodeRequired?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Status?: number | number[];
            IsoCode2?: string | string[];
            IsoCode3?: string | string[];
            PostcodeRequired?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Status?: number;
            IsoCode2?: string;
            IsoCode3?: string;
            PostcodeRequired?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Status?: number;
            IsoCode2?: string;
            IsoCode3?: string;
            PostcodeRequired?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Status?: number;
            IsoCode2?: string;
            IsoCode3?: string;
            PostcodeRequired?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Status?: number;
            IsoCode2?: string;
            IsoCode3?: string;
            PostcodeRequired?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Status?: number;
            IsoCode2?: string;
            IsoCode3?: string;
            PostcodeRequired?: boolean;
        };
    },
    $select?: (keyof CountryEntity)[],
    $sort?: string | (keyof CountryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CountryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CountryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CountryUpdateEntityEvent extends CountryEntityEvent {
    readonly previousEntity: CountryEntity;
}

export class CountryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_COUNTRY",
        properties: [
            {
                name: "Id",
                column: "COUNTRY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "COUNTRY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Status",
                column: "COUNTRY_STATUS",
                type: "INTEGER",
                required: true
            },
            {
                name: "IsoCode2",
                column: "COUNTRY_ISOCODE2",
                type: "VARCHAR",
                required: true
            },
            {
                name: "IsoCode3",
                column: "COUNTRY_ISOCODE3",
                type: "VARCHAR",
                required: true
            },
            {
                name: "PostcodeRequired",
                column: "COUNTRY_POSTCODEREQUIRED",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CountryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CountryEntityOptions): CountryEntity[] {
        return this.dao.list(options).map((e: CountryEntity) => {
            EntityUtils.setBoolean(e, "PostcodeRequired");
            return e;
        });
    }

    public findById(id: number): CountryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "PostcodeRequired");
        return entity ?? undefined;
    }

    public create(entity: CountryCreateEntity): number {
        EntityUtils.setBoolean(entity, "PostcodeRequired");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_COUNTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "COUNTRY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CountryUpdateEntity): void {
        EntityUtils.setBoolean(entity, "PostcodeRequired");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_COUNTRY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "COUNTRY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CountryCreateEntity | CountryUpdateEntity): number {
        const id = (entity as CountryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CountryUpdateEntity);
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
            table: "CODBEX_COUNTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "COUNTRY_ID",
                value: id
            }
        });
    }

    public count(options?: CountryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COUNTRY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CountryEntityEvent | CountryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-countries-Country", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-countries-Country").send(JSON.stringify(data));
    }
}
