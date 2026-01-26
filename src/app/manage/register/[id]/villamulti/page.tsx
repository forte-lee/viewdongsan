"use client";

import { useState, useEffect } from "react";
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
    EnterDateSection
} from "../../../components";
import { useParams } from "next/navigation";
import { useGetPropertyById, useRegisterProperty } from "@/hooks/apis";
import { RegisterHeader } from "@/app/manage/components/Register/RegisterHeader";
import { RegisterBody } from "@/app/manage/components/Register/RegisterBody";

//공동주택
export default function VillamultiRegister() {
    const { id } = useParams();
    const property = useGetPropertyById(Number(id));
    const [isSimpleMode, setIsSimpleMode] = useState(false); // ✅ 간편등록 모드 상태

    const {
        state, // 전체 상태
        setField, // 개별 상태 설정
        toggleSelection,
        handleSubmit // 등록 버튼 핸들러
    } = useRegisterProperty();

    // 에어컨 옵션이 해제되면 에어컨 종류도 초기화
    useEffect(() => {
        if (!state.house_options.includes("에어컨") && state.house_aircon.length > 0) {
            setField("house_aircon", []);
        }
    }, [state.house_options, state.house_aircon, setField]);

    const validateFields = (): string[] => {
        const fields: string[] = [];

        // ✅ 간편등록 모드에서는 최소한의 항목만 체크
        if (isSimpleMode) {
            if (!state.type) fields.push("매물종류");
            if (!state.address) fields.push("소재지");
            if (!state.trade_types || state.trade_types.length === 0) fields.push("거래종류");
            if (!state.trade_price && !state.trade_deposit && (!state.trade_rent || !state.trade_rent_deposit)) fields.push("거래금액");
            if (!state.admin_cost && !state.admin_cost_self) fields.push("관리비");
            if (!state.structure_room || !state.structure_bathroom || !state.structure_living_room) fields.push("구조");
            if (state.phones.length === 0) fields.push("연락처");
            if (!state.images || state.images.length === 0) fields.push("매물 사진");
            return fields;
        }

        if (!state.type) fields.push("매물종류");
        if (!state.estate_use) fields.push("용도");
        if (!state.address) fields.push("소재지");
        if (!state.manager) fields.push("관리처");
        if (state.phones.length === 0) fields.push("연락처");
        if (!state.trade_types || state.trade_types.length === 0) fields.push("거래종류");
        if (!state.trade_price && !state.trade_deposit && (!state.trade_rent || !state.trade_rent_deposit)) fields.push("거래금액");
        if (!state.admin_cost && !state.admin_cost_self) fields.push("관리비");
        if (!state.enter_date && !state.enter_is_discuss && !state.enter_is_hasi && !state.enter_is_now) fields.push("입주예정일");
        if (!state.area_reference) fields.push("참고면적");
        if (!state.floor_applicable || !state.floor_top) fields.push("층");
        if (!state.pet_allowed) fields.push("반려동물");
        if (!state.structure_room || !state.structure_bathroom || !state.structure_living_room) fields.push("구조");
        if (!state.parking_available) fields.push("주차가능여부");
        if (state.parking_method.length === 0) fields.push("주차방식");
        if (!state.other_information) fields.push("특이사항(외부노출)");
        if (!state.house_options) fields.push("옵션");
        if (!state.images || state.images.length === 0) fields.push("매물 사진");
        if (!state.evaluation || !state.evaluation_star) fields.push("평가");

        return fields;
    };


    // ✅ 버튼 클릭 시 실행되는 함수
    const handleSubmitWithValidation = async (temp: boolean) => {
        // const fields = validateFields(); // TODO: 필수 입력 항목 검증 기능 구현 시 사용

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

                        {/* 관리비 */}
                        <AdminCostSection
                            propertytype={property.property?.property_type}
                            adminCost={state.admin_cost}
                            onAdminCostChange={(value) => setField("admin_cost", value)}
                            adminCostVAT={state.admin_cost_vat}
                            onAdminCostVATToggle={(value) => setField("admin_cost_vat", value)}
                            adminCostSelf={state.admin_cost_self}
                            onAdminCostSelfToggle={(value) => setField("admin_cost_self", value)}
                            adminCostInclude={state.admin_cost_includes}
                            onAdminCostIncludeToggle={(value) =>
                                toggleSelection(value, state.admin_cost_includes, (newArray) =>
                                    setField("admin_cost_includes", newArray)
                                )
                            }
                            adminCostMemo={state.admin_cost_memo}
                            onAdminCostMemoChange={(value) => setField("admin_cost_memo", value)}
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

                        {/* 구조 */}
                        <StructureSection
                            propertytype={property.property?.property_type}
                            structure_room={state.structure_room}
                            onStructureRoomChange={(value) => setField("structure_room", value)}
                            structure_bathroom={state.structure_bathroom}
                            onStructureBathRoomChange={(value) => setField("structure_bathroom", value)}
                            structure_living_room={state.structure_living_room}
                            onStructureLivingRoomChange={(value) => setField("structure_living_room", value)}
                            structure_living_room_memo={state.structure_living_room_memo}
                            onStructureLivingRoomMemoChange={(value) => setField("structure_living_room_memo", value)}
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

                        {/* 단지명 */}
                        <ComplexSection
                            propertytype={property.property?.property_type}
                            complex_name={state.complex_name}
                            onComplexNameChange={(value) => setField("complex_name", value)}
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

                        {/* 관리비 */}
                        <AdminCostSection
                            propertytype={property.property?.property_type}
                            adminCost={state.admin_cost}
                            onAdminCostChange={(value) => setField("admin_cost", value)}
                            adminCostVAT={state.admin_cost_vat}
                            onAdminCostVATToggle={(value) => setField("admin_cost_vat", value)}
                            adminCostSelf={state.admin_cost_self}
                            onAdminCostSelfToggle={(value) => setField("admin_cost_self", value)}
                            adminCostInclude={state.admin_cost_includes}
                            onAdminCostIncludeToggle={(value) =>
                                toggleSelection(value, state.admin_cost_includes, (newArray) =>
                                    setField("admin_cost_includes", newArray)
                                )
                            }
                            adminCostMemo={state.admin_cost_memo}
                            onAdminCostMemoChange={(value) => setField("admin_cost_memo", value)}
                        />

                        {/* 기보증금 */}
                        <AlreadyDepositSection
                            propertytype={property.property?.property_type}
                            alreadyTenant={state.already_tenant}
                            onAlreadyTenantChange={(value) => setField("already_tenant", value)}
                            alreadyTenantMemo={state.already_tenant_memo}
                            onAlreadyTenantMemoChange={(value) => setField("already_tenant_memo", value)}
                            alreadyEndDate={state.already_end_date}
                            onAlreadyEndDateChange={(value) => setField("already_end_date", value)}
                            alreadyRenewRequest={state.already_renew_request}
                            onAlreadyRenewRequestChange={(value) => setField("already_renew_request", value)}
                            alreadyRenewRequestMemo={state.already_renew_request_memo}
                            onAlreadyRenewRequestMemoChange={(value) => setField("already_renew_request_memo", value)}
                            alreadyDeposit={state.already_deposit}
                            onAlreadyDepositChange={(value) => setField("already_deposit", value)}
                            alreadyRent={state.already_rent}
                            onAlreadyRentChange={(value) => setField("already_rent", value)}
                            alreadyAdminCost={state.already_admin_cost}
                            onAlreadyAdminCostChange={(value) => setField("already_admin_cost", value)}
                            alreadyPremium={state.already_premium}
                            onAlreadyPremiumChange={(value) => setField("already_premium", value)}
                            alreadyPremiumMemo={state.already_premium_memo}
                            onAlreadyPremiumMemoChange={(value) => setField("already_premium_memo", value)}
                            alreadyJobType={state.already_jobtype}
                            onAlreadyJobType={(value) => setField("already_jobtype", value)}
                            alreadyJobWant={state.already_jobwant}
                            onAlreadyJobWant={(value) => setField("already_jobwant", value)}
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

                        {/* 층 */}
                        <FloorSection
                            propertytype={property.property?.property_type}
                            floor_applicable={state.floor_applicable}
                            onFloorApplicableChange={(value) => setField("floor_applicable", value)}
                            floor_top={state.floor_top}
                            onFloorTopChange={(value) => setField("floor_top", value)}
                            floor_underground={state.floor_underground}
                            onFloorUndergroundChange={(value) => setField("floor_underground", value)}
                            floor_semibasement={state.floor_semibasement}
                            onFloorSemibasementChange={(value) => setField("floor_semibasement", value)}
                            floor_rooftop={state.floor_rooftop}
                            onFloorRooftopChange={(value) => setField("floor_rooftop", value)}
                        />

                        {/* 방향 */}
                        <DirectionSection
                            propertytype={property.property?.property_type}
                            direction_standard={state.direction_standard}
                            onDirectionStandardSelect={(value) => setField("direction_standard", value)}
                            direction_side={state.direction_side}
                            onDirectionSideSelect={(value) => setField("direction_side", value)}
                        />

                        {/* 건축일자 */}
                        <ConstructionSection
                            propertytype={property.property?.property_type}
                            construction_standard={state.construction_standard}
                            onConstructionStandardChange={(value) => setField("construction_standard", value)}
                            construction_date={state.construction_date}
                            onConstructionDateChange={(value) => setField("construction_date", value)}
                        />

                        {/* 반려동물 */}
                        <PetSection
                            pet_allowed={state.pet_allowed}
                            onPetAllowedChange={(value) => setField("pet_allowed", value)}
                            pet_condition={state.pet_condition}
                            onPetConditionCHange={(value) => setField("pet_condition", value)}
                        />

                        {/* 구조 */}
                        <StructureSection
                            propertytype={property.property?.property_type}
                            structure_room={state.structure_room}
                            onStructureRoomChange={(value) => setField("structure_room", value)}
                            structure_bathroom={state.structure_bathroom}
                            onStructureBathRoomChange={(value) => setField("structure_bathroom", value)}
                            structure_living_room={state.structure_living_room}
                            onStructureLivingRoomChange={(value) => setField("structure_living_room", value)}
                            structure_living_room_memo={state.structure_living_room_memo}
                            onStructureLivingRoomMemoChange={(value) => setField("structure_living_room_memo", value)}
                        />

                        {/* 총 주차 */}
                        <ParkingSection
                            propertytype={property.property?.property_type}
                            parking_total={state.parking_total}
                            onParkingTotalChange={(value) => setField("parking_total", value)}
                            parking_method={state.parking_method}
                            onParkingMethodChange={(value) =>
                                toggleSelection(value, state.parking_method, (newArray) =>
                                    setField("parking_method", newArray)
                                )
                            }
                            parking_method_memo={state.parking_method_memo}
                            onParkingMethodMemoChange={(value) => setField("parking_method_memo", value)}
                            parking_available={state.parking_available}
                            onParkingAvailableChange={(value) => setField("parking_available", value)}
                            parking_number={state.parking_number}
                            onParkingNumberChange={(value) => setField("parking_number", value)}
                            parking_cost={state.parking_cost}
                            onParkingCostChange={(value) => setField("parking_cost", value)}
                            parking_memo={state.parking_memo}
                            onParkingMemoChange={(value) => setField("parking_memo", value)}
                        />

                        {/* 위반사항 */}
                        <ViolationSection
                            propertytype={property.property?.property_type}
                            violation={state.violation}
                            onViolationChange={(value) => setField("violation", value)}
                            violation_memo={state.violation_memo}
                            onViolationMemoChange={(value) => setField("violation_memo", value)}
                        />


                        {/* 융자 */}
                        <LoanSection
                            loan_held={state.loan_held}
                            onLoanHeldChange={(value) => setField("loan_held", value)}
                            loan_availability={state.loan_availability}
                            onLoanAvailabilityChange={(value) => setField("loan_availability", value)}
                        />


                        <Label className="flex w-full text-3xl font-bold p-3 pt-10">※ 시설정보</Label>
                        <Separator className="w-full m-2"></Separator>

                        {/* 매물정보 기타사항 */}
                        <OtherSection
                            propertytype={property.property?.property_type}
                            other_information={state.other_information}
                            onOtherInformationChange={(value) => setField("other_information", value)}
                        />


                        {/* 난방 */}
                        <HeatingSection
                            heating_method={state.heating_method}
                            onHeatingMethodChange={(value) => setField("heating_method", value)}
                            heating_fuel={state.heating_fuel}
                            onHeatingFuelChange={(value) => setField("heating_fuel", value)}
                        />

                        {/* 옵션 */}
                        <HouseSection
                            house_aircon={state.house_aircon}
                            onHouseAirconChange={(value) =>
                                toggleSelection(value, state.house_aircon, (newArray) =>
                                    setField("house_aircon", newArray)
                                )
                            }

                            // 옵션 정보
                            house_options={state.house_options}
                            onHouseOptionsChange={(value) =>
                                toggleSelection(value, state.house_options, (newArray) =>
                                    setField("house_options", newArray)
                                )
                            }
                            house_options_memo={state.house_options_memo}
                            onHouseOptionsMemoChange={(value) => setField("house_options_memo", value)}

                            house_security={state.house_security}
                            onHouseSecurityChange={(value) =>
                                toggleSelection(value, state.house_security, (newArray) =>
                                    setField("house_security", newArray)
                                )
                            }
                            house_security_memo={state.house_security_memo}
                            onHouseSecurityMemoChange={(value) => setField("house_security_memo", value)}

                            house_other={state.house_other}
                            onHouseOtherChange={(value) =>
                                toggleSelection(value, state.house_other, (newArray) =>
                                    setField("house_other", newArray)
                                )
                            }
                            house_other_memo={state.house_other_memo}
                            onHouseOtherMemoChange={(value) => setField("house_other_memo", value)}
                        />

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
