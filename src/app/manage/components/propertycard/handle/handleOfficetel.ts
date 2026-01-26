import { format } from "date-fns";
import { Property, Employee } from "@/types";
import { removeComma } from "@/utils/removeComma";
import { convertUnitFromMan } from "@/utils/convertUnitFromMan";
import { convertUnitFromWon } from "@/utils/convertUnitFromWon";

const formatDate = (date: Date | undefined): string => {
    if (!date) return "-";
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
};

const formatEnterDate = (date: Date | undefined): string => {
    if (!date) return "-";
    return format(new Date(date), "yyyy-MM-dd");
};

export const handleOfficetel = (property: Property, employees?: Employee[]): ShowData => {
    let title_data = "";
    let address = "";
    let area = "";
    let floor = "";
    let trade_sell = "";
    let trade_deposit = "";
    let trade_rent = "";
    let trade_rent_sub = "";
    let admin_cost = "";
    let information = "";
    let ev = "";
    let name = "";
    let pet = "";
    let enter_date ="";
    let parking_infor = "";
    let options = "";
    let other_options = "";
    let interior = "";
    let room_infor = "";
    
    // 제목
    if(property.data.type !== undefined)
    {
        if (property.data.address !== "") {
            title_data = property.data.address + " ";
            
            if (property.data.complex_name !== ""){
                title_data = property.data.complex_name + " ";
            }
        }
        
        if (property.data.address_dong !== "") {
            title_data = title_data + property.data.address_dong + "동 ";
        }
        
        if (property.data.floor_applicable !== "") {
            title_data = title_data + property.data.floor_applicable + "층 ";
        }

        if (property.data.address_ho !== "") {
            title_data = title_data + property.data.address_ho + "호 ";
        }


        // 주소
        if (property.data.address !== "") {
            address = property.data.address + " ";        
        }
        
        if (property.data.complex_name !== ""){
            address = address + property.data.complex_name + " ";
        }

        if (property.data.address_dong !== "") {
            address = address + property.data.address_dong + "동 ";
        }

        if (property.data.floor_applicable !== "") {
            address = address + property.data.floor_applicable + "층 ";
        }

        if (property.data.address_ho !== "") {
            address = address + property.data.address_ho + "호 ";
        }
        
        if (property.data.address_detail !== ""){
            address = address + property.data.address_detail;
        }

        // 면적
        if (property.data.area_supply !== ""){
            area = "공급:" + property.data.area_supply + "㎡ ";
        }
        
        if (property.data.area_exclusive !== ""){
            area += "전용:" + property.data.area_exclusive + "㎡ ";
        }

        if (property.data.area_reference !== ""){
            area += "참고:" + property.data.area_reference + "평 ";
        }

        // 층
        if (property.data.floor_applicable !== ""){
            floor = "층:" + property.data.floor_applicable;
        }

        if (property.data.floor_top !== ""){
            floor += "/" + property.data.floor_top; 
        }        
    


        // 매매
        if (property.data.trade_price !== "") {
            const cleanValue = removeComma(property.data.trade_price);
            const formattedValue = convertUnitFromMan(cleanValue);
            trade_sell = "매매 " + formattedValue;
        }
        
        if (property.data.trade_deposit !== "") {
            const cleanValue = removeComma(property.data.trade_deposit);
            const formattedValue = convertUnitFromMan(cleanValue);
            trade_deposit = "전세 " + formattedValue;
        }
        
        if (property.data.trade_rent !== "") {
            const depositValue = convertUnitFromMan(removeComma(property.data.trade_rent_deposit));
            const rentValue = convertUnitFromMan(removeComma(property.data.trade_rent));
            trade_rent = "월세 " + depositValue + "/" + rentValue;
        }
        
        if (property.data.trade_rent_sub !== "") {
            const depositSubValue = convertUnitFromMan(removeComma(property.data.trade_rent_deposit_sub));
            const rentSubValue = convertUnitFromMan(removeComma(property.data.trade_rent_sub));
            trade_rent_sub = "월세 " + depositSubValue + "/" + rentSubValue;
        }
        
        //관리비
        if (!property.data.admin_cost_self)
        {
            if (property.data.admin_cost !== "") {
                const adminCostValue = convertUnitFromWon(removeComma(property.data.admin_cost));
                // convertUnitFromWon이 이미 "원"을 포함하는 경우(0원) 처리
                const suffix = adminCostValue.endsWith("원") ? "" : "원";
                admin_cost = "관리비 " + adminCostValue + suffix;
            }    
        }else{
            if (property.data.admin_cost !== "" && property.data.admin_cost !== "0") {
                const adminCostValue = convertUnitFromWon(removeComma(property.data.admin_cost));
                // convertUnitFromWon이 이미 "원"을 포함하는 경우(0원) 처리
                const suffix = adminCostValue.endsWith("원") ? "" : "원";
                admin_cost = "관리비 " + adminCostValue + suffix + "(내규)";
            }else{
                admin_cost = "관리비 내규";
            }
        }
    

        //엘리베이터
        if (property.data.house_other?.includes("엘리베이터")) {
            ev = " E/V 있음";
        }

        //펫
        if (property.data.pet_allowed !== ""){
            if(property.data.pet_condition !== ""){
                pet = property.data.pet_allowed +"(" + property.data.pet_condition + ")"
            } 
            pet = property.data.pet_allowed
        }

        //룸
        if (property.data.structure_room !== ""){
            room_infor = " 방:" + property.data.structure_room;
            if (property.data.structure_bathroom !== "") {
                room_infor += " 욕실:" + property.data.structure_bathroom;
            }
            if (property.data.structure_living_room !== "") {
                room_infor += " " + property.data.structure_living_room;
            }
            if (property.data.structure_living_room_memo !== ""){
                room_infor += " " + property.data.structure_living_room_memo;
            }
        }
        
        //주차
        if (property.data.parking_available !== ""){
            parking_infor = property.data.parking_available;
            if(property.data.parking_method){
                parking_infor += " " + property.data.parking_method;
            } 
            if(property.data.parking_number !== ""){
                parking_infor += " " + property.data.parking_number + "대";
            }
            if(property.data.parking_cost !== ""){
                parking_infor += " " + property.data.parking_cost + "원";
            }
            if(property.data.parking_memo !== ""){
                parking_infor += " " + property.data.parking_memo;
            }
        }
        
        // 옵션
        if (property.data.house_options && property.data.house_options.length > 0) {
            options = property.data.house_options.join(" | ");
        }
        
        if (property.data.house_other && property.data.house_other.length > 0) {
            other_options = property.data.house_other.join(" | ");
        }
        
        //인테리어&수도인입
        if (property.data.interior !== ""){
            interior = property.data.interior;
            if(property.data.interior_memo !== ""){
                interior += " " + property.data.interior_memo;
            }
        }

        if (property.data.water_possible !== ""){
            interior += property.data.water_possible;
        }

        //입주가능일
        if (formatEnterDate(property.data.enter_date) !== "-") {
            enter_date += formatEnterDate(property.data.enter_date);
        } 

        if (property.data.enter_is_now){
            enter_date  += " 즉시"
        }
        if (property.data.enter_is_discuss){
            enter_date  += " 협의" 
        }
        if (property.data.enter_is_hasi){
            enter_date  += " 하시"
        }      

        // 담당자 (employee_id를 통해 employees에서 찾기)
        if (property.employee_id && employees) {
            const employee = employees.find(emp => emp.id === property.employee_id);
            if (employee) {
                name = employee.kakao_name || employee.name || "";
            }
        }

        //옵션    
        if (property.data.structure_room !== "") {
            let room = "";
            let bathroom = "";
            let parking = "";
            let livingroom = "";
            let enterdate = " 입주가능일:";
    
            if (property.data.structure_room !== "") {
                room = " 방:" + property.data.structure_room;
            }
            if (property.data.structure_bathroom !== "") {
                bathroom = " 욕실:" + property.data.structure_bathroom;
            }
            if (property.data.parking_number !== "") {
                parking = " 주차:" + property.data.parking_number + "/" + property.data.parking_total;
            }
            if (property.data.structure_living_room !== "") {
                livingroom = " " + property.data.structure_living_room;
            }
    
            if (formatEnterDate(property.data.enter_date) !== "-") {
                enterdate += formatEnterDate(property.data.enter_date);
            } 

            if (property.data.enter_is_now){
                enterdate  += " 즉시"
                console.log(enterdate)
            }
            if (property.data.enter_is_discuss){
                enterdate  += " 협의" 
            }
            if (property.data.enter_is_hasi){
                enterdate  += " 하시"
            }      
            information = room + bathroom + livingroom + parking + ev + enterdate;
        }
    }

    return {
        sd_title: title_data,
        sd_name: name,
        sd_address: address,
        sd_address_simple: property.data.address,
        sd_complex: property.data.complex_name,
        sd_latitude: property.data.latitude,
        sd_longitude: property.data.longitude,
        sd_type: property.data.type,
        sd_estate_use: property.data.estate_use,
        sd_account: (() => {
            if (property.employee_id && employees) {
                const employee = employees.find(emp => emp.id === property.employee_id);
                if (employee) return employee.kakao_email || employee.email || "";
            }
            return "";
        })(),
        sd_construction_standard: property.data.construction_standard,
        sd_construct_date: formatEnterDate(property.data.construction_date),
        sd_enter_date: enter_date,
        sd_area: area,
        sd_floor: floor,
        sd_floor_applicable: `${property.data.floor_applicable}층`,
        sd_floor_level: property.data.floor_level || null,
        sd_floor_top: `${property.data.floor_top}층`,
        sd_floor_underground: `${property.data.floor_underground}층`,
        sd_side: `${property.data.direction_standard} - ${property.data.direction_side}`,
        sd_create_at: `최초 등록일: ${formatDate(property.create_at)}`,
        sd_update_at: `최근 수정일: ${formatDate(property.update_at)}`,
        sd_on_board_at: `광고 수정일: ${formatDate(property.on_board_state?.on_board_at)} ${property.on_board_state?.on_board_update_user} ${property.on_board_state?.on_board_state ? "on" : "off"}`,
        sd_trade_price: trade_sell,
        sd_trade_deposit: trade_deposit,
        sd_trade_rent: trade_rent,
        sd_trade_rent_sub: trade_rent_sub,
        sd_admin_cost: admin_cost,
        sd_pet: pet,
        sd_interrior: interior,
        sd_parking_infor: parking_infor,
        sd_options : options,
        sd_other_options : other_options,
        sd_information: information,
        sd_secretdata: property.data.secret_memo,
        sd_image: property.data.images,
        sd_room_infor: room_infor,
        sd_evaluation: property.data.evaluation,
        sd_evaluation_star: property.data.evaluation_star,
        sd_otherinfor: property.data.other_information,        
        sd_violation : `${property.data.violation}${property.data.violation_memo}`

    };
};
