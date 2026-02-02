import { Button, Input, Label } from "@/components/ui";
import MapContainer from "@/components/kakaomap/MapContainer";

interface AddressSectionProps {
    propertytype: string | undefined;
    address: string;              // 지번 주소
    address_roadname: string;     // 도로명 주소 (추가)
    address_dong: string;
    address_ho: string;
    addressDetail: string;
    latitude: string;
    longitude: string;

    onAddressChange: (address: string) => void;                   // 지번 주소 변경
    onAddressRoadChange: (address_roadname: string) => void;      // 도로명 주소 변경 (추가)
    onAddressDongChange: (address_dong: string) => void;
    onAddressHoChange: (address_ho: string) => void;
    onAddressDetailChange: (addressDetail: string) => void;
    onLatChange: (latitude: string) => void;
    onLngChange: (longitude: string) => void;
}

declare global {
    interface Window {
        daum: {
            Postcode: new (options: {
                oncomplete: (data: {
                    jibunAddress?: string;
                    roadAddress?: string;
                    address?: string;
                }) => void;
            }) => {
                open: () => void;
            };
        };
    }
}

function AddressSection({
    propertytype,
    address,
    address_roadname,
    address_dong,
    address_ho,
    addressDetail,
    latitude,
    longitude,
    onAddressChange,
    onAddressRoadChange,
    onAddressDongChange,
    onAddressHoChange,
    onAddressDetailChange,
    onLatChange,
    onLngChange,
}: AddressSectionProps) {

    // ✅ 주소 검색 함수
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data: { jibunAddress?: string; roadAddress?: string; address?: string }) {
                const jibun = data.jibunAddress || "";
                const road = data.roadAddress || data.address || "";

                // ✅ 지번 주소 저장
                onAddressChange(jibun);

                // ✅ 도로명 주소도 추가 저장
                onAddressRoadChange(road);

                // 지오코딩은 도로명이 있으면 도로명으로, 없으면 지번으로
                const fullAddress = road || jibun;
                if (!window.kakao?.maps?.services?.Geocoder) {
                    console.error("❌ 카카오맵 Geocoder를 사용할 수 없습니다.");
                    return;
                }
                const geocoder = new window.kakao.maps.services.Geocoder() as {
                    addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void;
                };

                geocoder.addressSearch(fullAddress, (result: Array<{ x: string; y: string }>, status: string) => {
                    if (status === window.kakao.maps.services?.Status?.OK) {
                        const lat = String(parseFloat(result[0].y));
                        const lng = String(parseFloat(result[0].x));

                        onLatChange(lat);
                        onLngChange(lng);
                    } else {
                        console.warn("❌ 지오코딩 실패:", status, fullAddress);
                    }
                });
            },
        }).open();
    };

    const isBuilding = ["건물", "토지"].includes(propertytype || "");

    const detailPlaceholder = (() => {
        switch (propertytype) {
            case "아파트":
            case "오피스텔":
            case "공동주택(아파트 외)":
            case "단독주택(임대)":
                return "상세주소를 입력하세요";
            case "상업/업무/공업용":
                return "일부, 일부 502호 또는 203, 204호를 포함";
            case "건물":
                return "건물전체, 전체, 1동전체 등";
            case "토지":
                return "일부, 또는 900-28, 29번지 포함";
            default:
                return "상세주소를 입력하세요";
        }
    })();

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">
                    소재지
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>

            {/* 주소 입력 */}
            <div className="flex w-full max-w-2xl items-center space-x-2 p-1">
                <Input
                    className="flex w-5/6"
                    type="text"
                    placeholder="주소검색을 눌러주세요."
                    value={address}
                    onClick={handleAddressSearch}
                    readOnly
                />
                <Button className="flex w-1/6 text-sm" type="button" onClick={handleAddressSearch}>주소검색</Button>
            </div>

            {/* 도로명 주소 표시 (읽기 전용) */}
            {address_roadname && (
                <div className="flex w-full max-w-2xl items-center space-x-2 p-1">
                    <Input
                        className="flex w-5/6 bg-gray-100"
                        type="text"
                        value={address_roadname}
                        readOnly
                    />
                    <Label className="flex w-1/6 text-sm text-gray-600 justify-center"></Label>
                </div>
            )}

            {/* 동/호 입력 (건물/토지는 제외) */}
            {!isBuilding && (
                <div className="flex w-1/2 items-center space-x-2 p-1">
                    <Input
                        className="flex w-1/4"
                        type="text"
                        placeholder="101"
                        value={address_dong}
                        onChange={(e) => onAddressDongChange(e.target.value)}
                    />
                    <Label className="flex w-1/6">동</Label>
                    <Input
                        className="flex w-1/4"
                        type="text"
                        placeholder="101"
                        value={address_ho}
                        onChange={(e) => onAddressHoChange(e.target.value)}
                    />
                    <Label className="flex w-1/6">호</Label>
                </div>
            )}

            {/* 상세주소 */}
            <div className="flex w-1/2 items-center space-x-2 p-1">
                <Input
                    type="text"
                    placeholder={detailPlaceholder}
                    value={addressDetail}
                    onChange={(e) => onAddressDetailChange(e.target.value)}
                />
            </div>

            {/* 지도 */}
            <div>
                <MapContainer
                    latitude={Number(latitude)}
                    longitude={Number(longitude)}
                    disableInteraction
                />
            </div>
        </div>
    );
}

export { AddressSection };
