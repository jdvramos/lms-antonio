import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isTeacher } from "@/lib/teacher";

/*
	This layout will not replace the app/(dashboard)/layout.tsx. We only want
	a teacher to be the the one that will be allowed to access the /teacher
	route
*/
const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
    const { userId } = auth();

    if (!isTeacher(userId)) {
        return redirect("/");
    }

    return <>{children}</>;
};

export default TeacherLayout;
