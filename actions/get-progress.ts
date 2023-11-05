import { db } from "@/lib/db";

/*
    The getProgress function will be used to determine the progress of the user
    (in percentage) in the course they purchased. If the course is purchased we
    will display the progress, if not we will display the price instead.

    The getProgress function will be utilized by the actions/get-courses.ts
*/
export const getProgress = async (
    userId: string,
    courseId: string
): Promise<number> => {
    try {
        /*
            In our db model, every chapter will many userProgress but each userProgress
            is only owned by one user. The userProgress (from UserProgress table) have a
            isCompleted property which will only be set to true when the user who purchased
            the course finishes the video corresponding to that chapter. What we are doing
            here is:
            1. Getting all the published chapters of the course, getting only their id
            2. Map it into an array
            3. Use the publishedChapterIds to determine how many chapters of the course
               the user has completed
            4. Compare the validCompletedChapters and publishedChapterIds to determine
               the progress of the user in the course they purchased
        */
        const publishedChapters = await db.chapter.findMany({
            where: {
                courseId: courseId,
                isPublished: true,
            },
            select: {
                id: true,
            },
        });

        const publishedChapterIds = publishedChapters.map(
            (chapter) => chapter.id
        );

        const validCompletedChapters = await db.userProgress.count({
            where: {
                userId: userId,
                chapterId: {
                    in: publishedChapterIds,
                },
                isCompleted: true,
            },
        });

        const progressPercentage =
            (validCompletedChapters / publishedChapterIds.length) * 100;

        return progressPercentage;
    } catch (error) {
        console.log("[GET_PROGRESS]", error);
        /*
            If we ever got any errors let's just return 0
        */
        return 0;
    }
};
