/**
 * 매물 추천 월세 필터 시뮬레이션
 * 실행: node scripts/simulate-recommend-filter.mjs
 */

function cleanNumber(v) {
    if (!v) return 0;
    return Number(String(v).replace(/,/g, ""));
}

function matchesMonthlyRent(guestData, property) {
    const data = guestData;
    const tradeTypes = Array.isArray(property.data?.trade_types) ? property.data.trade_types : [];
    const isMonthlyItem = tradeTypes.includes("월세");

    if (!isMonthlyItem) return false;
    if (!data.trade_rent_deposit_check) return false;

    const depositMin = (data.trade_rent_deposit_check && data.trade_rent_deposit_min)
        ? cleanNumber(data.trade_rent_deposit_min) : null;
    const depositMax = (data.trade_rent_deposit_check && data.trade_rent_deposit_max)
        ? cleanNumber(data.trade_rent_deposit_max) : null;
    const rentMin = data.trade_rent_min ? cleanNumber(data.trade_rent_min) : null;
    const rentMax = data.trade_rent_max ? cleanNumber(data.trade_rent_max) : null;

    const hasDep = depositMin !== null || depositMax !== null;
    const hasRent = rentMin !== null || rentMax !== null;

    if (!(hasDep || hasRent)) return true;

    const d = property.data;
    const parseNum = (raw) => {
        if (raw === null || raw === undefined || raw === "") return NaN;
        const str = String(raw).replace(/,/g, "");
        const num = Number(str);
        return Number.isNaN(num) ? NaN : num;
    };

    const depMinVal = parseNum(d.trade_rent_deposit);
    const depMaxRaw = parseNum(d.trade_rent_deposit_sub);
    const depMaxVal = Number.isNaN(depMaxRaw) ? depMinVal : depMaxRaw;

    const rentAtMin0 = parseNum(d.trade_rent);
    const rentAtMin = Number.isNaN(rentAtMin0) ? NaN : rentAtMin0;
    const rentAtMax0 = parseNum(d.trade_rent_sub);
    const rentAtMax = Number.isNaN(rentAtMax0) ? rentAtMin : rentAtMax0;

    const endpointsUsable =
        !Number.isNaN(depMinVal) && !Number.isNaN(depMaxVal) &&
        !Number.isNaN(rentAtMin) && !Number.isNaN(rentAtMax);
    if (!endpointsUsable) return false;

    const [dMin, dMax] = [depositMin, depositMax];
    const [rMin, rMax] = [rentMin, rentMax];

    const comboMatches = (dep, rent) => {
        const depOk = (!hasDep) || ((dMin == null || dep >= dMin) && (dMax == null || dep <= dMax));
        const rentOk = (!hasRent) || ((rMin == null || rent >= rMin) && (rMax == null || rent <= rMax));
        return depOk && rentOk;
    };

    return (
        comboMatches(depMinVal, depMinVal === depMaxVal ? rentAtMax : rentAtMin) ||
        comboMatches(depMaxVal, rentAtMax)
    );
}

// ========== 테스트 데이터 ==========

// 손님 조건: 월세보증금 500~5000만원, 월세 0~120만원
const guestCondition = {
    trade_types: ["월세"],
    trade_rent_deposit_check: true,
    trade_rent_deposit_min: "500",
    trade_rent_deposit_max: "5000",
    trade_rent_min: "0",
    trade_rent_max: "120",
};

// 실제 추천 목록에서 나온 문제 매물들 (이미지 기준)
const testProperties = [
    { id: 1454, name: "월세 1000만/130만", data: { trade_types: ["월세"], trade_rent_deposit: "1000", trade_rent_deposit_sub: "", trade_rent: "130", trade_rent_sub: "" } },
    { id: 1452, name: "월세 1000만/90만", data: { trade_types: ["월세"], trade_rent_deposit: "1000", trade_rent_deposit_sub: "", trade_rent: "90", trade_rent_sub: "" } },
    { id: 1436, name: "월세 500만/160만", data: { trade_types: ["월세"], trade_rent_deposit: "500", trade_rent_deposit_sub: "", trade_rent: "160", trade_rent_sub: "" } },
    { id: 1434, name: "월세 2000만/132만", data: { trade_types: ["월세"], trade_rent_deposit: "2000", trade_rent_deposit_sub: "", trade_rent: "132", trade_rent_sub: "" } },
    { id: 1432, name: "월세 2000만/110만", data: { trade_types: ["월세"], trade_rent_deposit: "2000", trade_rent_deposit_sub: "", trade_rent: "110", trade_rent_sub: "" } },
];

// 추가 엣지 케이스
const edgeCases = [
    { id: "E1", name: "월세 120만원 경계 (정확히 통과)", data: { trade_types: ["월세"], trade_rent_deposit: "1000", trade_rent_deposit_sub: "", trade_rent: "120", trade_rent_sub: "" } },
    { id: "E2", name: "월세 121만원 (경계 초과)", data: { trade_types: ["월세"], trade_rent_deposit: "1000", trade_rent_deposit_sub: "", trade_rent: "121", trade_rent_sub: "" } },
    { id: "E3", name: "보증금 500만원 경계", data: { trade_types: ["월세"], trade_rent_deposit: "500", trade_rent_deposit_sub: "", trade_rent: "100", trade_rent_sub: "" } },
    { id: "E4", name: "보증금 5000만원 경계", data: { trade_types: ["월세"], trade_rent_deposit: "5000", trade_rent_deposit_sub: "", trade_rent: "100", trade_rent_sub: "" } },
    { id: "E5", name: "보증금 499만원 (미달)", data: { trade_types: ["월세"], trade_rent_deposit: "499", trade_rent_deposit_sub: "", trade_rent: "100", trade_rent_sub: "" } },
    { id: "E6", name: "보증금 5001만원 (초과)", data: { trade_types: ["월세"], trade_rent_deposit: "5001", trade_rent_deposit_sub: "", trade_rent: "100", trade_rent_sub: "" } },
    { id: "E7", name: "보증금 범위 500~3000만, 월세 범위 80~120만", data: { trade_types: ["월세"], trade_rent_deposit: "500", trade_rent_deposit_sub: "3000", trade_rent: "120", trade_rent_sub: "80" } },
    // E8: 500만/80만 OR 3000만/130만 → 500만/80만이 조건 충족하므로 통과 (정상 동작)
    { id: "E8", name: "보증금 500~3000만, 월세 80~130만 (저보증금 옵션으로 통과)", data: { trade_types: ["월세"], trade_rent_deposit: "500", trade_rent_deposit_sub: "3000", trade_rent: "80", trade_rent_sub: "130" } },
];

// ========== 시뮬레이션 실행 ==========

console.log("=== 매물 추천 월세 필터 시뮬레이션 ===\n");
console.log("손님 조건: 월세보증금 500~5000만원, 월세 0~120만원\n");

let passed = 0;
let failed = 0;

function runTest(prop, expected) {
    const result = matchesMonthlyRent(guestCondition, prop);
    const ok = result === expected;
    if (ok) {
        passed++;
        console.log(`  ✅ ${prop.name}: ${result ? "통과" : "제외"} (예상: ${expected ? "통과" : "제외"})`);
    } else {
        failed++;
        console.log(`  ❌ ${prop.name}: ${result ? "통과" : "제외"} (예상: ${expected ? "통과" : "제외"})`);
    }
}

console.log("--- 실제 문제 매물 (120만원 초과는 제외되어야 함) ---");
runTest(testProperties[0], false); // 130만 → 제외
runTest(testProperties[1], true);  // 90만 → 통과
runTest(testProperties[2], false);  // 160만 → 제외
runTest(testProperties[3], false);  // 132만 → 제외
runTest(testProperties[4], true);   // 110만 → 통과

console.log("\n--- 엣지 케이스 ---");
runTest(edgeCases[0], true);   // 120만 정확히 → 통과
runTest(edgeCases[1], false);  // 121만 → 제외
runTest(edgeCases[2], true);   // 보증금 500만 경계 → 통과
runTest(edgeCases[3], true);   // 보증금 5000만 경계 → 통과
runTest(edgeCases[4], false);  // 보증금 499만 → 제외
runTest(edgeCases[5], false);  // 보증금 5001만 → 제외
runTest(edgeCases[6], true);   // 500~3000만, 80~120만 (둘 다 범위 내) → 통과
runTest(edgeCases[7], true);   // 500~3000만, 80~130만 → 500만/80만 옵션이 조건 충족하므로 통과

console.log("\n--- 월세만 입력 (보증금 범위 없음) ---");
const guestRentOnly = { ...guestCondition, trade_rent_deposit_min: "", trade_rent_deposit_max: "" };
const rentOnlyResult = matchesMonthlyRent(guestRentOnly, testProperties[0]);
console.log(`  월세 130만원 매물 (보증금 조건 없음): ${rentOnlyResult ? "통과" : "제외"} (예상: 제외)`);
if (!rentOnlyResult) passed++; else failed++;

console.log("\n--- 결과 요약 ---");
console.log(`  통과: ${passed}, 실패: ${failed}`);
if (failed > 0) {
    console.log("\n  ⚠️ 일부 테스트 실패");
    process.exit(1);
} else {
    console.log("\n  ✅ 모든 시뮬레이션 통과");
}
