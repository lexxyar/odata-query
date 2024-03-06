import {QueryBuilder} from "./QueryBuilder";
import {
    CallbackFunctionOneParamBatch,
    QueryRequestOptions, TQueryBuilderState
} from "./QueryContracts";
import {Method} from "axios";
import {HttpRequestState} from "../Contracts/HttpRequestState";

export class QueryBatch extends HttpRequestState {
    protected _requests: QueryBuilder[] = []
    protected _onSuccessCallback: CallbackFunctionOneParamBatch | null = null

    public static make(requests: QueryBuilder[] = []): QueryBatch {
        return new QueryBatch(requests)
    }

    public onSuccess(fn: CallbackFunctionOneParamBatch): this {
        this._onSuccessCallback = fn
        return this
    }

    public constructor(requests: QueryBuilder[] = []) {
        super()
        this._requests = [...requests]
    }

    public add(request: QueryBuilder): this {
        this._requests.push(request)
        return this
    }

    public submit(method: Method, options?: Partial<QueryRequestOptions>): void {
        if (this._onStartCallback) {
            this._onStartCallback()
        }

        const promises: Promise<any>[] = [] as Promise<any>[]

        this._requests.map((qb: QueryBuilder): void => {
            promises.push(new Promise<unknown>((resolve: any, reject: any): void => {
                // qb.onError((response: AxiosResponse<any, any>): void => {
                //     // qb.callOnError(response)
                //     reject(response)
                // })
                //     .onSuccess((response: AxiosResponse<any, any>): void => {
                //         // qb.callOnSuccess(response)
                //         resolve(null)
                //     })

                qb.onStateChangeInternal((state: TQueryBuilderState) => {
                    if (state === 'Error') reject(null)
                    if (state === 'Success') resolve()
                })
                    .submit(method, options)
                //     .then(() => resolve())
                //     .catch(() => reject(null))
            }))
        })

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
    }
}
