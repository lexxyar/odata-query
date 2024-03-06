import {CallbackFunctionNoParams, CallbackFunctionOneParam} from "../lib/QueryContracts";

export class HttpRequestState {
    protected _onErrorCallback: CallbackFunctionOneParam | null = null
    protected _onSuccessCallback: any | null = null
    protected _onStartCallback: CallbackFunctionNoParams | null = null
    protected _onFinishCallback: CallbackFunctionNoParams | null = null

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
}
