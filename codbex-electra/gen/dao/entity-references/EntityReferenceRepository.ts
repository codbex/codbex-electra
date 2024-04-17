import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface EntityReferenceEntity {
    readonly Id: number;
    EntityName: string;
    EntityIntegerId?: number;
    EntityStringId?: string;
    ReferenceIntegerId?: number;
    ReferenceStringId?: string;
    ScopeIntegerId?: number;
    ScopeStringId?: string;
}

export interface EntityReferenceCreateEntity {
    readonly EntityName: string;
    readonly EntityIntegerId?: number;
    readonly EntityStringId?: string;
    readonly ReferenceIntegerId?: number;
    readonly ReferenceStringId?: string;
    readonly ScopeIntegerId?: number;
    readonly ScopeStringId?: string;
}

export interface EntityReferenceUpdateEntity extends EntityReferenceCreateEntity {
    readonly Id: number;
}

export interface EntityReferenceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            EntityName?: string | string[];
            EntityIntegerId?: number | number[];
            EntityStringId?: string | string[];
            ReferenceIntegerId?: number | number[];
            ReferenceStringId?: string | string[];
            ScopeIntegerId?: number | number[];
            ScopeStringId?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            EntityName?: string | string[];
            EntityIntegerId?: number | number[];
            EntityStringId?: string | string[];
            ReferenceIntegerId?: number | number[];
            ReferenceStringId?: string | string[];
            ScopeIntegerId?: number | number[];
            ScopeStringId?: string | string[];
        };
        contains?: {
            Id?: number;
            EntityName?: string;
            EntityIntegerId?: number;
            EntityStringId?: string;
            ReferenceIntegerId?: number;
            ReferenceStringId?: string;
            ScopeIntegerId?: number;
            ScopeStringId?: string;
        };
        greaterThan?: {
            Id?: number;
            EntityName?: string;
            EntityIntegerId?: number;
            EntityStringId?: string;
            ReferenceIntegerId?: number;
            ReferenceStringId?: string;
            ScopeIntegerId?: number;
            ScopeStringId?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            EntityName?: string;
            EntityIntegerId?: number;
            EntityStringId?: string;
            ReferenceIntegerId?: number;
            ReferenceStringId?: string;
            ScopeIntegerId?: number;
            ScopeStringId?: string;
        };
        lessThan?: {
            Id?: number;
            EntityName?: string;
            EntityIntegerId?: number;
            EntityStringId?: string;
            ReferenceIntegerId?: number;
            ReferenceStringId?: string;
            ScopeIntegerId?: number;
            ScopeStringId?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            EntityName?: string;
            EntityIntegerId?: number;
            EntityStringId?: string;
            ReferenceIntegerId?: number;
            ReferenceStringId?: string;
            ScopeIntegerId?: number;
            ScopeStringId?: string;
        };
    },
    $select?: (keyof EntityReferenceEntity)[],
    $sort?: string | (keyof EntityReferenceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EntityReferenceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EntityReferenceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class EntityReferenceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ENTITYREFERENCE",
        properties: [
            {
                name: "Id",
                column: "ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "EntityName",
                column: "ENTITY_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "EntityIntegerId",
                column: "ENTITY_INTEGER_ID",
                type: "BIGINT",
            },
            {
                name: "EntityStringId",
                column: "ENTITY_STRING_ID",
                type: "VARCHAR",
            },
            {
                name: "ReferenceIntegerId",
                column: "REFERENCE_INTEGER_ID",
                type: "BIGINT",
            },
            {
                name: "ReferenceStringId",
                column: "REFERENCE_STRING_ID",
                type: "VARCHAR",
            },
            {
                name: "ScopeIntegerId",
                column: "SCOPE_INTEGER_ID",
                type: "BIGINT",
            },
            {
                name: "ScopeStringId",
                column: "SCOPE_STRING_ID",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EntityReferenceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EntityReferenceEntityOptions): EntityReferenceEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): EntityReferenceEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: EntityReferenceCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ENTITYREFERENCE",
            entity: entity,
            key: {
                name: "Id",
                column: "ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EntityReferenceUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ENTITYREFERENCE",
            entity: entity,
            key: {
                name: "Id",
                column: "ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EntityReferenceCreateEntity | EntityReferenceUpdateEntity): number {
        const id = (entity as EntityReferenceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EntityReferenceUpdateEntity);
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
            table: "CODBEX_ENTITYREFERENCE",
            entity: entity,
            key: {
                name: "Id",
                column: "ID",
                value: id
            }
        });
    }

    public count(options?: EntityReferenceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ENTITYREFERENCE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EntityReferenceEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-entity-references-EntityReference", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-entity-references-EntityReference").send(JSON.stringify(data));
    }
}
