import { Property, Guest, GuestProperty, Employee } from "@/types";
import { atom } from "jotai";

// 로그인 이메일 조회
export const userEmailAtom = atom<string | null>(null);

// 전체 매물 목록 조회
export const propertysAtom = atom<Property[]>([]);

// 회사 직원 이메일 리스트
export const employeesAtom = atom<Employee[]>([]);

// 회사 ID 조회
export const companyAtom = atom<number | null>(null);

// 전체 손님 목록 조회
export const guestsAtom = atom<Guest[]>([]);

// 전체 손님 매물 목록 조회
export const guestPropertysAtom = atom<GuestProperty[]>([]);

// 손님 매물 조회
export const guestNewPropertiesAtom = atom<Record<number, number[]>>({});

// 관리자 여부
export const isManagerAtom = atom<boolean>(false);

// 손님 매물 조회
// export const guestPropertyAtom = atom<GuestProperty | null>(null);

// ✅ 전역 이미지 업로드 작업 카운트 (0보다 크면 업로드 작업 진행 중)
export const uploadInProgressCountAtom = atom<number>(0);

// ✅ 전역 이미지 업로드 중인 매물 번호 목록
export const uploadInProgressPropertyIdsAtom = atom<number[]>([]);