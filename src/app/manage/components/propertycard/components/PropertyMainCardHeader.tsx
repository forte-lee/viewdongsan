import { Label } from "@/components/ui";

interface PropertyMainCardHeaderProps {
    propertyId: number;
}

function PropertyMainCardHeader({ propertyId }: PropertyMainCardHeaderProps) {
    return (
        <div className="flex flex-col w-full justify-center items-center">
            <Label className="flex text-xs text-gray-600">{propertyId}</Label>
        </div>
    );
}

export { PropertyMainCardHeader };

















