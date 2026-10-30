export function providerFailure(error:unknown):string{
 const status=error&&typeof error==='object'&&'status' in error?Number(error.status):0;
 if(status===402)return 'provider_payment_required';
 if(status===401||status===403)return 'provider_access_denied';
 if(status===404)return 'provider_model_unavailable';
 if(status===429)return 'provider_quota';
 return 'provider_unavailable';
}
export function localIntents(question:string):string[]{
 const intents:string[]=[];
 if(/ร้อย|ผูก|พับแขน|แต่งตัว|แต่งชุด|สวม|เครื่องแบบ/.test(question))intents.push('dressing');
 if(/เตรียม|กี่|จัดกระเป๋า|เอาอะไร/.test(question))intents.push('packing');
 if(/เอา.*ได้|ห้าม|อนุญาต|บุหรี่|พอต|vape|pod|พัดลม|พาวเวอร์/.test(question))intents.push('permission');
 if(/ห้องน้ำ|อาบน้ำ|นอน|อาหาร|ฝน|ร้อน|ชีวิต|ป่วย/.test(question))intents.push('camp_life');
 return intents.length?intents:['unknown'];
}
