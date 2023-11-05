import { db } from "@/lib/db";
import { Category, Course } from "@prisma/client";

import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = Course & {
    category: Category | null;
    chapters: { id: string }[];
    progress: number | null;
};

type GetCourses = {
    userId: string;
    title?: string;
    categoryId?: string;
};

/*
    The getCourses function will receive the userId, title, and categoryId. The
    getCourses function needs these three to filter the courses to be displayed
    for the user. Only the courses that matches the categoryId and title will be
    displayed while the userId will be used to determined if the user haven't 
    purchased the course and if they already purchased we will show the progress
    instead. The progress will be determined by the function we imported called
    getProgress, the getProgress will need the userId and the course id. The
    getCourses function will return an array of CourseWithProgressWithCategory.
    The CourseWithProgressWithCategory is a type that combines Course type with
    the course's category, chapters (only the ids) and logged-in user progress.

    The getCourses function will be utilized in the /search/page.tsx
*/
export const getCourses = async ({
    userId,
    title,
    categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
    try {
        /*
            Here, we are retrieving only the courses that are published, where
            title contains the title the user inputted and if it matches the 
            categoryId selected by the user. Besides that we will also do a JOIN
            statement by using the include. Here, we want to include the category
            of each course, the id of chapters where isPublished is true and the
            purchases but only the purchases made by the user (if this is empty
            the user did not purchased the course). Finally, order the latest
            course
        */
        const courses = await db.course.findMany({
            where: {
                isPublished: true,
                title: {
                    contains: title,
                },
                categoryId,
            },
            include: {
                category: true,
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
                purchases: {
                    where: {
                        userId,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        /*
            After we get the `courses` above it's time to use it to determine the 
            progress of the user for each of the `courses`. Here, we are using 
            Promise.all because we only want the getCourses function to return 
            a resolved promise if all of the async call are resolved. For each 
            course we are finding out the progress of the user by using the
            getProgress function. After that, we will combine the contents of
            each `course` and the `progress` in an object and return it.
        */
        const coursesWithProgress: CourseWithProgressWithCategory[] =
            await Promise.all(
                courses.map(async (course) => {
                    if (course.purchases.length === 0) {
                        return {
                            ...course,
                            progress: null,
                        };
                    }

                    const progressPercentage = await getProgress(
                        userId,
                        course.id
                    );

                    return {
                        ...course,
                        progress: progressPercentage,
                    };
                })
            );

        return coursesWithProgress;
    } catch (error) {
        console.log("[GET_COURSES]", error);
        return [];
    }
};
