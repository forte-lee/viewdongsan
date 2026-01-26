// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/utils/supabase/client";

// const REST_API_KEY = "1cf255e5566607a9b0be8c34083cccb7"; // REST API KEY

// export default function ConvertAddressPage() {
//     const [log, setLog] = useState<string>("🚀 전체 변환 준비중...");

//     const runConverter = async () => {
//         setLog("1️⃣ 모든 매물 데이터를 불러오는 중...");

//         // 🔥 전체 매물 가져오기
//         const { data: properties, error } = await supabase
//             .from("property")
//             .select("id, data");

//         if (error) {
//             setLog(`❌ Supabase 조회 오류: ${error.message}`);
//             return;
//         }

//         if (!properties || properties.length === 0) {
//             setLog("❌ 변환할 매물이 없습니다.");
//             return;
//         }

//         let countSuccess = 0;
//         let countFail = 0;
//         let countSkip = 0;

//         // 🔄 전체 매물 반복 처리
//         for (const p of properties) {
//             const currentData = p.data || {};
//             const jibun = currentData.address || ""; // data.address 사용

//             // 주소 없는 매물은 스킵
//             if (!jibun || jibun.trim() === "") {
//                 setLog(prev => prev + `\n⚠️ [${p.id}] data.address 없음 → 스킵`);
//                 countSkip++;
//                 continue;
//             }

//             // 이미 도로명주소가 있으면 스킵
//             if (currentData.address_roadname) {
//                 setLog(prev => prev + `\n⏩ [${p.id}] 이미 변환됨: ${currentData.address_roadname}`);
//                 countSkip++;
//                 continue;
//             }

//             // 변환 로그
//             setLog(prev => prev + `\n🔍 [${p.id}] 변환 중... (${jibun})`);

//             const road = await getRoadAddress(jibun, REST_API_KEY);

//             if (road) {
//                 const newData = {
//                     ...currentData,
//                     address_roadname: road,  // 🍀 새 도로명 주소 입력
//                 };

//                 await supabase
//                     .from("property")
//                     .update({ data: newData })
//                     .eq("id", p.id);

//                 countSuccess++;
//                 setLog(prev => prev + `\n✔ [${p.id}] 업데이트 완료 → ${road}`);
//             } else {
//                 countFail++;
//                 setLog(prev => prev + `\n❌ [${p.id}] 도로명주소 변환 실패`);
//             }
//         }

//         setLog(prev =>
//             prev +
//             `\n\n🎉 전체 작업 완료!\n` +
//             `----------------------------------\n` +
//             `성공 ✔ : ${countSuccess}건\n` +
//             `실패 ❌ : ${countFail}건\n` +
//             `스킵 ⏩ : ${countSkip}건\n` +
//             `----------------------------------`
//         );
//     };

//     useEffect(() => {
//         runConverter();
//     }, []);

//     return (
//         <div className="p-6 text-sm text-white bg-black h-screen overflow-auto">
//             <pre>{log}</pre>
//         </div>
//     );
// }

// async function getRoadAddress(jibun: string, apiKey: string) {
//     const query = encodeURIComponent(jibun);
//     const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`;

//     const res = await fetch(url, {
//         headers: { Authorization: `KakaoAK ${apiKey}` },
//     });

//     const json = await res.json();

//     if (json.documents?.length > 0) {
//         return json.documents[0].road_address?.address_name || "";
//     }

//     return "";
// }
