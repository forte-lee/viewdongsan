import { Input, Label } from '@/components/ui'

interface Props {
    person: string;
    onPersonChange: (person: string) => void;
}

function GuestPersonSection({ person, onPersonChange }: Props) {

    return (        
        <div className="flex flex-row p-1 items-center">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">사용인원</Label>
            </div>
            <div className="flex w-[110px] gap-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="-"
                    value={person}
                    onChange={(e) => onPersonChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export { GuestPersonSection }