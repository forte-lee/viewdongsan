"use client";

import { useState, useEffect } from "react";
import { Label, Button } from "@/components/ui";
import { Combobox } from "@/components/ui";
import { hangjungdong } from "@/utils/hangjungdong";

interface Props {
    selectedAddresses: string[];
    onChange: (locations: string[]) => void;
}

function PropertyAddressFilter({ selectedAddresses, onChange }: Props) {
    const [sigugunSelected, setSigugunSelected] = useState<string | null>(null);
    const [dongList, setDongList] = useState<string[]>([]);
    const [dongSelected, setDongSelected] = useState<string[]>([]);
    // const [keyword, setKeyword] = useState<string>(""); // TODO: 키워드 검색 기능 구현 시 사용

    const sigugunList = hangjungdong.sigugun.map((s) => {
        const sidoName = hangjungdong.sido.find((sd) => sd.sido === s.sido)?.codeNm || "";
        return `${sidoName} ${s.codeNm}`;
    });

    const handleSigugunSelect = (selectedValue: string) => {
        setSigugunSelected(selectedValue);
        setDongSelected([]);

        const selectedSido = selectedValue.split(" ")[0];
        const selectedSigugun = selectedValue.split(" ")[1];

        const matchedSigugun = hangjungdong.sigugun.find(
            (s) => s.codeNm === selectedSigugun && hangjungdong.sido.find((sd) => sd.sido === s.sido)?.codeNm === selectedSido
        );

        if (matchedSigugun) {
            const filteredDongList = hangjungdong.dong
                .filter((d) => d.sido === matchedSigugun.sido && d.sigugun === matchedSigugun.sigugun)
                .map((d) => d.codeNm);
            setDongList(filteredDongList);
            
            // 이전에 선택된 동들을 제거하고 시군구만 추가
            const otherAddresses = selectedAddresses.filter((addr) => {
                const addrParts = addr.split(" ");
                const sigugunParts = selectedValue.split(" ");
                // 다른 시군구의 주소는 유지
                if (addrParts.length >= 2 && sigugunParts.length >= 2) {
                    return !(addrParts[0] === sigugunParts[0] && addrParts[1] === sigugunParts[1]);
                }
                return true;
            });
            
            // 시군구만 선택된 경우 시군구만 addressList에 추가
            // 동이 선택되지 않았으면 시군구만 추가
            if (!selectedAddresses.some(addr => addr.startsWith(`${selectedValue} `) && addr.split(" ").length >= 3)) {
                onChange([...otherAddresses, selectedValue]);
            }
        } else {
            setDongList([]);
        }
    };

    const handleDongSelect = (selectedValue: string) => {
        if (!selectedValue || !sigugunSelected) return;

        // 시군구만 선택된 항목 제거 (동을 선택하면 시군구만 선택은 무효화)
        const addressesWithoutSigugunOnly = selectedAddresses.filter((addr) => addr !== sigugunSelected);

        if (selectedValue === "전체선택") {
            if (dongSelected.length === dongList.length) {
                setDongSelected([]);
                onChange(addressesWithoutSigugunOnly.filter((loc) => !loc.startsWith(`${sigugunSelected} `)));
            } else {
                const allDongs = dongList.map((dong) => `${sigugunSelected} ${dong}`);
                setDongSelected([...dongList]);
                onChange([...addressesWithoutSigugunOnly, ...allDongs.filter((dong) => !addressesWithoutSigugunOnly.includes(dong))]);
            }
            return;
        }

        const [selectedSido, selectedSigugun] = sigugunSelected.split(" ");
        const newLocation = `${selectedSido} ${selectedSigugun} ${selectedValue}`;

        let newLocations;
        if (addressesWithoutSigugunOnly.includes(newLocation)) {
            newLocations = addressesWithoutSigugunOnly.filter((item) => item !== newLocation);
            setDongSelected((prev) => prev.filter((item) => item !== selectedValue));
        } else {
            newLocations = [...addressesWithoutSigugunOnly, newLocation];
            setDongSelected((prev) => [...prev, selectedValue]);
        }
        onChange(newLocations);
    };

    useEffect(() => {
        if (!sigugunSelected) return;
        
        // 선택된 주소 중 현재 시군구에 해당하는 것들 찾기
        const addressesInSigugun = selectedAddresses.filter((location) => {
            const locationParts = location.split(" ");
            const sigugunParts = sigugunSelected.split(" ");
            // 시군구만 있는 경우 (예: "서울특별시 송파구")
            if (locationParts.length === 2 && sigugunParts.length === 2) {
                return location === sigugunSelected;
            }
            // 시군구 + 동이 있는 경우
            return location.startsWith(`${sigugunSelected} `);
        });
        
        // 시군구만 선택된 경우 (동이 없는 경우)
        const isSigugunOnly = addressesInSigugun.some(addr => addr.split(" ").length === 2);
        if (isSigugunOnly) {
            // 시군구만 선택된 경우는 동 선택 상태를 유지하지 않음
            return;
        }
        
        // 동이 선택된 경우
        const updatedDongSelected = addressesInSigugun
            .filter((location) => location.split(" ").length >= 3)
            .map((location) => location.split(" ")[2]);
        setDongSelected(updatedDongSelected);
    }, [selectedAddresses, sigugunSelected]);

    const isAllDongSelected = dongSelected.length === dongList.length;

    // const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value;
    //     setKeyword(value);
    //     onKeywordChange?.(value);
    // }; // TODO: 키워드 검색 기능 구현 시 사용

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">지역</Label>

            {selectedAddresses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {[...new Set(selectedAddresses.map(loc => loc.split(" ").slice(0, 2).join(" ")))].map((sigugunItem) => {
                        const selectedInGroup = selectedAddresses.filter((loc) => {
                            // 시군구만 선택된 경우
                            if (loc === sigugunItem) return true;
                            // 시군구 + 동이 선택된 경우
                            return loc.startsWith(`${sigugunItem} `);
                        });
                        const [sido, sigugun] = sigugunItem.split(" ");

                        // 시군구만 선택된 경우 확인
                        const isSigugunOnly = selectedInGroup.some(loc => loc === sigugunItem);
                        
                        if (isSigugunOnly) {
                            return (
                                <Button
                                    key={`${sigugunItem}-시군구만`}
                                    variant="outline"
                                    className="text-xs border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                    onClick={() => onChange(selectedAddresses.filter((loc) => {
                                        // 시군구만 선택된 경우와 해당 시군구의 모든 동 제거
                                        if (loc === sigugunItem) return false;
                                        return !loc.startsWith(`${sigugunItem} `);
                                    }))}
                                >
                                    {sigugun} 전체 ✕
                                </Button>
                            );
                        }

                        const matched = hangjungdong.sigugun.find(
                            (s) => s.codeNm === sigugun && hangjungdong.sido.find((sd) => sd.sido === s.sido)?.codeNm === sido
                        );

                        const totalDongsInGroup = hangjungdong.dong
                            .filter((d) => d.sido === matched?.sido && d.sigugun === matched?.sigugun)
                            .map((d) => `${sido} ${sigugun} ${d.codeNm}`);

                        const isAllSelected = selectedInGroup.length === totalDongsInGroup.length;

                        if (isAllSelected) {
                            return (
                                <Button
                                    key={`${sigugunItem}-전체`}
                                    variant="outline"
                                    className="text-xs border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                    onClick={() => onChange(selectedAddresses.filter((loc) => !loc.startsWith(`${sigugunItem} `) && loc !== sigugunItem))}
                                >
                                    {sigugun} 전체 ✕
                                </Button>
                            );
                        } else {
                            return selectedInGroup
                                .filter(item => item !== sigugunItem) // 시군구만 선택된 경우 제외
                                .map((item) => {
                                const [, sigugun, dong] = item.split(" ");
                                return (
                                    <Button
                                        key={item}
                                        variant="outline"
                                        className="text-xs border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                        onClick={() => onChange(selectedAddresses.filter((i) => i !== item))}
                                    >
                                        {sigugun} {dong} ✕
                                    </Button>
                                );
                            });
                        }
                    })}
                </div>
            )}

            <div className="flex flex-row w-full gap-2">
                <div className="flex w-[300px]">
                    <Combobox
                        options={sigugunList}
                        selected={sigugunSelected ? [sigugunSelected] : []}
                        onSelect={handleSigugunSelect}
                        placeholder="시/군/구 선택"
                    />
                </div>

                {sigugunSelected && (
                    <div className="flex w-[300px]">
                        <Combobox
                            options={["전체선택", ...dongList]}
                            selected={isAllDongSelected ? ["전체선택"] : dongSelected}
                            onSelect={handleDongSelect}
                            placeholder="읍/면/동 선택"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export { PropertyAddressFilter };
