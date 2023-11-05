import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { SearchInput } from "@/components/search-input";
import { Categories } from "./_components/categories";
import { CoursesList } from "@/components/courses-list";

import { getCourses } from "@/actions/get-courses";

interface SearchPageProps {
    searchParams: {
        title: string;
        categoryId: string;
    };
}
/*
    Everything in the url including the params can be access as props in 
    a server component. Here, we are getting the searchParams
*/
const SearchPage = async ({ searchParams }: SearchPageProps) => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc",
        },
    });

    /*
        The search params contains the title and the categoryId, whenever either of 
        these two were changed (either by changing the category or typing into 
        the input) the getCourses function will run again to fetch the courses that
        matches the filters
    */
    const courses = await getCourses({
        userId,
        ...searchParams,
    });

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <Categories items={categories} />
                <CoursesList items={courses} />
            </div>
        </>
    );
};

export default SearchPage;
