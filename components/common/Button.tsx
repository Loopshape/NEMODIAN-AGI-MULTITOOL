
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, className, isLoading, ...props }) => {
    const baseClasses = "px-4 py-2 rounded text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const themeClasses = "bg-[#4ac94a] border border-[#4ac94a] text-[#3a3c31] hover:bg-[#5ae05a] hover:border-[#5ae05a]";

    return (
        <button className={`${baseClasses} ${themeClasses} ${className}`} disabled={isLoading} {...props}>
            {isLoading && <Spinner />}
            {children}
        </button>
    );
};

export default Button;
