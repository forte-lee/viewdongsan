import { format } from "date-fns";
import { Property, Employee } from "@/types";
import { removeComma } from "@/utils/removeComma";
import { convertUnitFromMan } from "@/utils/convertUnitFromMan";
import { ShowData } from "../Data";

const formatDate = (date: Date | undefined): string => {
    if (!date) return "-";
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
};

const formatEnterDate = (date: Date | undefined): string => {
    if (!date) return "-";
    return format(new Date(date), "yyyy-MM-dd");
};

export const handleLand = (property: Property, employees?: Employee[]): ShowData => {
    let title_data = "";
    let address = "";
    let area = "";
    let trade_sell = "";
    let trade_deposit = "";
    let trade_rent = "";
    let trade_rent_sub = "";
    let admin_cost = "";
    let information = "";
    let ev = "";
    let name = "";
    let enter_date ="";
    let parking_infor = "";
    let options = "";
    let other_options = "";
    let interior = "";

    // 제목
    if(property.data.type !== undefined){
        if (property.data.address !== "") {
            title_data = property.data.address + " ";
            
            if (property.data.complex_name !== ""){
                title_data = property.data.complex_name + " ";
            }
        }
        
        if (property.data.address_dong !== "") {
            title_data = title_data + property.data.address_dong + "동 ";
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
        if (property.data.area_ground !== "") {
            const raw = property.data.area_ground;
            const ground = Number(raw.replace(/,/g, ""));
            if (!isNaN(ground) && ground > 0) {
                area += `면적: ${raw}㎡(${(ground / 3.3).toFixed(0)}평)\n`;
            } else {
                area += `면적: ${raw}㎡\n`;
            }
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
        
        if(!property.data.admin_cost_self)
            {
                if (property.data.admin_cost !== "") {
                    const adminCostValue = property.data.admin_cost;
                    admin_cost = "관리비 " + adminCostValue + "원";
                }    
            }else{
                admin_cost = "관리비 별도";
            }
    

        if (property.data.house_other?.includes("엘리베이터")) {
            ev = " E/V 있음";
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
        sd_construct_date: formatEnterDate(property.data.construction_date),
        sd_enter_date: enter_date,
        sd_area: area,
        sd_create_at: `최초 등록일: ${formatDate(property.create_at)}`,
        sd_update_at: `최근 수정일: ${formatDate(property.update_at)}`,
        sd_on_board_at: `광고 수정일: ${formatDate(property.on_board_state?.on_board_at)} ${property.on_board_state?.on_board_update_user} ${property.on_board_state?.on_board_state ? "on" : "off"}`,
        sd_trade_price: trade_sell,
        sd_trade_deposit: trade_deposit,
        sd_trade_rent: trade_rent,
        sd_trade_rent_sub: trade_rent_sub,
        sd_admin_cost: admin_cost,
        sd_interrior: interior,
        sd_parking_infor: parking_infor,
        sd_options : options,
        sd_other_options : other_options,
        sd_information: information,
        sd_secretdata: property.data.secret_memo,
        sd_image: property.data.images,
        sd_evaluation: property.data.evaluation,
        sd_evaluation_star: property.data.evaluation_star,
        sd_otherinfor: property.data.other_information,
        sd_land_use: property.data.land_use,
        sd_enter_load: property.data.enterload,
        sd_enter_load_memo: property.data.enterload_memo,        
    };
};
