import {AxiosHeaders, AxiosResponse, Method, RawAxiosRequestHeaders} from "axios";
import {QueryFilterConcatenate} from "./QueryFilterConcatenate";
import {QueryFilterSign} from "./QueryFilterSign";

type MethodsHeaders = Partial<{
    [Key in Method as Lowercase<Key>]: AxiosHeaders;
} & { common: AxiosHeaders }>;

export type CallbackFunctionNoParams = () => void
export type CallbackFunctionOneParam = (response: AxiosResponse<any, any>) => void

export interface QueryRequestOptions {
    baseUrl?: string | null
    headers?: (RawAxiosRequestHeaders & MethodsHeaders) | AxiosHeaders
    // onError?: CallbackFunctionOneParam
    // onSuccess?: CallbackFunctionOneParam
    // onStart?: CallbackFunctionNoParams
    // onFinish?: CallbackFunctionNoParams
}

export interface IParserFilterStructure {
    condition: QueryFilterConcatenate
    field: string
    group: number
    operator: QueryFilterSign
    value: string
}
