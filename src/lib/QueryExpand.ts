export class QueryExpand {

    protected _entity: string = ''
    protected _count: boolean = false
    protected _top: number = -1

    public static make(entity: string = '', withCount:boolean = false, top:number = -1): QueryExpand {
        return new QueryExpand(entity, withCount, top)
    }

    public constructor(entity: string = '', withCount:boolean = false, top:number = -1) {
        this._entity = entity
        this._count = withCount
        this._top = top
    }

    public entity(value: string): this {
        this._entity = value
        return this
    }

    public getEntity(): string {
        return this._entity
    }

    public withCount(value: boolean = true): this {
        this._count = value
        return this
    }

    public top(value: number): this {
        this._top = value
        return this
    }

    public noTop(): this {
        this._top = -1
        return this
    }

    public toString(): string {
        let res: string = this._entity
        const params: Array<string> = []
        if (this._count) {
            params.push(`$count=true`)
        }
        if (this._top >= 0) {
            params.push(`$top=${this._top}`)
        }

        if (params.length > 0) {
            res += `(${params.join(';')})`
        }
        return res
    }
}
