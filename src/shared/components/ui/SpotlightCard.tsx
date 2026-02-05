import React from 'react';
import { cn } from '@/shared/lib/utils';
import { useMousePosition } from '@/shared/hooks/useMousePosition';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export const SpotlightCard = ({
    children,
    className,
    spotlightColor = "rgba(255, 255, 255, 0.1)",
    ...props
}: SpotlightCardProps) => {
    const { ref, x, y } = useMousePosition();

    return (
        <div
            ref={ref}
            className={cn(
                "relative overflow-hidden group",
                className
            )}
            style={{
                // @ts-ignore - CSS variables for spotlight
                "--mouse-x": `${x}px`,
                "--mouse-y": `${y}px`,
                "--spotlight-color": spotlightColor
            } as React.CSSProperties}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 placeholder-spotlight"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 40%)`
                }}
            />
            {children}
        </div>
    );
};
