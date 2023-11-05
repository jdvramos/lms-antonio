"use client";

import { useEffect, useState } from "react";

import qs from "query-string";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Search } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";

export const SearchInput = () => {
    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentCategoryId = searchParams.get("categoryId");

    const currentTitle = searchParams.get("title");

    useEffect(() => {
        const url = qs.stringifyUrl(
            {
                url: pathname,
                query: {
                    categoryId: currentCategoryId,
                    title: debouncedValue,
                },
            },
            { skipEmptyString: true, skipNull: true }
        );

        router.push(url);
    }, [debouncedValue, currentCategoryId, router, pathname]);

    /*
		MY OWN IMPLEMENTATION: The title in params doesn't get read when 
		we changed categories or when we reload the page
	*/
    useEffect(() => {
        if (currentTitle) {
            setValue(currentTitle);
        }
    }, [currentTitle]);

    return (
        <div className="relative">
            <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
            <Input
                onChange={(e) => setValue(e.target.value)}
                value={value}
                className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
                placeholder="Search for a course"
            />
        </div>
    );
};
