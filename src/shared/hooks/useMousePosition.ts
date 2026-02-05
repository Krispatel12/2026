import { useState, useEffect, useRef } from 'react';

export const useMousePosition = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setPosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };

        const element = ref.current;
        if (element) {
            element.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (element) {
                element.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return { ref, x: position.x, y: position.y };
};
