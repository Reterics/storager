import React from "react";


export default function FormRow({children}:{children:React.ReactNode}) {
    const colCount = React.Children.count(children); // Calculate the number of children

    return (
        <div className={"grid md:grid-cols-" + colCount + " md:gap-6 mb-1"}>
            {children}
        </div>
        );
}
