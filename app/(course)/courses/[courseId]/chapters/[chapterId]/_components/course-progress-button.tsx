"use client";

import { useState } from "react";

import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { CheckCircle, XCircle } from "lucide-react";

import { useConfettiStore } from "@/hooks/use-confetti-store";

import { Button } from "@/components/ui/button";

interface CourseProgressButtonProps {
    chapterId: string;
    courseId: string;
    isCompleted?: boolean;
    nextChapterId?: string;
}

export const CourseProgressButton = ({
    chapterId,
    courseId,
    isCompleted,
    nextChapterId,
}: CourseProgressButtonProps) => {
    const router = useRouter();
    const confetti = useConfettiStore();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            await axios.put(
                `/api/courses/${courseId}/chapters/${chapterId}/progress`,
                {
                    isCompleted: !isCompleted,
                }
            );

            /*
				Even if the put request above was successful and the isCompleted 
				property of the chapter was updated the isCompleted here is still
				stale that's why we inverse isCompleted here. You're only going to
				get the fresh value of the isCompleted once router.refresh() was
				called. We also check if there's no nextChapterId, if so we will
				display a confetti to indicate that the user has finished the course
			*/
            if (!isCompleted && !nextChapterId) {
                confetti.onOpen();
            }

            /*
				Same as to why isCompleted has been inverted. Here, we are going to
				the next chapter only if there is one
			*/
            if (!isCompleted && nextChapterId) {
                router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
            }

            toast.success("Progress updated");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const Icon = isCompleted ? XCircle : CheckCircle;

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            type="button"
            variant={isCompleted ? "outline" : "success"}
            className="w-full md:w-auto"
        >
            {isCompleted ? "Not completed" : "Mark as complete"}
            <Icon className="h-4 w-4 ml-2" />
        </Button>
    );
};
