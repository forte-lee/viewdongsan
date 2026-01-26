interface ShowData {
    sd_title?:string | null;              //매물 제목
    sd_address?:string | null;            //매물 주소
    sd_address_simple?:string | null;     //심플 주소
    sd_complex?:string | null;            //단지명
    sd_latitude?:string | null;           //매물 위도
    sd_longitude?:string | null;          //매물 경도
    sd_type?:string | null;               //매물 타입
    sd_estate_use?:string | null;          //사용용도
    sd_construction_standard?:string | null;    //기준
    sd_construct_date?:string | null;       //준공년도
    sd_account?:string | null;            //계정
    sd_name?:string | null;                //이름
    sd_area?:string | null;                //공급면적
    sd_floor?:string | null;                //층
    sd_floor_applicable?:string | null;     //해당층
    sd_floor_level?:string | null;          //층수레벨 (고/중/저)
    sd_floor_top?:string | null;            //탑층
    sd_floor_underground?: string | null;   //지하층
    sd_side?:string|null;                   //방향
    sd_create_at?:string | null;          //최초 등록일
    sd_update_at?:string | null;          //최종 수정일
    sd_on_board_at?:string | null;         //광고수정일
    sd_trade_price?:string | null;        //매매
    sd_trade_deposit?:string | null;      //전세
    sd_trade_rent?:string | null;          //월세
    sd_trade_rent_sub?:string | null;        //월세 sub
    sd_admin_cost?:string | null;        //관리비
    sd_enter_date?:string | null;          //입주가능일
    sd_room_infor?:string | null;           //방정보
    sd_parking_infor?:string | null;        //주차정보
    sd_elevetor?:string | null;             //엘리베이터
    sd_information?:string | null;          //세부정보 : 방개수, 욕실수, 주차수, 거실여부, E/V, 입주예정일
    sd_interrior?:string | null;            //인테리어
    sd_pet?:string | null;                  //반려동물
    sd_secretdata?:string | null;          //비공개 비고란
    sd_options?:string | null;              //옵션
    sd_other_options?: string | null;       //기타사항
    sd_image?:string[];                     //사진데이터
    sd_evaluation?: string;                 //한줄평
    sd_evaluation_star?: string;            //평점
    sd_otherinfor?: string;                 //특이사항
    sd_violation?: string;                  //위반사항
    sd_land_use?:string | null;             //용도지역
    sd_enter_load?:string | null;           //진입도로
    sd_enter_load_memo?:string | null;      //진입도로메모
    score_price?: number;                     //금액 점수
    score_size?: number;                      //사이즈 점수
    score_freshness?: number;                 //신선도 점수
    score_condition?: number;                 //컨디션 점수
    score_other?: number;                     //기타점수
    avg_price?: number;                       //평균 금액 점수
    avg_size?: number;                        //평균 사이즈 점수
    avg_freshness?: number;                   //평균 신선도 점수
    avg_condition?: number;                   //평균 컨디션 점수
    avg_other?: number;                       //평균 기타점수
}