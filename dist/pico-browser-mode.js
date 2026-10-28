// Retired companion credentials are tab-local. Project/localStorage data is untouched.
export function clearRetiredSDKPairing({storage=globalThis.sessionStorage,location=globalThis.location,history=globalThis.history}={}){
 for(const key of ['wirevo-sdk-connection-v1','wirevo-sdk-pending-v1'])try{storage?.removeItem(key);}catch{}
 if(location?.hash?.startsWith('#wirevo-sdk='))try{history?.replaceState(null,'',location.pathname+location.search);}catch{}
}
