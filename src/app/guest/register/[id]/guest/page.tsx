"use client"

import { GuestInfoSection, GuestMemoSection, GuestPhoneSection } from '@/app/guest/components';
import { GuestRegisterBody } from '@/app/guest/components/Register/GuestRegisterBody';
import { GuestRegisterHeader } from '@/app/guest/components/Register/GuestRegisterHeader';
import { useRegisterGuest } from '@/hooks/apis';
import { useParams } from 'next/navigation';
import React from 'react'

function GuestRegister() {
    const { id } = useParams();
        
    const {
        state, // 전체 상태
        setField, // 개별 상태 설정
        handleSubmit // 등록 버튼 핸들러
    } = useRegisterGuest();    
    
    return (
        <div className="w-full max-w-[800px] min-w-[800px] h-full justify-start items-start">
            {/* 헤더부분 */}
            <GuestRegisterHeader
                handleSubmit={handleSubmit} // handleSubmit 전달
                guestId={Number(id)} // 매물 ID 전달
            />

            {/* 바디 부분 */}
            <GuestRegisterBody>
                <GuestInfoSection
                    name={state.name}
                    sex={state.sex}
                    onNameChange={(value) => setField("name", value)}                    
                    onSexChange={(value) => setField("sex", value)}
                />

                <GuestPhoneSection
                    phones={state.phone}
                    onPhoneChange={(value) => setField("phone", value)}
                />

                <GuestMemoSection
                    extraMemo={state.memo}
                    onExtraMemoChange={(value) => setField("memo", value)}
                />

            </GuestRegisterBody>
        </div>
    )
}

export default GuestRegister