// // src/app/api/staticmap/route.ts
// import { NextResponse } from "next/server";
// import axios from "axios";

// const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// export async function GET(req: Request) {
//     console.log("\n\n================= 🟦 STATIC MAP API DEBUG START =================");

//     try {
//         const { searchParams } = new URL(req.url);

//         const lat = searchParams.get("lat");
//         const lng = searchParams.get("lng");
//         const width = searchParams.get("w") ?? "400";
//         const height = searchParams.get("h") ?? "250";
//         const level = searchParams.get("level") ?? "7";

//         console.log("📌 INPUT PARAMS:", { lat, lng, width, height, level });
//         console.log("📌 Kakao API KEY Loaded:", !!KAKAO_REST_API_KEY);

//         if (!lat || !lng) {
//             console.log("❌ ERROR: lat/lng missing");
//             return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
//         }

//         // 요청 URL 생성
//         const url = `https://dapi.kakao.com/v2/maps/static/map?center=${lng},${lat}&level=${level}&w=${width}&h=${height}`;

//         console.log("📌 FINAL REQUEST URL →", url);

//         // 헤더 출력
//         const headers = {
//             Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
//         };
//         console.log("📌 REQUEST HEADERS:", headers);

//         let resp;

//         try {
//             resp = await axios.get(url, {
//                 responseType: "arraybuffer",
//                 validateStatus: () => true, // 200이 아니어도 응답 받기 위해
//             });
//         } catch (networkErr: any) {
//             console.log("🔥 NETWORK ERROR:", networkErr.message);
//             return NextResponse.json({ error: "Network error to Kakao" }, { status: 500 });
//         }

//         console.log("📌 Kakao Response Status:", resp.status);

//         // 200이 아닌 경우 응답 body 내용을 text로 출력
//         if (resp.status !== 200) {
//             console.log("❌ Kakao Error Response Headers:", resp.headers);

//             try {
//                 const textBody = Buffer.from(resp.data).toString("utf8");
//                 console.log("❌ Kakao Error Body:", textBody);
//             } catch (err) {
//                 console.log("❌ Unable to decode error body");
//             }

//             return NextResponse.json(
//                 { error: `Kakao API error (status: ${resp.status})` },
//                 { status: 500 }
//             );
//         }

//         console.log("✅ SUCCESS: Received PNG buffer from Kakao");
//         console.log("================= 🟩 STATIC MAP API DEBUG END =================\n");

//         return new NextResponse(resp.data, {
//             status: 200,
//             headers: {
//                 "Content-Type": "image/png",
//             },
//         });

//     } catch (err: any) {
//         console.log("🔥 UNEXPECTED SERVER ERROR:", err.message);
//         return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
//     }
// }
