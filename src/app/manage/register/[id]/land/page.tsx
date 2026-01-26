"use client";

import { useState } from "react";
import { Button, Label, Separator } from "@/components/ui";
import {
    TypeSection, AddressSection,
    AlarmSection,
    ManagerSection,
    PhoneSection,
    AdminCostSection,
    AlreadyDepositSection,
    EstateUseSection,
    ComplexSection,
    AreaSection,
    FloorSection,
    DirectionSection,
    ConstructionSection,
    PetSection,
    StructureSection,
    ParkingSection,
    ViolationSection,
    HeatingSection,
    HouseSection,
    EvaluationSection,
    NaverADSection,
    SecretMemoSection,
    ImageSection,
    TradeInfoSection,
    BaseInformation,
    OtherSection,
    LoanSection,
    LandUseSection,
    EnterLoadSection,
    EnterDateSection
} from "../../../components";
import { useParams } from "next/navigation";
import { useGetPropertyById, useRegisterProperty } from "@/hooks/apis";
import { RegisterHeader } from "@/app/manage/components/Register/RegisterHeader";
import { RegisterBody } from "@/app/manage/components/Register/RegisterBody";

export default function LandRegister() {
    const { id } = useParams();
    const property = useGetPropertyById(Number(id));
    const [isSimpleMode, setIsSimpleMode] = useState(false); // ✅ 간편등록 모드 상태

    const {
        state, // 전체 상태
        setField, // 개별 상태 설정
        toggleSelection,
        handleSubmit // 등록 버튼 핸들러
    } = useRegisterProperty();


    const validateFields = () => {
        let fields = [];

        // ✅ 간편등록 모드에서는 최소한의 항목만 체크
        if (isSimpleMode) {
            if (!state.type) fields.push("매물종류");
            if (!state.address) fields.push("소재지");
            if (!state.trade_types || state.trade_types.length === 0) fields.push("거래종류");
            if (!state.trade_price && !state.trade_deposit && (!state.trade_rent || !state.trade_rent_deposit)) fields.push("거래금액");
            if (state.phones.length === 0) fields.push("연락처");
            if (!state.images || state.images.length === 0) fields.push("매물 사진");
            return fields;
        }

        if (!state.type) fields.push("매물종류");
        if (!state.estate_use) fields.push("용도");
        if (!state.land_use) fields.push("용도지역");
        if (!state.address) fields.push("소재지");
        if (!state.manager) fields.push("관리처");
        if (state.phones.length === 0) fields.push("연락처");
        if (!state.trade_types || state.trade_types.length === 0) fields.push("거래종류");
        if (!state.trade_price && !state.trade_deposit && (!state.trade_rent || !state.trade_rent_deposit)) fields.push("거래금액");
        if (!state.area_ground) fields.push("면적");
        if (!state.enterload) fields.push("진입도로");
        if (!state.other_information) fields.push("특이사항(외부노출)");
        if (!state.images || state.images.length === 0) fields.push("매물 사진");
        if (!state.evaluation || !state.evaluation_star) fields.push("평가");

        return fields;
    };


    // ✅ 버튼 클릭 시 실행되는 함수
    const handleSubmitWithValidation = async (temp: boolean) => {
        const fields = validateFields(); // 필수 입력 항목 검증

        await handleSubmit(temp); // ✅ temp 값에 따라 등록/임시 저장 구분
    };

    return (
        <div className="w-full">
            {/* 헤더부분 */}
            <RegisterHeader
                handleSubmit={handleSubmitWithValidation} // handleSubmit 전달
                propertyType={`${property.property?.property_type}`} // 매물 타입 전달
                propertyId={Number(id)} // 매물 ID 전달
                missingFields={validateFields()} // ✅ 최신 missingFields 전달
                onToggleSimpleMode={setIsSimpleMode} // ✅ 체크박스 상태 연결
            />

            {/* 바디 부분 */}
            <RegisterBody
                handleSubmit={handleSubmitWithValidation}
                missingFields={validateFields()} // ✅ 최신 missingFields 전달
            >
                <Label className="flex w-full text-3xl font-bold p-3">※ 기초정보</Label>
                <Separator className="m-2"></Separator>

                {/* ✅ 체크박스에 따라 다른 섹션 구성 */}
                {isSimpleMode ? (
                    <>
                        {/* 매물종류 */}
                        <TypeSection
                            propertytype={property.property?.property_type}
                            selectedType={state.type}
                            onTypeSelect={(value) => setField("type", value)} />

                        {/* 소재지 */}
                        <AddressSection
                            propertytype={property.property?.property_type}
                            address={state.address}
                            address_roadname={state.address_roadname}
                            address_dong={state.address_dong}
                            address_ho={state.address_ho}
                            addressDetail={state.address_detail}
                            latitude={state.latitude}
                            longitude={state.longitude}
                            onAddressChange={(value) => setField("address", value)}
                            onAddressRoadChange={(value) => setField("address_roadname", value)}
                            onAddressDongChange={(value) => setField("address_dong", value)}
                            onAddressHoChange={(value) => setField("address_ho", value)}
                            onAddressDetailChange={(value) => setField("address_detail", value)}
                            onLatChange={(value) => setField("latitude", value)}
                            onLngChange={(value) => setField("longitude", value)}
                        />


                        {/* 거래종류 및 금액 */}
                        <TradeInfoSection
                            propertytype={property.property?.property_type}
                            selectedTradeType={state.trade_types}
                            onTradeTypeSelect={(value) =>
                                toggleSelection(value, state.trade_types, (newArray) =>
                                    setField("trade_types", newArray)
                                )
                            }

                            tradePrice={state.trade_price}
                            onTradePriceChange={(value) => setField("trade_price", value)}
                            tradePriceVAT={state.trade_price_vat}
                            onTradePriceVATChange={(value => setField("trade_price_vat", value))}

                            tradeDeposit={state.trade_deposit}
                            onTradeDepositChange={(value) => setField("trade_deposit", value)}
                            tradeRent={state.trade_rent}
                            onTradeRentChange={(value) => setField("trade_rent", value)}
                            tradeRentVAT={state.trade_rent_vat}
                            onTradeRentVATChange={(value) => setField("trade_rent_vat", value)}

                            tradeRentDeposit={state.trade_rent_deposit}
                            onTradeRentDepositChange={(value) => setField("trade_rent_deposit", value)}
                            tradeRentSub={state.trade_rent_sub}
                            onTradeRentSubChange={(value) => setField("trade_rent_sub", value)}
                            tradeRentSubVAT={state.trade_rent_sub_vat}
                            onTradeRentSubVATChange={(value) => setField("trade_rent_sub_vat", value)}
                            tradeRentDepositSub={state.trade_rent_deposit_sub}
                            onTradeRentDepositSubChange={(value) => setField("trade_rent_deposit_sub", value)}
                        />

                        {/* 면적정보 */}
                        <AreaSection
                            propertytype={property.property?.property_type}
                            areaGround={state.area_ground}
                            onAreaGroundChange={(value) => setField("area_ground", value)}
                            areaGrossfloor={state.area_grossfloor}
                            onAreaGrossFloorChange={(value) => setField("area_grossfloor", value)}
                            areaSupply={state.area_supply}
                            onAreaSupplyChange={(value) => setField("area_supply", value)}
                            areaExclusive={state.area_exclusive}
                            onAreaExclusiveChange={(value) => setField("area_exclusive", value)}
                            areaType={state.area_type}
                            onAreaTypeChange={(value) => setField("area_type", value)}
                            areaReference={state.area_reference}
                            onAreaReferenceChange={(value) => setField("area_reference", value)}
                            arealand_Share={state.area_land_share}
                            onAreaLandShareChange={(value) => setField("area_land_share", value)}
                        />

                        {/* 연락처 */}
                        <PhoneSection
                            phones={state.phones}
                            phoneOwners={state.phone_owners}
                            phoneTelecom={state.phone_telecoms}
                            onPhoneChange={(value) => setField("phones", value)}
                            onPhoneOwnerSelect={(value) => setField("phone_owners", value)}
                            onPhoneTelecomChange={(value) => setField("phone_telecoms", value)}
                        />

                        {/* 사진 */}
                        <ImageSection
                            images={state.images}
                            onImagesChange={(value) => setField("images", value)}
                        />
                    </>
                ) : (
                    <>

                        {/* 매물종류 */}
                        <TypeSection
                            propertytype={property.property?.property_type}
                            selectedType={state.type}
                            onTypeSelect={(value) => setField("type", value)} />

                        {/* 건축용도 */}
                        <EstateUseSection
                            propertytype={property.property?.property_type}
                            selectedEstateUse={state.estate_use}
                            onEstateUseSelect={(value) => setField("estate_use", value)}
                        />

                        {/* 용도지역 */}
                        <LandUseSection
                            landuse={state.land_use}
                            onLandUseSelect={(value => setField("land_use", value))}
                            landuse_memo={state.land_use_memo}
                            onLandUseMemoChange={(value => setField("land_use_memo", value))}
                        />

                        {/* 소재지 */}
                        <AddressSection
                            propertytype={property.property?.property_type}
                            address={state.address}
                            address_roadname={state.address_roadname}
                            address_dong={state.address_dong}
                            address_ho={state.address_ho}
                            addressDetail={state.address_detail}
                            latitude={state.latitude}
                            longitude={state.longitude}
                            onAddressChange={(value) => setField("address", value)}
                            onAddressRoadChange={(value) => setField("address_roadname", value)}
                            onAddressDongChange={(value) => setField("address_dong", value)}
                            onAddressHoChange={(value) => setField("address_ho", value)}
                            onAddressDetailChange={(value) => setField("address_detail", value)}
                            onLatChange={(value) => setField("latitude", value)}
                            onLngChange={(value) => setField("longitude", value)}
                        />



                        {/* 관리처 */}
                        <ManagerSection selectedManager={state.manager}
                            managerMemo={state.manager_memo}
                            onManagerSelect={(value) => setField("manager", value)}
                            onManagerMemoChange={(value) => setField("manager_memo", value)}
                        />

                        {/* 연락처 */}
                        <PhoneSection
                            phones={state.phones}
                            phoneOwners={state.phone_owners}
                            phoneTelecom={state.phone_telecoms}
                            onPhoneChange={(value) => setField("phones", value)}
                            onPhoneOwnerSelect={(value) => setField("phone_owners", value)}
                            onPhoneTelecomChange={(value) => setField("phone_telecoms", value)}
                        />

                        {/* 알람 */}
                        <AlarmSection
                            selectedAlarm={state.alarm}
                            onAlarmSelect={(value) => setField("alarm", value)}
                        />

                        {/* 거래종류 및 금액 */}
                        <TradeInfoSection
                            propertytype={property.property?.property_type}
                            selectedTradeType={state.trade_types}
                            onTradeTypeSelect={(value) =>
                                toggleSelection(value, state.trade_types, (newArray) =>
                                    setField("trade_types", newArray)
                                )
                            }

                            tradePrice={state.trade_price}
                            onTradePriceChange={(value) => setField("trade_price", value)}
                            tradePriceVAT={state.trade_price_vat}
                            onTradePriceVATChange={(value => setField("trade_price_vat", value))}

                            tradeDeposit={state.trade_deposit}
                            onTradeDepositChange={(value) => setField("trade_deposit", value)}
                            tradeRent={state.trade_rent}
                            onTradeRentChange={(value) => setField("trade_rent", value)}
                            tradeRentVAT={state.trade_rent_vat}
                            onTradeRentVATChange={(value) => setField("trade_rent_vat", value)}

                            tradeRentDeposit={state.trade_rent_deposit}
                            onTradeRentDepositChange={(value) => setField("trade_rent_deposit", value)}
                            tradeRentSub={state.trade_rent_sub}
                            onTradeRentSubChange={(value) => setField("trade_rent_sub", value)}
                            tradeRentSubVAT={state.trade_rent_sub_vat}
                            onTradeRentSubVATChange={(value) => setField("trade_rent_sub_vat", value)}
                            tradeRentDepositSub={state.trade_rent_deposit_sub}
                            onTradeRentDepositSubChange={(value) => setField("trade_rent_deposit_sub", value)}
                        />

                        {/* 입주가능일 */}
                        <EnterDateSection
                            propertytype={property.property?.property_type}
                            enterDate={state.enter_date}
                            onEnterDateChange={(value) => setField("enter_date", value)}
                            enterIsDiscuss={state.enter_is_discuss}
                            onEnterDateIsDiscussToggle={(value) => setField("enter_is_discuss", value)}
                            enterIsNow={state.enter_is_now}
                            onEnterDateIsNowToggle={(value) => setField("enter_is_now", value)}
                            enterIsHasi={state.enter_is_hasi}
                            onEnterDateIsHasiToggle={(value) => setField("enter_is_hasi", value)}
                        />

                        {/* 기초정보 비고란 */}
                        <BaseInformation
                            baseInformation={state.base_infomation_memo}
                            onBaseInformationChange={(value) => setField("base_infomation_memo", value)}
                        />

                        <Label className="flex w-full text-3xl font-bold p-3 pt-10">※ 매물정보</Label>
                        <Separator className="w-full m-2"></Separator>

                        {/* 면적정보 */}
                        <AreaSection
                            propertytype={property.property?.property_type}
                            areaGround={state.area_ground}
                            onAreaGroundChange={(value) => setField("area_ground", value)}
                            areaGrossfloor={state.area_grossfloor}
                            onAreaGrossFloorChange={(value) => setField("area_grossfloor", value)}
                            areaSupply={state.area_supply}
                            onAreaSupplyChange={(value) => setField("area_supply", value)}
                            areaExclusive={state.area_exclusive}
                            onAreaExclusiveChange={(value) => setField("area_exclusive", value)}
                            areaType={state.area_type}
                            onAreaTypeChange={(value) => setField("area_type", value)}
                            areaReference={state.area_reference}
                            onAreaReferenceChange={(value) => setField("area_reference", value)}
                            arealand_Share={state.area_land_share}
                            onAreaLandShareChange={(value) => setField("area_land_share", value)}
                        />

                        {/* 진입도로 */}
                        <EnterLoadSection
                            enterload={state.enterload}
                            onEnterLoadChange={(value) => setField("enterload", value)}
                            enterload_memo={state.enterload_memo}
                            onEnterLoadMemoChange={(value) => setField("enterload_memo", value)}
                        />


                        {/* 융자 */}
                        <LoanSection
                            loan_held={state.loan_held}
                            onLoanHeldChange={(value) => setField("loan_held", value)}
                            loan_availability={state.loan_availability}
                            onLoanAvailabilityChange={(value) => setField("loan_availability", value)}
                        />

                        {/* 매물정보 기타사항 */}
                        <OtherSection
                            propertytype={property.property?.property_type}
                            other_information={state.other_information}
                            onOtherInformationChange={(value) => setField("other_information", value)}
                        />


                        <Label className="flex w-full text-3xl font-bold p-3 pt-10">※ 시설정보</Label>
                        <Separator className="w-full m-2"></Separator>


                        {/* 사진 */}
                        <ImageSection
                            images={state.images}
                            onImagesChange={(value) => setField("images", value)}
                        />

                        {/* 특징/평가 */}
                        <EvaluationSection
                            evaluation={state.evaluation}
                            onEvaluationChange={(value) => setField("evaluation", value)}
                            evaluation_star={state.evaluation_star}
                            onEvaluationStarChange={(value) => setField("evaluation_star", value)}
                        />

                        {/* N 번호 */}
                        <NaverADSection
                            naver_ad_number={state.naver_ad_number}
                            onNaverADNumberChange={(value) => setField("naver_ad_number", value)}
                        />

                        {/* 비공개란 */}
                        <SecretMemoSection
                            secret_memo={state.secret_memo}
                            onSecretMemoChange={(value) => setField("secret_memo", value)}
                        />
                    </>
                )}
            </RegisterBody>
        </div>
    );
}
