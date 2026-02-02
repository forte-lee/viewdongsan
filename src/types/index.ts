export interface Employee {
    id: number;
    company_id: number;
    name: string;
    position: string;
    manager: string;
    email: string;
    phone?: string;
    kakao_name?: string | null;
    kakao_email?: string | null;
    supabase_user_id?: string | null; // Supabase user.id (UUID) - 카카오 이메일 변경과 무관하게 사용자 식별
    created_at: Date;
    enter_date?: Date | null;
}

//부동산 데이터
export interface Property {
    id: number;
    account: string;
    name: string;
    create_at: Date;
    update_at: Date;
    on_board_state: OnBoard;
    property_type: string;
    is_register: boolean;
    employee_id?: number | null; // 직원 ID (이메일 기반 매칭 대신 사용)
    data: PropertyData;
}

//광고 등록 관련 데이터
export interface OnBoard {
    on_board_state: boolean;
    on_board_at: Date;
    on_board_update_user: string;
}

//데이터베이스에 등록되는 데이터(모든 데이터가 들어가고, 각각 필요한 항목만 입력)
export interface PropertyData {
    name: string;           //이름

    manager: string;        //관리처
    manager_memo: string;   //비고란

    type: string;           //매물타입

    address: string;        //주소
    address_roadname: string; //도로명주소
    address_dong: string;   //동
    address_ho: string;      //호
    address_detail: string; //상세주소
    latitude: string;       //위도
    longitude: string;      //경도

    complex_name: string;          //단지명

    alarm: string;          //알람

    phones: string[];          //연락처
    phone_owners: string[];     //연락처주인
    phone_telecoms: string[];   //통신사

    trade_types: string[];     //거래종류

    trade_price: string;                    //매매가
    trade_price_vat: boolean;               //부가세포함
    trade_deposit: string;                  //전세보증금
    trade_rent_deposit: string;             //월세보증금
    trade_rent: string;                     //월세
    trade_rent_vat: boolean;                //부가세포함
    trade_rent_deposit_sub: string;         //월세보증금
    trade_rent_sub: string;                 //월세
    trade_rent_sub_vat: boolean;            //부가세포함

    admin_cost: string;             //관리비
    admin_cost_vat: boolean;        //부가세포함
    admin_cost_self: boolean;        //내규
    admin_cost_includes: string[];  //포함내역
    admin_cost_memo: string;        //관리비 비고

    already_tenant: string;        //전임차인
    already_tenant_memo: string;   //현임차인 비고
    already_end_date: Date | undefined;        //만기일
    already_renew_request: string; //갱신청구
    already_renew_request_memo: string;    //갱신청구 비고
    already_deposit: string;        //기보증금
    already_rent: string;           //월세
    already_admin_cost: string;     //관리비
    already_premium: string;        //권리금
    already_premium_memo:string;    //권리금 메모
    already_jobtype: string;        //업종
    already_jobwant: string;        //선호업종
    
    enter_date: Date | undefined;   //입주가능일
    enter_is_discuss: boolean;      //협의
    enter_is_now: boolean;          //즉시
    enter_is_hasi: boolean;         //하시

    building_total_tenant: string;  //임차인 수
    building_total_deposit: string; //총보증금
    building_total_rent: string;    //총 월세
    building_total_admincost: string;   //총 관리비
    building_total_cost: string;        //총 비용
    building_total_rate:string;         //총수익률
    building_rooms: string[];           //호실
    building_deposits: string[];        //보증금
    building_rents: string[];           //월세
    building_admincosts: string[];      //관리비
    building_memos:string[];            //비고
    building_enddates: Date[];           //만기일
    building_jobs:string[];             //업종    

    base_infomation_memo: string;   //기초정보 비고

    estate_use: string;            //사용용도
    
    interior: string;               //인테리어
    interior_memo: string;          //인테리어 메모

    area_ground: string;           //대지면적
    area_grossfloor: string;       //연면적
    area_supply: string;           //공급면적
    area_exclusive: string;        //전용면적
    area_type: string;             //타입
    area_reference: string;        //참고면적
    area_land_share: string;       //대지지분

    floor_applicable: string;      //해당층
    floor_level: string;           //층수레벨 (고/중/저)
    floor_top: string;             //지상층
    floor_underground: string;     //지하층
    floor_semibasement: boolean;    //반지하여부
    floor_rooftop: boolean;        //탑층여부

    direction_standard: string;    //기준
    direction_side: string;        //방향

    construction_standard: string; //기준일자
    construction_date: Date | undefined    //일자

    pet_allowed: string;         //가능여부
    pet_condition: string;         //조건

    water_possible: string;         //수도인입
    water_memo: string;             //비고

    structure_room: string;            //방수
    structure_bathroom: string;        //화장실
    structure_living_room: string;     //거실유무
    structure_living_room_memo: string; //비고

    parking_total: string;         //총 주차수
    parking_method: string[];        //주차방식
    parking_method_memo: string;     //주차방식 메모    
    parking_available: string;     //주차가능여부
    parking_number: string;        //주차대수
    parking_cost: string;         //주차비
    parking_memo: string;          //비고

    violation: string;         //위반사항
    violation_memo: string;    //위반비고

    enterload: string;          //진입도로 유무
    enterload_memo: string;     //진입도로 비고

    land_use: string;           //용도지역
    land_use_memo: string;      //용도지역비고

    loan_held: string;                 //기대출
    loan_availability: string;         //대출가능여부

    other_information: string;             //기타사항

    heating_method: string;            //난방방식
    heating_fuel: string;              //난방연료

    house_aircon: string[];                  //에어컨
    house_options: string[];              //옵션
    house_options_memo: string;           //옵션 메모
    house_security: string[];             //보안
    house_security_memo: string;           //보안 메모
    house_other: string[];                //기타사항
    house_other_memo: string;              //기타사항 메모

    images: string[];                           //사진리스트
    images_watermark: string[];                 //워터마크사진리스트

    evaluation: string;            //평가
    evaluation_star: string;       //평가점수

    naver_ad_number: string;           //네이버 광고

    secret_memo: string;               //비공개메모
}

//손님 데이터
export interface Guest {
    id: number;
    account: string;
    create_at: Date;
    update_at: Date;
    company: string;
    management: boolean;
    employee_id?: number | null; // 직원 ID (이메일 기반 매칭 대신 사용)
    data: GuestData;
}

//손님 세부 데이터
export interface GuestData {
    name: string;               //이름
    sex: string;                //성별
    phone: string[];            //연락처
    memo: string;               //메모
}


//손님 매물 데이터
export interface GuestProperty{
    id: number;
    guest_id: number;
    account: string;
    guest_name: string;
    create_at: Date;
    update_at: Date;
    type: string;
    alarm: boolean;
    data: GuestPropertyData;
}


//손님 매물 세부 데이터
export interface GuestPropertyData {    
    type: string;                      //선택한 매물타입
    
    person: string;                     //사용인원

    company_name: string;               //상호명
    
    propertys_check: boolean;            //체크
    propertys: string[];                //용도
    property_allow: string;           //허가   
    property_allow_memo: string;        //허가메모 
    
    estate_check: boolean;           //체크
    estate_use: string[];            //사용용도

    land_use_check: boolean;        //체크
    land_use: string[];             //용도지역

    trade_types: string[];                   //거래종류
    
    trade_possible_cash: string;            //가용현금
    trade_premium: string;                  //권리금

    trade_price_check: boolean;                  //체크
    trade_price_min: string;                    //매매가
    trade_price_max: string;                    //최대 매매가

    trade_deposit_check: boolean;                //체크
    trade_deposit_min: string;                  //전세보증금    
    trade_deposit_max: string;                  //최대 전세 보증금    

    trade_rent_check: boolean;   
    trade_rent_deposit_check: boolean;          //월세보증금 체크
    trade_rent_deposit_min: string;             //월세보증금
    trade_rent_deposit_max: string;             //최대 월세 보증금
    trade_rent_min: string;                     //월세
    trade_rent_max: string;                     //최대 월세


    enter_date_check: boolean;                      //체크
    enter_date: Date | undefined;                   //입주예정일

    enter_is_discuss: boolean;               //협의
    enter_is_now: boolean;                   //즉시입주

    locations_check: boolean;
    locations: string[];                    //지역

    area_check: boolean;                    //체크
    area_reference: string;                 //참고면적
    area_ground: string;                    //대지면적
    area_grossfloor: string;                //연면적


    room_check: boolean;                //체크
    room_number: string;                //방수
    room_bathroom_number: string;       //욕실수
    room_is_livingroom: string;        //거실유무

    parking_check: boolean;             //체크
    parking_number: string;             //주차대수
    parking_is_car: string;             //주차여부

    pet_check: boolean;             //체크
    pet_is_pet: string;             //애완여부
    pet_memo: string;               //펫 종류

    floor_check: boolean;               //체크
    floor_types: string[];                //층

    elevator_check: boolean;                //체크
    elevator_is: string;                   //엘베
    
    interior_check: boolean;        //체크
    interior: string;               //인테리어

    enter_load_check: boolean;      //체크
    enter_load: string;             //진입도로

    alarm: string;                  //알람주기

    sublease_check : boolean;       //체크
    sublease : string;              //전대여부
    sublease_memo : string;         //전대메모

    extra_memo: string;                   //비고란
}