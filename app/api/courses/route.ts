import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { isTeacher } from "@/lib/teacher";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        /* 
            This request body came from the /teacher/create/page.tsx post request
        */
        const { title } = await req.json();

        /*
            Only a teacher can be the one that will be allowed to create a course
        */
        if (!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.create({
            data: {
                userId,
                title,
            },
        });

        /*
            This response will be sent back to the /teacher/create/page.tsx response variable
        */
        return NextResponse.json(course);
    } catch (error) {
        console.log("[COURSES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
