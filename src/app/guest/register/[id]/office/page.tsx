"use client";

import { GuestAlarmSection, GuestAreaSection, GuestCompanyNameSection, GuestElevatorSection, GuestEnterDateSection, GuestEstateUseSection, GuestFloorSection, 
    GuestLocationSection, GuestMemoSection, GuestParkingSection, GuestPersonSection, 
    GuestPropertyTypeSection, GuestSubleaseSection, GuestTradeInfoSection } from '@/app/guest/components';
import { GuestPropertyRegisterBody } from '@/app/guest/components/Register/GuestPropertyRegisterBody';
import { GuestPropertyRegisterHeader } from '@/app/guest/components/Register/GuestPropertyRegisterHeader';
import { useGetGuestPropertyById, useRegisterGuestProperty } from '@/hooks/apis';
import { GuestProperty } from '@/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function OfficeRegister() {
    const { id } = useParams();

    // 🔹 ✅ `useGetGuestById()`는 컴포넌트 최상위에서 호출해야 함
    const guestPropertyData = useGetGuestPropertyById(Number(id));
    const [, setGuestProperty] = useState<GuestProperty | null>(null);
    const [isLoading, setIsLoading] = useState(true);

      // 🔹 `guestData`가 변경될 때 상태 업데이트
    useEffect(() => {
        if (guestPropertyData.guestProperty) {
            setGuestProperty(guestPropertyData.guestProperty);
            setIsLoading(false);
        }
    }, [guestPropertyData]); // ✅ guestData가 변경될 때 실행

    const {
        state, // 전체 상태
        setField, // 개별 상태 설정
        toggleSelection,
        handleSubmit // 등록 버튼 핸들러
    } = useRegisterGuestProperty();
    
    // 🔹 `guestData` 로딩 중일 때 로딩 화면 표시
    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    // 🔹 `type`을 안전하게 가져오도록 수정
    const type = guestPropertyData.guestProperty?.type || "알 수 없음";

    return (
        <div className="w-full max-w-[800px] min-w-[800px] justify-start items-start">
            {/* 헤더부분 */}
            <GuestPropertyRegisterHeader
                handleSubmit={handleSubmit} // handleSubmit 전달
                type={type} // 매물 타입 전달
                guestPropertyId={Number(id)} // 매물 ID 전달
            />

            {/* 바디 부분 */}
            <GuestPropertyRegisterBody>
                <GuestPersonSection
                    person={state.person}
                    onPersonChange={(value) => setField("person", value)}
                />

                <GuestPropertyTypeSection
                    type={guestPropertyData.guestProperty?.type}
                    propertysCheck={state.propertys_check}
                    propertys={state.propertys}
                    propertyAllow={state.property_allow}
                    propertyAllowMemo={state.property_allow_memo}
                    onTypeCheckChange={(value) => setField("propertys_check", value)}
                    onPropertysToggle={(value) =>
                        toggleSelection(value, state.propertys, (newArray) =>
                            setField("propertys", newArray)
                        )
                    }
                    onPropertyAllowChange={(value: string) => setField("property_allow", value)}
                    onPropertyAllowMemoChange={(value) => setField("property_allow_memo", value)}
                />
                
                <GuestCompanyNameSection
                    companyName={state.company_name}
                    onCompanyNameChange={(value) => setField("company_name", value)}
                />

                <GuestEstateUseSection
                    type={guestPropertyData.guestProperty?.type}
                    estateUseCheck={state.estate_check}
                    onEstateUseCheckChange={(value) => setField("estate_check", value)}
                    estateUse={state.estate_use}
                    onEstateUseToggle={(value) => setField("estate_use",value)}
                />

                <GuestTradeInfoSection                
                    type={guestPropertyData.guestProperty?.type}
                    selectedTradeType={state.trade_types}
                    onTradeTypeSelect={(value : string) =>
                        toggleSelection(value, state.trade_types, (newArray) =>
                            setField("trade_types", newArray)
                        )
                    }

                    tradePremium={state.trade_premium}
                    onTradePremiumChange={(value) => setField("trade_premium", value)}

                    tradePriceCheck={state.trade_price_check}
                    tradeDepositCheck={state.trade_deposit_check}
                    tradeRentCheck={state.trade_rent_check}
                    onTradePriceCheckChange={(value) => setField("trade_price_check", value)}
                    onTradeDepositCheckChange={(value) => setField("trade_deposit_check", value)}
                    onTradeRentCheckChange={(value) => setField("trade_rent_check", value)}

                    tradePriceMin={state.trade_price_min}
                    tradePriceMax={state.trade_price_max}
                    onTradePriceMinChange={(value) => setField("trade_price_min", value)}
                    onTradePriceMaxChange={(value) => setField("trade_price_max", value)}

                    tradeDepositMin={state.trade_deposit_min}
                    tradeDepositMax={state.trade_deposit_max}
                    onTradeDepositMinChange={(value) => setField("trade_deposit_min", value)}
                    onTradeDepositMaxChange={(value) => setField("trade_deposit_max", value)}

                    tradeRentDepositMin={state.trade_rent_deposit_min}
                    tradeRentDepositMax={state.trade_rent_deposit_max}
                    onTradeRentDepositMinChange={(value) => setField("trade_rent_deposit_min", value)}
                    onTradeRentDepositMaxChange={(value) => setField("trade_rent_deposit_max", value)}

                    tradeRentMin={state.trade_rent_min}
                    tradeRentMax={state.trade_rent_max}
                    onTradeRentMinChange={(value) => setField("trade_rent_min", value)}
                    onTradeRentMaxChange={(value) => setField("trade_rent_max", value)}

                    tradePossibleCash={state.trade_possible_cash}
                    onTradePossibleCashChange={(value: string) => setField("trade_possible_cash", value)}
                />

                <GuestEnterDateSection
                    enterDateCheck={state.enter_date_check}
                    enterDate={state.enter_date}
                    enterIsDiscuss={state.enter_is_discuss}
                    enterIsNow={state.enter_is_now}
                    onEnterDateCheckChange={(value) => setField("enter_date_check", value)}
                    onEnterDateChange={(value) => setField("enter_date", value)}
                    onEnterDateIsDiscussToggle={(value) => setField("enter_is_discuss", value)}
                    onEnterDateIsNowToggle={(value) => setField("enter_is_now", value)}
                />

                <GuestLocationSection
                    locationsCheck={state.locations_check}
                    locations={state.locations}           
                    onLocationsCheckChange={(value) => setField("locations_check", value)}         
                    onLocationsToggle={(newArray: string[]) => setField("locations", newArray)}
                />
                
                <GuestFloorSection
                    type={guestPropertyData.guestProperty?.type}
                    floorCheck={state.floor_check}
                    floortypes={state.floor_types}
                    onFloorCheckChange={(value) => setField("floor_check", value)}
                    onFloorTypeSelect={(value) =>
                        toggleSelection(value, state.floor_types, (newArray) =>
                            setField("floor_types", newArray)
                        )
                    }
                />

                <GuestAreaSection
                    type={guestPropertyData.guestProperty?.type}
                    areaCheck={state.area_check}
                    areaReference={state.area_reference}
                    areaGround={state.area_ground}
                    areaGrossfloor={state.area_grossfloor}
                    onAreaCheckChange={(value) => setField("area_check", value)}
                    onAreaReferenceChange={(value) => setField("area_reference", value)}
                    onAreaGroundChange={(value) => setField("area_ground", value)}
                    onAreaGrossfloorChange={(value) => setField("area_grossfloor", value)}
                />

                <GuestSubleaseSection
                    subleaseCheck={state.sublease_check}
                    subleaseIs={state.sublease}
                    subleaseMemo={state.sublease_memo}
                    onSubleaseCheckChange={(value) => setField("sublease_check", value)}
                    onSubleaseIsChange={(value) => setField("sublease", value)}
                    onSubleaseMemoChange={(value) => setField("sublease_memo", value)}
                />
                <GuestParkingSection
                    parkingCheck={state.parking_check}
                    parkingNumber={state.parking_number}
                    parkingIsCar={state.parking_is_car}
                    onParkingCheckChange={(value) => setField("parking_check", value)}
                    onParkingNumberChange={(value) => setField("parking_number", value)}
                    onParkingIsCarChange={(value) => setField("parking_is_car", value)}
                />

                <GuestElevatorSection
                    elevatorCheck={state.elevator_check}
                    elevator={state.elevator_is}
                    onElevatorCheckChange={(value) => setField("elevator_check", value)}
                    onElevatorChange={(value) => setField("elevator_is", value)}
                />
                <GuestAlarmSection
                    alarm_={state.alarm}
                    onAlarmChange={(value) => setField("alarm", value)}
                />

                <GuestMemoSection
                    extraMemo={state.extra_memo}
                    onExtraMemoChange={(value) => setField("extra_memo", value)}
                />

            </GuestPropertyRegisterBody>
        </div>
    );
}
