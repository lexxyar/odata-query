import {QueryFilterSign} from "./QueryFilterSign";
import {QueryFilterConcatenate} from "./QueryFilterConcatenate";

export class QueryFilter {
    private _field: string = ''
    private _value: string = ''
    private _option: QueryFilterSign = QueryFilterSign.EQ
    private _concat: QueryFilterConcatenate = QueryFilterConcatenate.AND
    private _childFilter: QueryFilter[] = []

    public static make(field: string | QueryFilter = '', value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ, concat: QueryFilterConcatenate | string | null = null): QueryFilter {
        return new QueryFilter(field, value, option, concat)
    }

    public constructor(field: string | QueryFilter = '', value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ, concat: QueryFilterConcatenate | string | null = null) {
        if (typeof field === 'string') {
            this._field = field
            this._value = value
            this._option = option.toLowerCase() as QueryFilterSign
            if (concat !== null) {
                this._concat = concat.toLowerCase() as QueryFilterConcatenate
            }
        } else {
            this._childFilter.push(field)
        }
    }

    public field(value: string): this {
        this._field = value
        return this
    }

    public getField(): string {
        return this._field
    }

    public getValue(): string {
        return this._value
    }

    public value(value: string): this {
        this._value = value
        return this
    }

    public getOption(): string {
        return this._option
    }

    public getConcat(): QueryFilterConcatenate {
        return this._concat.toLowerCase() === 'and' ? QueryFilterConcatenate.AND : QueryFilterConcatenate.OR
    }

    public concat(value: QueryFilterConcatenate): this {
        this._concat = value as QueryFilterConcatenate
        return this
    }

    private _add(filter: QueryFilter, concat: QueryFilterConcatenate = QueryFilterConcatenate.AND): void {
        filter.concat(concat)
        this._childFilter.push(filter)
    }

    private _toFilter(field: string, value: any = '', option: QueryFilterSign = QueryFilterSign.EQ): QueryFilter {
        return QueryFilter.make(field, value, option)
    }

    public or(filter: QueryFilter | string, value: any = '', option: QueryFilterSign = QueryFilterSign.EQ): this {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), QueryFilterConcatenate.OR)
        } else {
            this._add(filter, QueryFilterConcatenate.OR)
        }
        return this
    }

    public and(filter: QueryFilter | string, value: any = '', option: QueryFilterSign = QueryFilterSign.EQ): this {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), QueryFilterConcatenate.AND)
        } else {
            this._add(filter, QueryFilterConcatenate.AND)
        }
        return this
    }

    public addChild(filter: QueryFilter | string, value: any = '', option: QueryFilterSign = QueryFilterSign.EQ): QueryFilter {
        if (typeof filter === 'string') {
            this._add(this._toFilter(filter, value, option), QueryFilterConcatenate.AND)
        } else {
            this._add(filter, filter.getConcat())
        }
        return this
    }

    public toString(withConcat: boolean = false): string {
        const aFilter = []
        if (this.getField() !== '')
            aFilter.push(this._toString(withConcat))
        this._childFilter.filter((item: QueryFilter): boolean => item.getField() !== '')
            .map((item: QueryFilter): void => {
                if (aFilter.length == 0) {
                    aFilter.push(item.toString(false))
                } else {
                    aFilter.push(item.toString(true))
                }
            })
        return aFilter.join(' ')
    }

    private _toString(withConcat: boolean = false): string {
        if (this._field === '') return ''
        const value: string = `'${this._value}'`
        const aResult: string[] = [this._field, this._option, value]
        if ([
            QueryFilterSign.SUBSTRINGOF,
            QueryFilterSign.STARTSWITH,
            QueryFilterSign.ENDSWITH,
        ].findIndex((item: string): boolean => this._option === item) >= 0) {
            aResult[0] = `${this._option}(${this._field}, ${value})`
            aResult[1] = `eq`
            aResult[2] = `true`
        }

        if (withConcat) {
            aResult.unshift(this._concat)
        }
        return aResult.join(' ')
    }
}
