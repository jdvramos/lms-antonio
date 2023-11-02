const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

/*
	This script is used to create categories in the Category table programmatically
	To run this script, run: "node scripts/seed.ts" in the terminal
*/
async function main() {
    try {
        await database.category.createMany({
            data: [
                { name: "Computer Science" },
                { name: "Music" },
                { name: "Fitness" },
                { name: "Photography" },
                { name: "Accounting" },
                { name: "Engineering" },
                { name: "Filming" },
            ],
        });

        console.log("Success");
    } catch (error) {
        console.log("Error seeding the database categories", error);
    } finally {
        await database.$disconnect();
    }
}

main();
