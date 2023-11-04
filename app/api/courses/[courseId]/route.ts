import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import Mux from "@mux/mux-node";

const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!
);

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();
        const { courseId } = params;

        /* 
            This req body will came from a patch req from different components 
            under /teacher/courses/[courseId]/_components
              - title-form.tsx
              - description-form.tsx
              - image-form.tsx
              - category-form.tsx
              - price-form.tsx
        */
        const values = await req.json();

        /* 
			Check if there's a logged in user (authentication)
		*/
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.update({
            where: {
                id: courseId,
                userId,
            },
            data: {
                ...values,
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/* 
    This endpoint will be called on the onDelete function found in 
    teachers/courses/[courseId]/_components/actions.tsx
*/
export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        /* 
			Check if there's a logged in user (authentication)
		*/
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        /* 
			Find if the course the user is trying to delete exist 
            in the database. If not, respond with 404 Not Found
		*/
        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            },
            include: {
                chapters: {
                    include: {
                        muxData: true,
                    },
                },
            },
        });

        if (!course) {
            return new NextResponse("Not found", { status: 404 });
        }

        /* 
			Before deleting the course, remove all the video in MUX
		*/
        for (const chapter of course.chapters) {
            if (chapter.muxData?.assetId) {
                await Video.Assets.del(chapter.muxData.assetId);
            }
        }

        /* 
			Finally, delete the course
		*/
        const deletedCourse = await db.course.delete({
            where: {
                id: params.courseId,
            },
        });

        return NextResponse.json(deletedCourse);
    } catch (error) {
        console.log("[COURSE_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
