export class QueryExpand {

    private _entity: string = ''
    private _count: boolean = false

    get entity(): string {
        return this._entity;
    }

    set entity(value: string) {
        this._entity = value;
    }

    public constructor() {
    }

    public withCount(value: boolean = true): QueryExpand {
        this._count = value
        return this
    }

    public toString(): string {
        let res: string = this._entity
        const params: Array<string> = []
        if (this._count) {
            params.push(`$count=true`)
        }

        if (params.length > 0) {
            res += `(${params.join(';')})`
        }
        return res
    }
}
