import { Property, Employee } from "@/types";
import { ShowData } from "../Data";
import { handleApt } from "../handle/handleApt";
import { handleOfficetel } from "../handle/handleOfficetel";
import { handleVillamulti } from "../handle/handleVillamulti";
import { handleVilla } from "../handle/handleVilla";
import { handleOffice } from "../handle/handleOffice";
import { handleBuilding } from "../handle/handleBuilding";
import { handleLand } from "../handle/handleLand";

/**
 * Property → ShowData 변환 (링크 공유 시 API 조회 데이터용)
 * employees 없이 호출 가능 (비로그인 공유 시)
 */
export function propertyToShowData(property: Property, employees?: Employee[]): ShowData {
    switch (property.property_type) {
        case "아파트":
            return handleApt(property, employees);
        case "오피스텔":
            return handleOfficetel(property, employees);
        case "공동주택(아파트 외)":
            return handleVillamulti(property, employees);
        case "단독주택(임대)":
            return handleVilla(property, employees);
        case "상업/업무/공업용":
            return handleOffice(property, employees);
        case "건물":
            return handleBuilding(property, employees);
        case "토지":
            return handleLand(property, employees);
        default:
            return handleApt(property, employees);
    }
}
