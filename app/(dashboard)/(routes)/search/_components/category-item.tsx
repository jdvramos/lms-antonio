"use client";

import qs from "query-string";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { IconType } from "react-icons";

interface CategoryItemProps {
    label: string;
    value?: string;
    icon?: IconType;
}

export const CategoryItem = ({
    label,
    value,
    icon: Icon,
}: CategoryItemProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    /*
		The categoryId will be pushed in the url params once the onClick
		in one of the categories below was executed. If the user visits
		the /search with categoryId (/search?categoryId=) the value will
		be read and stored in the currentCategoryId variable. The currentCategoryId
		and the value which stores the id of the category will determine if
		the category item is currently selected
	*/
    const currentCategoryId = searchParams.get("categoryId");

    /*
		We will have a search component and in there we will also push a new
		url with params of title whenever the user searches the input in the
        search-input.tsx. The title is the value inputted by the user in the 
		search bar and we want that value to be preserved in the urt as title
        param
	*/
    const currentTitle = searchParams.get("title");

    const isSelected = currentCategoryId === value;

    /*
		This will have a toggle effect, if the category is already selected (the
		isSelected is true) we will remove the value of categoryId in the params
	*/
    const onClick = () => {
        const url = qs.stringifyUrl(
            {
                url: pathname,
                query: {
                    title: currentTitle,
                    categoryId: isSelected ? null : value,
                },
            },
            { skipNull: true, skipEmptyString: true }
        );

        router.push(url);
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-sky-700 transition",
                isSelected && "border-sky-700 bg-sky-200/20 text-sky-800"
            )}
            type="button"
        >
            {Icon && <Icon size={20} />}
            <div className="truncate">{label}</div>
        </button>
    );
};
