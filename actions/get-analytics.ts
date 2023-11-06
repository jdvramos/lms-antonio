import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
    course: Course;
};

/*
	The groupByCourse function is a helper function that will be called by
	the getAnalytics function. It will take all the purchased courses that
	the logged in user has created (purchases) as an argument. It will loop
	through the purchases array, extract the course title, store the course
	title as key and will count the total of revenue for each course title
	as value
*/
const groupByCourse = (purchases: PurchaseWithCourse[]) => {
    const grouped: { [courseTitle: string]: number } = {};

    purchases.forEach((purchase) => {
        const courseTitle = purchase.course.title;
        if (!grouped[courseTitle]) {
            grouped[courseTitle] = 0;
        }
        grouped[courseTitle] += purchase.course.price!;
    });

    return grouped;
};

export const getAnalytics = async (userId: string) => {
    try {
        /*
			Get all the purchased course where the logged in user is the
			creator
		*/
        const purchases = await db.purchase.findMany({
            where: {
                course: {
                    userId: userId,
                },
            },
            include: {
                course: true,
            },
        });

        /*
			Use the getByCourse function above to get the total revenue
			per course title. The getByCourse function will return an
			object where each key is the course title and the value is the
			total revenue for each course
		*/
        const groupedEarnings = groupByCourse(purchases);

        /*
			Use the Object.entries and map to create an array where each
			element is an object. Hover on the data variable in order to
			get an insight on what does the operation return
		*/
        const data = Object.entries(groupedEarnings).map(
            ([courseTitle, total]) => ({
                name: courseTitle,
                total: total,
            })
        );

        /*
			Use the data variable to get the total revenue of all the courses
			the logged in user has able to sold
		*/
        const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);

        /*
			Count all the courses that are purchased
		*/
        const totalSales = purchases.length;

        return {
            data,
            totalRevenue,
            totalSales,
        };
    } catch (error) {
        console.log("[GET_ANALYTICS]", error);
        return {
            data: [],
            totalRevenue: 0,
            totalSales: 0,
        };
    }
};
