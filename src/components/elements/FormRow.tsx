import React from "react";


export default function FormRow({children}:{children:React.ReactNode}) {
    // Tailwind bug
    const supportedVariants = [
        "md:grid-cols-0",
        "md:grid-cols-1",
        "md:grid-cols-2",
        "md:grid-cols-3",
        "md:grid-cols-4",
        "md:grid-cols-5",
        "md:grid-cols-6",
    ];
    const colCount = React.Children.count(children); // Calculate the number of children

    return (
        <div className={"grid " + (supportedVariants[colCount] || "") + " md:gap-6 mb-1"}>
            {children}
        </div>
        );
}
