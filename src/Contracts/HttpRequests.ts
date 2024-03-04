import {
    CallbackFunctionDownloadProgress,
    CallbackFunctionNoParams,
    CallbackFunctionOneParam, CallbackFunctionUploadProgress,
    QueryRequestOptions
} from "../lib/QueryContracts";
import {Method} from "axios";

export abstract class HttpRequests {
    protected _uid: string = '';
    protected _onErrorCallback: CallbackFunctionOneParam | null = null
    protected _onSuccessCallback: any | null = null
    protected _onStartCallback: CallbackFunctionNoParams | null = null
    protected _onFinishCallback: CallbackFunctionNoParams | null = null
    protected _onUploadProgressCallback: CallbackFunctionUploadProgress | null = null
    protected _onDownloadProgressCallback: CallbackFunctionDownloadProgress | null = null

    public abstract submit(method: Method, options?: Partial<QueryRequestOptions>): void

    public constructor() {
        this._uid = Math.random().toString(36).slice(-8)
    }

    public getUid(): string {
        return this._uid
    }

    public onUploadProgress(fn: CallbackFunctionUploadProgress): this {
        this._onUploadProgressCallback = (id: any) => fn
        return this
    }

    public onDownloadProgress(fn: CallbackFunctionDownloadProgress): this {
        this._onDownloadProgressCallback = fn
        return this
    }

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
