import {QueryOrderDirection} from "./QueryOrderDirection";

export class QueryOrder {
    protected _field: string = ''
    protected _direction: QueryOrderDirection = QueryOrderDirection.ASC

    public static make(field: string = '', direction: QueryOrderDirection = QueryOrderDirection.ASC): QueryOrder {
        return new QueryOrder(field, direction)
    }

    constructor(field: string = '', direction: QueryOrderDirection = QueryOrderDirection.ASC) {
        this._field = field
        this._direction = direction
    }

    public field(value: string): this {
        this._field = value
        return this
    }

    public getField(): string {
        return this._field
    }

    public getDirection(): QueryOrderDirection {
        return this._direction
    }

    public asc(value: boolean = true): this {
        this._direction = value ? QueryOrderDirection.ASC : QueryOrderDirection.DESC
        return this
    }

    public desc(value: boolean = true): this {
        return this.asc(!value)
    }

    public toString(): string {
        return `${this._field} ${this._direction}`
    }

    public toJson(): object {
        return {field: this._field, direction: this._direction}
    }
}
