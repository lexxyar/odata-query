import {
    CallbackFunctionDownloadProgress,
    CallbackFunctionOneParam,
    CallbackFunctionUploadProgress,
    QueryRequestOptions
} from "../lib/QueryContracts";
// import {AxiosResponse, Method} from "axios";
import {HttpRequestState} from "./HttpRequestState";

export abstract class HttpRequests extends HttpRequestState {
    protected _onSuccessCallback: CallbackFunctionOneParam | null = null
    protected _onUploadProgressCallback: CallbackFunctionUploadProgress | null = null
    protected _onDownloadProgressCallback: CallbackFunctionDownloadProgress | null = null

    public constructor() {
        super()
    }

    public onUploadProgress(fn: CallbackFunctionUploadProgress): this {
        this._onUploadProgressCallback = fn
        return this
    }

    public onDownloadProgress(fn: CallbackFunctionDownloadProgress): this {
        this._onDownloadProgressCallback = fn
        return this
    }

    // public callOnError(response: AxiosResponse<any, any>): void {
    //     if (this._onErrorCallback) {
    //         this._onErrorCallback(response)
    //     }
    // }
    //
    // public callOnSuccess(response: AxiosResponse<any, any>): void {
    //     if (this._onSuccessCallback) {
    //         this._onSuccessCallback(response)
    //     }
    // }


}
