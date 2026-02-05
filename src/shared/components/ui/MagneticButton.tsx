import React, { useRef, useState } from 'react';
import { Button, ButtonProps } from "@/shared/components/ui/button";
// framer-motion import removed 
// But framer-motion might be already installed? 
// Let me check package.json again. 
// If not using framer-motion, I will use pure CSS/JS.
// The user has standard React. I will use a lightweight JS approach.

interface MagneticButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export const MagneticButton = ({ children, className, ...props }: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const x = (clientX - (left + width / 2)) * 0.2; // Move 20% of distance
        const y = (clientY - (top + height / 2)) * 0.2;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <Button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            {...props}
        >
            {children}
        </Button>
    );
};
