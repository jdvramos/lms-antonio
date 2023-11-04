import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } }
) {
    try {
        /* 
			Check if there's a logged in user (authentication)
		*/
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        /* 
			Check if the user trying to publish a chapter of a course
            is the owner of the course (authorization)
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

        /* 
			Check if the chapter exist and the chapter's muxData have
			values, if not it's a bad request (400) as we only allow 
			a chapter to be published it it has all the required fields
		*/
        const chapter = await db.chapter.findUnique({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            },
        });

        const muxData = await db.muxData.findUnique({
            where: {
                chapterId: params.chapterId,
            },
        });

        if (
            !chapter ||
            !muxData ||
            !chapter.title ||
            !chapter.description ||
            !chapter.videoUrl
        ) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        /* 
			At this point, the chapter is publishable, update the 
			chapter's isPublished property to true
		*/
        const publishedChapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            },
            data: {
                isPublished: true,
            },
        });

        return NextResponse.json(publishedChapter);
    } catch (error) {
        console.log("[CHAPTER_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
