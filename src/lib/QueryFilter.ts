export enum QueryFilterSign {
    EQ = 'eq',
    GT = 'gt',
    GE = 'ge',
    LT = 'lt',
    LE = 'le',
    NE = 'ne',
    SUBSTRINGOF = "substringof",
    STARTSWITH = "startswith",
    ENDSWITH = "endswith",
}

export enum QueryFilterConcatenate {
    AND = 'and',
    OR = 'or'
}

export class QueryFilter {
    private _sField = ''
    private _sValue = ''
    private _sOption: QueryFilterSign = QueryFilterSign.EQ
    private _sConcat: QueryFilterConcatenate = QueryFilterConcatenate.AND
    private _aChildFilter: QueryFilter[] = []

    get field(): string {
        return this._sField
    }

    get value(): string {
        return this._sValue.substring(1, this._sValue.length - 1)
    }

    set value(val: string) {
        this._sValue = `'${val}'`
    }

    get option(): string {
        return this._sOption
    }


    get concat(): QueryFilterConcatenate {
        return this._sConcat.toLowerCase() === 'and' ? QueryFilterConcatenate.AND : QueryFilterConcatenate.OR
    }

    set concat(sValue: QueryFilterConcatenate) {
        this._sConcat = sValue as QueryFilterConcatenate
    }

    constructor(mField: string | QueryFilter, sValue: any = '', sOption: QueryFilterSign | string = QueryFilterSign.EQ, sConcat: QueryFilterConcatenate | string | null = null) {
        if (typeof mField === 'string') {
            this._sField = mField
            this._sValue = `'${sValue}'`
            this._sOption = sOption.toLowerCase() as QueryFilterSign
            if (sConcat !== null) {
                this._sConcat = sConcat as QueryFilterConcatenate
            }
        } else {
            this._aChildFilter.push(mField)
        }
    }

    private _add(oFilter: QueryFilter, sConcat = QueryFilterConcatenate.AND): void {
        oFilter.concat = sConcat
        this._aChildFilter.push(oFilter)
    }

    private _toFilter(sField: string, sValue: any = '', sOption = QueryFilterSign.EQ): QueryFilter {
        return new QueryFilter(sField, sValue, sOption)
    }

    or(mFilter: QueryFilter | string, sValue: any = '', sOption = QueryFilterSign.EQ): void {
        if (typeof mFilter === 'string') {
            this._add(this._toFilter(mFilter, sValue, sOption), QueryFilterConcatenate.OR)
        } else {
            this._add(mFilter, QueryFilterConcatenate.OR)
        }
    }

    and(mFilter: QueryFilter | string, sValue: any = '', sOption = QueryFilterSign.EQ): void {
        if (typeof mFilter === 'string') {
            this._add(this._toFilter(mFilter, sValue, sOption), QueryFilterConcatenate.AND)
        } else {
            this._add(mFilter, QueryFilterConcatenate.AND)
        }
    }

    addChild(mFilter: QueryFilter | string, sValue: any = '', sOption = QueryFilterSign.EQ): QueryFilter {
        if (typeof mFilter === 'string') {
            this._add(this._toFilter(mFilter, sValue, sOption), QueryFilterConcatenate.AND)
        } else {
            this._add(mFilter, mFilter.concat)
        }
        return this
    }

    build(bWithConcat = false): string {
        const aFilter = []
        if (this.field !== '')
            aFilter.push(this._toString(bWithConcat))
        this._aChildFilter.filter(item => item.field !== '').map(item => {
            if (aFilter.length == 0) {
                aFilter.push(item.build(false))
            } else {
                aFilter.push(item.build(true))
            }
        })
        return aFilter.join(' ')
    }

    private _toString(bWithConcat = false): string {
        if (this._sField === '') return ''
        const aResult = [this._sField, this._sOption, this._sValue]
        if ([
            QueryFilterSign.SUBSTRINGOF,
            QueryFilterSign.STARTSWITH,
            QueryFilterSign.ENDSWITH,
        ].findIndex((item: string) => this._sOption === item) >= 0) {
            aResult[0] = `${this._sOption}(${this._sField}, ${this._sValue})`
            aResult[1] = `eq`
            aResult[2] = `true`
        }

        if (bWithConcat) {
            aResult.unshift(this._sConcat)
        }
        return aResult.join(' ')
    }
}
