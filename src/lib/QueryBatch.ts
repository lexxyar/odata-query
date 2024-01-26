import {QueryBuilder} from "./QueryBuilder";
import {
    CallbackFunctionNoParams,
    CallbackFunctionOneParam,
    CallbackFunctionOneParamBatch,
    QueryRequestOptions
} from "./QueryContracts";
import {AxiosResponse, Method} from "axios";

export class QueryBatch {
    protected _requests: QueryBuilder[] = []
    protected _onErrorCallback: CallbackFunctionOneParam | null = null
    protected _onSuccessCallback: CallbackFunctionOneParamBatch | null = null
    protected _onStartCallback: CallbackFunctionNoParams | null = null
    protected _onFinishCallback: CallbackFunctionNoParams | null = null

    public static make(requests: QueryBuilder[] = []): QueryBatch {
        return new QueryBatch(requests)
    }

    public constructor(requests: QueryBuilder[] = []) {
        this._requests = [...requests]
    }

    public add(request: QueryBuilder): this {
        this._requests.push(request)
        return this
    }

    public onError(fn: CallbackFunctionOneParam): this {
        this._onErrorCallback = fn
        return this
    }

    public onSuccess(fn: CallbackFunctionOneParamBatch): this {
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

    public submit(method: Method, options?: Partial<QueryRequestOptions>): void {
        if (this._onStartCallback) {
            this._onStartCallback()
        }

        const promises: Promise<any>[] = [] as Promise<any>[]

        this._requests.map((qb: QueryBuilder): void => {
            promises.push(new Promise<unknown>((resolve: any, reject: any): void => {
                qb.onError((response: AxiosResponse<any, any>): void => {
                    reject(response)
                })
                    .onSuccess((): void => {
                        resolve(null)
                    })

                switch (method) {
                    case 'delete':
                        qb.delete(options)
                        break;
                    case 'get':
                        qb.get(options)
                        break;
                    case 'post':
                        qb.post(options)
                        break;
                    case 'put':
                        qb.put(options)
                        break;
                    case 'options':
                        qb.options(options)
                        break;
                }
            }))

            Promise.allSettled(promises)
                .then((results: PromiseSettledResult<any>[]): void => {
                    if (this._onSuccessCallback) {
                        this._onSuccessCallback(results)
                    }
                })
                .catch((reason: any): void => {
                    if (this._onErrorCallback) {
                        this._onErrorCallback(reason)
                    }
                })
                .finally((): void => {
                    if (this._onFinishCallback) {
                        this._onFinishCallback()
                    }
                })
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

    public options(options ?: Partial<QueryRequestOptions>): void {
        this.submit('options', options)
    }
}
