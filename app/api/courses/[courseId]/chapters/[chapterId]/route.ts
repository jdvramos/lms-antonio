import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } }
) {
    try {
        const { userId } = auth();

        /* 
            This req body will came from a patch req from different components 
            under /teacher/courses/[courseId]/chapters/[chapterId]/_components
              - chapter-title-form.tsx
			
			Here we used destructuring to extract isPublished out of the rest
			(values). The reason behind this that users cannot accidentally set
			isPublished to true, immediately passed that into values in our update 
			below and the chapter is published. The mechanism of chapter publishing
			will be controlled by a separate API route which is going to check
			whether we have all the required fields to publish a chapter
        */
        const { isPublished, ...values } = await req.json();

        /* 
			Check if there's a logged in user (authentication)
		*/
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        /* 
			Check if the user creating an attachment for a course is
			the owner of the course (authorization)
		*/
        const courseOwner = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            },
            data: {
                ...values,
            },
        });

        // TODO: Handle Video Upload

        return NextResponse.json(chapter);
    } catch (error) {
        console.log("[COURSES_CHAPTER_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
