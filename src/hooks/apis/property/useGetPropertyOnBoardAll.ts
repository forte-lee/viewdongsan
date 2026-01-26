"use client";

import { propertysAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { Property } from "@/types";

function useGetPropertyOnBoardAll() {
    const [propertys] = useAtom(propertysAtom); // ✅ 전체 매물 목록 가져오기

    // ✅ propertysAtom에서 on_board_state가 true인 데이터만 필터링
    const filteredPropertys = useMemo(
        () => propertys.filter((property) => property.on_board_state?.on_board_state === true),
        [propertys]
    );

    return { propertys: filteredPropertys };
}

export { useGetPropertyOnBoardAll };
