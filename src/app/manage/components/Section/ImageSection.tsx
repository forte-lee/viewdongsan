"use client";

import React, { useRef } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button, Label } from "@/components/ui";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { IoClose } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface ImageSectionProps {
    images: ImageListType;
    onImagesChange: (imageList: ImageListType) => void;
}

function ImageSection({ images, onImagesChange }: ImageSectionProps) {
    const maxNumber = 20;
    // const [isFlatLayout, setIsFlatLayout] = useState(false); // TODO: 드래그 중 한 줄 레이아웃 여부
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const amount = container.clientWidth - 100; // 한 화면 거의 가득 이동
        container.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    const handleDragStart = () => {
        // 어떤 이미지든 드래그가 시작되면 한 줄로 나열
        // setIsFlatLayout(true); // TODO: 드래그 중 한 줄 레이아웃 기능 구현 시 사용
    };

    const handleDragEnd = (result: DropResult) => {
        // 드랍이 끝나면 다시 grid 레이아웃으로 복귀
        // setIsFlatLayout(false); // TODO: 드래그 중 한 줄 레이아웃 기능 구현 시 사용
        const { source, destination } = result;
        if (!destination || source.index === destination.index) return;

        const reorderedImages = Array.from(images);
        const [removed] = reorderedImages.splice(source.index, 1);
        reorderedImages.splice(destination.index, 0, removed);

        // ✅ 변경된 순서를 상위로 전달 (상태 갱신)
        onImagesChange(reorderedImages);
    };

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">매물사진
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>

            <ImageUploading
                multiple
                value={images}
                onChange={onImagesChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageRemove,
                    isDragging,
                    dragProps,
                }) => (
                    <>
                        {/* 드래그 앤 드롭 영역 */}
                        <div
                            className={`flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer ${isDragging ? "bg-gray-100" : "hover:bg-gray-50"
                                }`}
                            style={{ borderColor: isDragging ? "#000" : "#ddd" }}
                            onClick={onImageUpload}
                            {...dragProps}
                        >
                            <p>이미지를 여기에 드래그하거나 클릭하여 업로드하세요.</p>
                        </div>

                        {/* 이미지 미리보기 */}
                        {imageList.length > 0 && (
                            <div className="mt-4">
                                <Label className="text-lg font-bold">이미지 미리보기 및 정렬</Label>

                                {/* 가로 1줄 캐러셀 + 좌우 화살표 + 드래그 시 한 줄 플랫 레이아웃 */}
                                <div className="relative mt-4">
                                    {/* 왼쪽 화살표 아이콘 버튼 (이미지 위에 겹쳐 보이도록 배치) */}
                                    <button
                                        type="button"
                                        onClick={() => handleScroll("left")}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                    </button>

                                    {/* 오른쪽 화살표 아이콘 버튼 */}
                                    <button
                                        type="button"
                                        onClick={() => handleScroll("right")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-700" />
                                    </button>

                                    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="image-list" direction="horizontal">
                                            {(provided) => (
                                                <div
                                                    ref={(el) => {
                                                        provided.innerRef(el);
                                                        scrollContainerRef.current = el;
                                                    }}
                                                    {...provided.droppableProps}
                                                    className="flex flex-nowrap gap-1 overflow-x-auto pb-2"
                                                >
                                                    {imageList.map((image, index) => (
                                                        <Draggable
                                                            key={`draggable-${index}`}
                                                            draggableId={`draggable-${index}`}
                                                            index={index}
                                                        >
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="relative flex flex-col items-center bg-gray-100 border border-gray-300 rounded-md p-1 flex-shrink-0"
                                                                >
                                                                    <img
                                                                        src={image.data_url}
                                                                        alt={`uploaded-preview-${index}`}
                                                                        className="w-24 h-24 object-cover rounded-md"
                                                                    />
                                                                    <div className="absolute top-0 right-0 flex gap-1 p-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="bg-opacity-20 bg-white text-red-600 p-1 rounded"
                                                                            onClick={() => onImageRemove(index)}
                                                                        >
                                                                            <IoClose className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </ImageUploading>
        </div>
    );
}


export { ImageSection };