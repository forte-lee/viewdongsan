import { useState, useEffect } from "react";
import { Button, Checkbox, Label } from "@/components/ui";
import { Combobox } from "@/components/ui/";
import { hangjungdong } from "@/utils/hangjungdong";

interface Props {
    locationsCheck: boolean;
    locations: string[];
    onLocationsCheckChange: (locationsCheck: boolean) => void;
    onLocationsToggle: (locations: string[]) => void;
}

function GuestLocationSection({ locationsCheck, locations, onLocationsCheckChange, onLocationsToggle }: Props) {
    const [sigugunSelected, setSigugunSelected] = useState<string | null>(null);
    const [dongList, setDongList] = useState<string[]>([]);
    const [dongSelected, setDongSelected] = useState<string[]>([]);

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
        } else {
            setDongList([]);
        }
    };

    const handleDongSelect = (selectedValue: string) => {
        if (!selectedValue || !sigugunSelected) return;

        if (selectedValue === "전체선택") {
            if (dongSelected.length === dongList.length) {
                setDongSelected([]);
                onLocationsToggle(locations.filter((loc) => !loc.startsWith(`${sigugunSelected} `)));
            } else {
                const allDongs = dongList.map((dong) => `${sigugunSelected} ${dong}`);
                setDongSelected([...dongList]);
                onLocationsToggle([...locations, ...allDongs.filter((dong) => !locations.includes(dong))]);
            }
            return;
        }

        const [selectedSido, selectedSigugun] = sigugunSelected.split(" ");
        const newLocation = `${selectedSido} ${selectedSigugun} ${selectedValue}`;

        let newLocations;
        if (locations.includes(newLocation)) {
            newLocations = locations.filter((item) => item !== newLocation);
            setDongSelected((prev) => prev.filter((item) => item !== selectedValue));
        } else {
            newLocations = [...locations, newLocation];
            setDongSelected((prev) => [...prev, selectedValue]);
        }
        onLocationsToggle(newLocations);
    };

    useEffect(() => {
        const updatedDongSelected = locations
            .filter((location) => location.startsWith(`${sigugunSelected} `))
            .map((location) => location.split(" ")[2]);
        setDongSelected(updatedDongSelected);
    }, [locations, sigugunSelected]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row p-1 items-center pt-3">
                <div className="flex flex-col w-[30px]">
                    <Label htmlFor="location-checkbox" className="text-xs" />
                    <Checkbox
                        id="location-checkbox"
                        checked={locationsCheck}
                        onCheckedChange={() => onLocationsCheckChange(!locationsCheck)}
                    />
                </div>

                <div className="flex flex-col w-[100px]">
                    <Label className="text-base p-1 text-left">위치</Label>
                </div>

                <div className="flex flex-col w-[600px]">
                    {locations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {[...new Set(locations.map(loc => loc.split(" ").slice(0, 2).join(" ")))].map((sigugunItem) => {
                                const selectedInGroup = locations.filter((loc) => loc.startsWith(`${sigugunItem} `));
                                const [sido, sigugun] = sigugunItem.split(" ");

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
                                            onClick={() => onLocationsToggle(locations.filter((loc) => !loc.startsWith(`${sigugunItem} `)))}
                                        >
                                            {sigugun} 전체 ✕
                                        </Button>
                                    );
                                } else {
                                    return selectedInGroup.map((item) => {
                                        const [, sigugun, dong] = item.split(" ");
                                        return (
                                            <Button
                                                key={item}
                                                variant="outline"
                                                className="text-xs border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                                onClick={() => onLocationsToggle(locations.filter((i) => i !== item))}
                                            >
                                                {sigugun} {dong} ✕
                                            </Button>
                                        );
                                    });
                                }
                            })}
                        </div>
                    )}

                    <div className="flex flex-row w-full gap-2 mt-2">
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
                                    selected={dongSelected}
                                    onSelect={handleDongSelect}
                                    placeholder="읍/면/동 선택"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { GuestLocationSection };
