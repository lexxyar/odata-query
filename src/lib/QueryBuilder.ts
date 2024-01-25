import cloneDeep from 'lodash.clonedeep'
import {QueryOrder} from "./QueryOrder";
import {QueryOrderDirection} from "./QueryOrderDirection";
import {QueryExpand} from "./QueryExpand";
import {QueryFilter} from "./QueryFilter";
import {QueryFilterSign} from "./QueryFilterSign";
import {QueryFilterConcatenate} from "./QueryFilterConcatenate";
import axios, {Axios, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import {
    CallbackFunctionNoParams,
    CallbackFunctionOneParam,
    IParserFilterStructure,
    QueryRequestOptions
} from "./QueryContracts";

type TData = object | object[]

export class QueryBuilder {
    public static axios: Axios = axios.create()
    public static globalLimit: number | null = null

    protected _url: string = ''
    protected _select: string[] = []
    protected _limit: number = 0
    protected _offset: number = 0
    protected _order: QueryOrder[] = []
    protected _expand: QueryExpand[] = []
    protected _search: string = ''
    protected _count: boolean = false
    protected _inlineCount: boolean = false
    protected _filter: QueryFilter[] = []
    protected _id: string | number = 0
    protected _requestQuery: Map<string, string> = new Map<string, string>()
    protected _data: TData = {}
    protected _trailingId: boolean = false
    protected _onErrorCallback: CallbackFunctionOneParam | null = null
    protected _onSuccessCallback: CallbackFunctionOneParam | null = null
    protected _onStartCallback: CallbackFunctionNoParams | null = null
    protected _onFinishCallback: CallbackFunctionNoParams | null = null
    public processing: boolean = false

    public onError(fn: CallbackFunctionOneParam): this {
        this._onErrorCallback = fn
        return this
    }

    public onSuccess(fn: CallbackFunctionOneParam): this {
        this._onSuccessCallback = fn
        return this
    }

    public onStart(fn: CallbackFunctionNoParams): this {
        this._onStartCallback = fn
        return this
    }

    public onFinish(fn: CallbackFunctionNoParams): this {
        this._onFinishCallback = fn
        return this
    }

    public static make(url: string = ''): QueryBuilder {
        return new QueryBuilder(url)
    }

    public constructor(url: string = '') {
        this._url = url
    }

    public url(value: string): this {
        this._url = value
        return this
    }

    public getUrl(): string {
        return this._url
    }

    public data(value: TData): this {
        this._data = value
        return this
    }

    /** SELECT */

    public select(field: string | string[]): this {
        if (Array.isArray(field)) {
            this._select = this._select.concat(field)
        } else {
            this._select.push(field)
        }
        return this
    }

    public noSelect(): this {
        this._select = []
        return this
    }

    protected parseSelect(value: string): void {
        if (value === '') {
            return
        }
        value.split(',').map((field: string): void => {
            this.select(field.trim())
        })
    }

    /** /SELECT */

    /** LIMIT */

    public limit(value: number): this {
        this._limit = value
        return this
    }

    /** @alias limit */
    public top(value: number): this {
        return this.limit(value)
    }

    public noLimit(): this {
        this._limit = 0
        return this
    }

    /** @alias noLimit */
    public noTop(): this {
        return this.noLimit()
    }

    protected parseLimit(value: string): void {
        this.limit(+value)
    }

    /** /LIMIT */

    /** OFFSET */

    public offset(value: number): this {
        this._offset = value
        return this
    }

    /** @alias offset */
    public skip(value: number): this {
        return this.offset(value)
    }

    /** @alias offset */
    public shift(value: number): this {
        return this.offset(value)
    }

    public noOffset(): this {
        this._offset = 0
        return this
    }

    /** @alias noOffset */
    public noSkip(): this {
        return this.noOffset()
    }

    /** @alias noOffset */
    public noShift(): this {
        return this.noOffset()
    }

    protected parseOffset(value: string): void {
        this.offset(+value)
    }

    /** /OFFSET */

    /** SEARCH */

    public search(value: string): this {
        this._search = value
        return this
    }

    protected parseSearch(value: string): void {
        this.search(value.trim())
    }

    /** /SEARCH */

    /** COUNT */

    public count(value: boolean = true): this {
        this._count = value
        return this
    }

    public noCount(value: boolean = true): this {
        return this.count(!value)
    }

    public inlineCount(value: boolean = true): this {
        this._inlineCount = value
        return this
    }

    protected parseCount(value: string): void {
        if (value === '') {
            return
        }
        this._inlineCount = value.toLowerCase() === 'true'
    }

    /** /COUNT */

    /** ID */
    public id(value: string | number): this {
        this._id = value
        return this
    }

    public trailingId(value: boolean = true): this {
        this._trailingId = value
        return this
    }

    /** /ID */

    /** ORDER */

    public order(order: QueryOrder | string, direction: QueryOrderDirection | string = QueryOrderDirection.ASC): this {
        let queryOrder: QueryOrder
        if (order instanceof QueryOrder) {
            queryOrder = order
        } else {
            let dir: QueryOrderDirection
            if (typeof direction === 'string') {
                dir = direction.toLowerCase() as QueryOrderDirection
            } else {
                dir = direction
            }
            queryOrder = QueryOrder.make(order, dir)
        }

        const index: number = this._order.findIndex((e: QueryOrder): boolean => e.getField() === queryOrder.getField())
        if (index >= 0) {
            this._order[index] = queryOrder
        } else {
            this._order.push(queryOrder)
        }
        return this
    }

    /** Alias for order */
    public orderby(order: QueryOrder | string, direction: QueryOrderDirection | string = QueryOrderDirection.ASC): this {
        return this.order(order, direction)
    }

    public removeOrder(field: string | null = null): this {
        if (field === null) {
            this._order = []
        } else {
            const index: number = this._order.findIndex((e: QueryOrder): boolean => e.getField() === field)
            if (index >= 0) {
                this._order.splice(index, 1)
            }
        }
        return this
    }

    protected parseOrderBy(value: string): void {
        if (value === '') {
            return
        }
        value.split(',').map((fieldValue: string) => {
            const orderParts: string[] = fieldValue.trim().split(' ')
            let dir: QueryOrderDirection = QueryOrderDirection.ASC
            const field: string = orderParts[0].trim()

            if (orderParts.length === 2) {
                if (orderParts[1].trim().toLowerCase() === 'desc') {
                    dir = QueryOrderDirection.DESC
                }
            }
            this.order(QueryOrder.make(field, dir))
        })
    }

    /** /ORDER */

    /** EXPAND */
    public expand(entity: string | string[] | QueryExpand | QueryExpand[], count: boolean = false): this {
        if (Array.isArray(entity)) {
            entity.map((entityName: string | QueryExpand): void => {
                if (typeof entityName === 'string') {
                    this._expand.push(QueryExpand.make(entityName, count))
                } else {
                    this._expand.push(entityName)
                }
            })
        } else {
            if (typeof entity === 'string') {
                this._expand.push(QueryExpand.make(entity, count))
            } else {
                this._expand.push(entity)
            }
        }
        return this
    }

    protected parseExpand(value: string): void {
        if (value === '') {
            return
        }
        value.split(',').map((field: string): void => {
            const expression: string = field.trim()
            const exp: QueryExpand = QueryExpand.make()

            if (expression.substring(expression.length - 1) === ')') {
                const parts: string[] = expression.split('(')
                exp.entity(parts[0])
                exp.withCount()
            } else {
                exp.entity(expression)
            }
            this.expand(field.trim())
        })
    }

    /** /EXPAND */

    /** FILTER */

    public filter(field: QueryFilter | string, value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ, concat: QueryFilterConcatenate | string = QueryFilterConcatenate.AND): this {
        const newFilter: QueryFilter = (field instanceof QueryFilter)
            ? field
            : QueryFilter.make(field, value, option)

        newFilter.concat(concat.toLowerCase() as QueryFilterConcatenate)
        this._filter?.push(newFilter)

        return this
    }

    public filterAnd(field: QueryFilter | string, value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ): this {
        return this.filter(field, value, option, QueryFilterConcatenate.AND)
    }

    public filterOr(field: QueryFilter | string, value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ): this {
        return this.filter(field, value, option, QueryFilterConcatenate.OR)
    }

    public filterSet(field: QueryFilter | string, value: any = '', option: QueryFilterSign | string = QueryFilterSign.EQ): this {
        const newFilter: QueryFilter = (field instanceof QueryFilter)
            ? field
            : QueryFilter.make(field, value, option)

        if (this.filterExist(newFilter.getField())) {
            const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === newFilter.getField().toLowerCase())
            this._filter[index] = newFilter
        } else {
            this._filter.push(newFilter)
        }

        return this
    }

    protected filterExist(field: string): boolean {
        const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === field.toLowerCase())
        return index >= 0
    }

    public getFilterByField(field: string): QueryFilter | null {
        const index = this._filter.findIndex((filter: QueryFilter): boolean => filter.getField().toLowerCase() === field.toLowerCase())
        if (index < 0) return null
        return this._filter[index]
    }

    public filterDelete(field: string): this {
        const idx = this._filter.findIndex((e: QueryFilter): boolean => e.getField().toLowerCase() === field.toLowerCase())
        if (idx >= 0) {
            this._filter.splice(idx, 1)
        }
        return this
    }

    protected parseFilter(value: string): void {
        if (value === '') {
            return
        }
        const words: string[] = value.split(' ')

        let quote: number = 0;
        let text: string = '';
        let stage: number = 0;
        let matches = [];
        let group: number = 0;
        let o: IParserFilterStructure = this.getParserFilterDefaultStructure()
        for (let i: number = 0; i < words.length; i++) {
            let word: string = words[i]
            text = [text, word].join(' ').trim()
            let regex: RegExp = /'/gi;
            let quoteCount: number = (word.match(regex) || []).length;
            quote += quoteCount;
            if (quote % 2 != 0) continue;

            if (i === 0) {
                stage++
                o = this.getParserFilterDefaultStructure()
                matches.push(o);
            }

            switch (stage) {
                case 0: // Binary operation
                    o = this.getParserFilterDefaultStructure()
                    matches.push(o);
                    o.condition = text.toLowerCase() as QueryFilterConcatenate;
                    stage++;
                    break;
                case 1: // Field
                    if (text.startsWith('(')) {
                        group++;
                        text = text.substring(1);
                    }
                    o.field = text;
                    o.group = group;
                    stage++;
                    break;
                case 2: // Sign
                    if ([
                        QueryFilterSign.EQ,
                        QueryFilterSign.NE,
                        QueryFilterSign.LT,
                        QueryFilterSign.LE,
                        QueryFilterSign.GT,
                        QueryFilterSign.GE,
                    ].includes(text.toLowerCase() as QueryFilterSign)) {
                        o.operator = text.toLowerCase() as QueryFilterSign;
                        stage++;
                    } else {
                        o.field += text;
                    }
                    break;
                case 3: // Value
                    if (text.endsWith(')')) {
                        group--
                        text = text.substring(0, text.length - 1)
                    }
                    o.value = text
                    stage = 0;
                    break;
            }

            text = '';
        }

        matches.map((match: any) => {

            if (match.field.toLowerCase().startsWith(QueryFilterSign.SUBSTRINGOF) ||
                match.field.toLowerCase().startsWith('contains') ||
                match.field.toLowerCase().startsWith(QueryFilterSign.ENDSWITH) ||
                match.field.toLowerCase().startsWith(QueryFilterSign.STARTSWITH)) {

                const re: RegExp = /(?<Operator>.+)\(((?<Field>.+),s*'(?<Value>.+)')/gm
                const groups = re.exec(match.field)?.groups
                if (groups) {
                    let val: string = groups.Value
                    if (groups.Value.startsWith("'")) {
                        val = groups.Value.substring(1, groups.Value.length - 1)
                    }
                    const f: QueryFilter = QueryFilter.make(groups.Field, val, groups.Operator)
                    this.filter(f);
                }
            } else {
                let val = match.value
                if (match.value.startsWith("'")) {
                    val = match.value.substring(1, match.value.length - 1)
                }
                const f: QueryFilter = QueryFilter.make(match.field, val, match.operator)
                this.filter(f);
            }
        })
    }

    protected getParserFilterDefaultStructure(): IParserFilterStructure {
        return {
            condition: QueryFilterConcatenate.AND,
            field: '',
            group: 0,
            operator: QueryFilterSign.EQ,
            value: ''
        } as IParserFilterStructure
    }

    /** /FILTER */

    /** CUSTOM QUERY */
    public querySet(key: string, value: string): this {
        this._requestQuery.set(key, encodeURI(value))
        return this
    }

    public queryDelete(key: string): this {
        if (this._requestQuery.has(key)) {
            this._requestQuery.delete(key)
        }
        return this
    }

    public queryGet(key: string): string | null {
        // @ts-ignore
        return this._requestQuery.has(key) ? this._requestQuery.get(key).toString() : null
    }

    /** /CUSTOM QUERY */

    public toString(): string {
        const aQuery: string[] = []
        if (!this._id) {
            if (!this._count) {
                if (this._limit > 0) {
                    aQuery.push(`$top=${this._limit}`)
                } else if (QueryBuilder.globalLimit !== null) {
                    aQuery.push(`$top=${QueryBuilder.globalLimit}`)
                }
                if (this._offset > 0) {
                    aQuery.push(`$skip=${this._offset}`)
                }
                if (this._inlineCount) {
                    aQuery.push(`$count=true`)
                }
                if (this._order.length > 0) {
                    const aOrder: string[] = []
                    this._order.map((oOrder: QueryOrder): void => {
                        aOrder.push(oOrder.toString())
                    })
                    aQuery.push('$orderby=' + aOrder.join(','))
                }
            }
            // if (this._oFilter !== null) {
            //     aQuery.push('$filter=' + this._oFilter.toString())
            // }
            if (this._filter.length > 0) {
                const filter: QueryFilter = QueryFilter.make('')
                this._filter.map((f: QueryFilter): void => {
                    filter.addChild(f)
                })
                aQuery.push('$filter=' + filter.toString())
            }
        }

        if (this._expand.length > 0) {
            const expands: string[] = []
            this._expand.map((exp: QueryExpand): void => {
                expands.push(exp.toString())
            })
            aQuery.push('$expand=' + expands.join(','))
        }

        if (this._select.length > 0) {
            aQuery.push('$select=' + this._select.join(','))
        }

        if (!!this._search) {
            aQuery.push(`$search=${this._search}`)
        }

        if (this._requestQuery.size > 0) {
            this._requestQuery.forEach((value: string, key: string): void => {
                aQuery.push(`${key}=${value}`)
            })
        }

        const sUrl: string[] = [this._url]
        if (this._id) {
            let idValue: string = ''
            if (isNaN(+this._id)) {
                idValue = `('${this._id}')`
                // sUrl.push(`('${this._id}')`)
            } else {
                idValue = `(${this._id})`
                // sUrl.push(`(${this._id})`)
            }
            if (this._trailingId) {
                idValue = `/${this._id}`
            }
            sUrl.push(idValue)
        } else {
            sUrl.push(this._count ? '/$count' : '')
        }
        if (aQuery.length > 0) {
            sUrl.push('?')
            sUrl.push(aQuery.join('&'))
        }

        // this._bCount = false
        return sUrl.join('')
    }

    public static parse(url: string, fullUrl: boolean = false): QueryBuilder {
        const urlParts: string[] = url.split(/\?(.*)/s)

        // ToDo fix when used trailing ID
        let entityPath: string = urlParts[0]
        if (!fullUrl) {
            const regex: RegExp = new RegExp("(?:(?<protocol>[^\\:]*)\\:\\\/\\\/)?(?:(?<user>[^\\:\\@]*)(?:\\:(?<password>[^\\@]*))?\\@)?(?:([^\\\/\\:]*)\\.(?=[^\\.\\\/\\:]*\\.[^\\.\\\/\\:]*))?(?<host>[^\\.\\\/\\:]*)(?:\\.(?<domain>[^\\\/\\.\\:]*))?(?:\\:(?<port>[0-9]*))?(?<path>\\\/[^\\?#]*(?=.*?\\\/)\\\/)?(?<script>[^\\?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<hash>.*))?", '')
            const res: RegExpExecArray | null = regex.exec(url)
            if (res && res.groups && res.groups.script) {
                entityPath = `${res.groups.script}`
                entityPath = (entityPath.startsWith('/') ? '' : '/') + entityPath
            }
        }

        const qb: QueryBuilder = QueryBuilder.make(entityPath)
        if (urlParts.length > 1) {
            const query: { [p: string]: string } = Object.fromEntries(new URLSearchParams(urlParts[1]));

            Object.keys(query).map((param: string): void => {
                if (!param.startsWith('$')) {
                    qb.querySet(param, query[param])
                }
            })

            if (Object.keys(query).includes('$top')) {
                qb.parseLimit(query['$top'])
            }
            if (Object.keys(query).includes('$limit')) {
                qb.parseLimit(query['$limit'])
            }
            if (Object.keys(query).includes('$offset')) {
                qb.parseOffset(query['$offset'])
            }
            if (Object.keys(query).includes('$skip')) {
                qb.parseOffset(query['$skip'])
            }
            if (Object.keys(query).includes('$orderby')) {
                qb.parseOrderBy(query['$orderby'])
            }
            if (Object.keys(query).includes('$order')) {
                qb.parseOrderBy(query['$order'])
            }
            if (Object.keys(query).includes('$expand')) {
                qb.parseExpand(query['$expand'])
            }
            if (Object.keys(query).includes('$select')) {
                qb.parseSelect(query['$select'])
            }
            if (Object.keys(query).includes('$filter')) {
                qb.parseFilter(query['$filter'])
            }
            if (Object.keys(query).includes('$count')) {
                qb.parseCount(query['$count'])
            }
            if (Object.keys(query).includes('$search')) {
                qb.parseSearch(query['$search'])
            }
        }
        return qb
    }

    public submit(method: Method, options?: Partial<QueryRequestOptions>): void {
        let axiosInstance: Axios = QueryBuilder.axios
        if (options?.baseUrl) {
            axiosInstance = cloneDeep(QueryBuilder.axios)
            axiosInstance.defaults.baseURL = options.baseUrl
        }

        this.processing = true
        if (!!this._onStartCallback) {
            this._onStartCallback()
        }
        // if (!!options?.onStart) {
        //     options.onStart()
        // }

        const axiosOptions: Partial<AxiosRequestConfig<any>> = {}
        if (!!options?.headers) {
            axiosOptions.headers = options.headers
        }
        axiosOptions.method = method
        axiosOptions.url = this.toString()
        axiosOptions.data = this._data

        axiosInstance.request(axiosOptions)
            .then((response: AxiosResponse<any, any>): void => {
                if (!!this._onSuccessCallback) {
                    this._onSuccessCallback(response)
                }
                // if (!!options?.onSuccess) {
                //     options.onSuccess(response)
                // }
            })
            .catch((error: any): void => {
                if (!!this._onErrorCallback) {
                    this._onErrorCallback(error.response)
                }
                // if (!!options?.onError) {
                //     options.onError(error.response)
                // }
            })
            .finally((): void => {
                this.processing = false
                if (!!this._onFinishCallback) {
                    this._onFinishCallback()
                }
                // if (!!options?.onFinish) {
                //     options.onFinish()
                // }
            })
    }

    public get(options?: Partial<QueryRequestOptions>): void {
        this.submit('get', options)
    }

    public put(options?: Partial<QueryRequestOptions>): void {
        this.submit('put', options)
    }

    public post(options?: Partial<QueryRequestOptions>): void {
        this.submit('post', options)
    }

    public delete(options?: Partial<QueryRequestOptions>): void {
        this.submit('delete', options)
    }

    public options(options?: Partial<QueryRequestOptions>): void {
        this.submit('options', options)
    }
}
