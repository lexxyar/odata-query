import {
    CallbackFunctionNoParams,
    CallbackFunctionOneParam,
    QueryRequestOptions
} from "../lib/QueryContracts";
import {Method} from "axios/index";

export abstract class HttpRequests {
    protected _onErrorCallback: CallbackFunctionOneParam | null = null
    protected _onSuccessCallback: any | null = null
    protected _onStartCallback: CallbackFunctionNoParams | null = null
    protected _onFinishCallback: CallbackFunctionNoParams | null = null

    public abstract submit(method: Method, options?: Partial<QueryRequestOptions>): void

    public onError(fn: CallbackFunctionOneParam): this {
        this._onErrorCallback = fn
        return this
    }

    public onSuccess(fn: any): this {
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
