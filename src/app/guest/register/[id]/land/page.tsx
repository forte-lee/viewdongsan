"use client";

import { GuestAlarmSection, GuestEnterLoadSection, GuestEstateUseSection, 
    GuestLandUseSection, 
    GuestLocationSection, GuestMemoSection, GuestTradeInfoSection } from '@/app/guest/components';
import { GuestPropertyRegisterBody } from '@/app/guest/components/Register/GuestPropertyRegisterBody';
import { GuestPropertyRegisterHeader } from '@/app/guest/components/Register/GuestPropertyRegisterHeader';
import { useGetGuestPropertyById, useRegisterGuestProperty } from '@/hooks/apis';
import { GuestProperty } from '@/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function LandRegister() {
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

                <GuestEstateUseSection
                    type={guestPropertyData.guestProperty?.type}
                    estateUseCheck={state.estate_check}
                    onEstateUseCheckChange={(value) => setField("estate_check", value)}
                    estateUse={state.estate_use}
                    onEstateUseToggle={(value) => setField("estate_use",value)}
                />

                <GuestLandUseSection
                    landUseCheck={state.land_use_check}
                    onLandUseCheckChange={(value) => setField("land_use_check",value)}
                    landUse={state.land_use}
                    onLandUseToggle={(newArray: string[]) => setField("land_use", newArray)}
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
                    tradeRentDepositCheck={state.trade_rent_deposit_check}
                    onTradePriceCheckChange={(value) => setField("trade_price_check", value)}
                    onTradeDepositCheckChange={(value) => setField("trade_deposit_check", value)}
                    onTradeRentCheckChange={(value) => setField("trade_rent_check", value)}
                    onTradeRentDepositCheckChange={(value) => setField("trade_rent_deposit_check", value)}

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

                <GuestLocationSection
                    locationsCheck={state.locations_check}
                    locations={state.locations}           
                    onLocationsCheckChange={(value) => setField("locations_check", value)}         
                    onLocationsToggle={(newArray: string[]) => setField("locations", newArray)}
                />

                <GuestEnterLoadSection
                    enterLoadCheck={state.enter_load_check}
                    onEnterLoadCheckChange={(value) => setField("enter_load_check", value)}
                    enterLoad={state.enter_load}
                    onEnterLoadChange={(value) => setField("enter_load", value)}
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
