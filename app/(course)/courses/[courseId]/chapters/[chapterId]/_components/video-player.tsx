"use client";

import { useState } from "react";

import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";

import { cn } from "@/lib/utils";
import { Loader2, Lock } from "lucide-react";

interface VideoPlayerProps {
    playbackId: string;
    courseId: string;
    chapterId: string;
    nextChapterId?: string;
    isLocked: boolean;
    completeOnEnd: boolean;
    title: string;
}

export const VideoPlayer = ({
    playbackId,
    courseId,
    chapterId,
    nextChapterId,
    isLocked,
    completeOnEnd,
    title,
}: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false);

    const router = useRouter();
    const confetti = useConfettiStore();

    /*
        The completeOnEnd variable name kind of cryptic. Basically, it will be false
        if the course was purchased and the chapter was already completed (isCompleted
        is true). Here, we will only do a put request if completeOnEnd is true which
        just means the chapter is not yet completed by the user (video hasn't been
        finished yet or chapter not set to complete manually)
    */
    const onEnd = async () => {
        try {
            if (completeOnEnd) {
                await axios.put(
                    `/api/courses/${courseId}/chapters/${chapterId}/progress`,
                    {
                        isCompleted: true,
                    }
                );

                if (!nextChapterId) {
                    confetti.onOpen();
                }

                toast.success("Progress updated");
                router.refresh();

                if (nextChapterId) {
                    router.push(
                        `/courses/${courseId}/chapters/${nextChapterId}`
                    );
                }
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="relative aspect-video">
            {!isReady && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            )}
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
                    <Lock className="h-8 w-8" />
                    <p className="text-sm">This chapter is locked</p>
                </div>
            )}
            {!isLocked && (
                <MuxPlayer
                    title={title}
                    className={cn(!isReady && "hidden")}
                    onCanPlay={() => setIsReady(true)}
                    onEnded={onEnd}
                    autoPlay
                    playbackId={playbackId}
                />
            )}
        </div>
    );
};
