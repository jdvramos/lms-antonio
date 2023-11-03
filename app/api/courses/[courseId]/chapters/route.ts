import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        /* 
			This req body will came from a post req from chapters-form.tsx
		*/
        const { title } = await req.json();

        /* 
			Check if there's a logged in user (authentication)
		*/
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        /* 
			Check if the user creating a chapter for a course is
			the owner of the course (authorization)
		*/
        const courseOwner = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        /* 
			Before we can create our new chapter we have to attempt fetch the
			last chapter (chapter that has the highest position value) so we
			know what is the position we have to add for this new chapter 
			that we are going to create
		*/
        const lastChapter = await db.chapter.findFirst({
            where: {
                courseId: params.courseId,
            },
            orderBy: {
                position: "desc",
            },
        });

        /*
			If there's a lastChapter then grab its position and increment by 1.
			Otherwise, assign its position as 1
		*/
        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        /*
			Now we can finally create our chapter
		*/
        const chapter = await db.chapter.create({
            data: {
                title,
                courseId: params.courseId,
                position: newPosition,
            },
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.log("[CHAPTERS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
