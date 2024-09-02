import { MouseEventHandler } from "react";
import {TableViewActionArguments, TableViewArguments, TableViewLineArguments} from "../../interfaces/interfaces.ts";
import {
    BsFileCodeFill,
    BsFileText,
    BsFillFileEarmarkFill, BsFillFolderFill,
    BsFillPrinterFill,
    BsFillTrashFill,
    BsFloppyFill,
    BsPencilSquare
} from "react-icons/bs";

const TableViewHeader = ({header}: { header?: string[] }) => {
    if (!header || !header.length) {
        return null;
    }

    return (
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
            {header.map((head, index) => (
                <th scope="col" className={index === header.length-1 ? "px-6 py-3 text-right" : "px-6 py-3"}>
                    {head}
                </th>
            ))}
        </tr>
        </thead>
    )
};

const TableViewLine = ({line, index}: TableViewLineArguments) => {
    return (line.map((column, columnIndex) => (
        <th scope="row" key={'column_' + columnIndex + '_' + index}
            className={"px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white p-2" +
                (columnIndex === line.length - 1 ? " text-right" : "")}>
            {column}
        </th>
    )));
}


export const TableViewActions = ({
    onPaste,
    onOpen,
    onEdit,
    onRemove,
    onCreate,
    onPrint,
    onSave,
    onCode,
}: TableViewActionArguments) => {
    const first = onCreate || onOpen || onSave || onCode || onPaste || onEdit || onRemove || onPrint;
    const last = onPrint || onRemove || onEdit || onPaste || onCode || onSave || onOpen || onCreate;

    const getClass = (selected: MouseEventHandler<HTMLButtonElement> | undefined) => {
        if (selected === first) {
            return "px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white";
        }
        if (selected === last) {
            return "px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white";
        }
        return "px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white";
    };

    return (
        <div className="inline-flex rounded-md shadow-sm" role="group">
            {onCreate && <button type="button" className={getClass(onCreate)} onClick={onCreate}><BsFillFileEarmarkFill /></button> }
            {onOpen && <button type="button" className={getClass(onOpen)} onClick={onOpen}><BsFillFolderFill /></button> }
            {onSave && <button type="button" className={getClass(onSave)} onClick={onSave}><BsFloppyFill /></button> }
            {onCode && <button type="button" className={getClass(onCode)} onClick={onCode}><BsFileCodeFill /></button> }
            {onPaste && <button type="button" className={getClass(onPaste)} onClick={onPaste}><BsFileText /></button> }
            {onEdit && <button type="button" className={getClass(onEdit)} onClick={onEdit}><BsPencilSquare /></button> }
            {onRemove && <button type="button" className={getClass(onRemove)} onClick={onRemove}><BsFillTrashFill /></button> }
            {onPrint && <button type="button" className={getClass(onPrint)} onClick={onPrint}><BsFillPrinterFill /></button> }
        </div>
    );
}

const TableViewComponent = ({header, lines, children}: TableViewArguments) => {
    return (
        <table className="text-sm text-left text-gray-500 dark:text-gray-400 max-w-screen-xl w-full">
            <TableViewHeader header={header}/>
            <tbody>
            {lines.map((line, index) =>
                <tr key={'key' + index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                    <TableViewLine line={line} index={index}/>
                </tr>
            )}
            {children}
            </tbody>
        </table>
    )
};

export default TableViewComponent;