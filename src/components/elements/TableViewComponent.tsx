import {ChangeEvent, MouseEvent, MouseEventHandler, useState} from "react";
import {
    OrderType, StyledSelectOption,
    TableHead, TableLineElementType, TableOnChangeMethod,
    TableViewActionArguments,
    TableViewArguments,
    TableViewLineArguments
} from "../../interfaces/interfaces.ts";
import {
    BsArrowLeftSquare, BsArrowRightSquare,
    BsFileCodeFill,
    BsFileText,
    BsFillFileEarmarkFill, BsFillFolderFill,
    BsFillPrinterFill,
    BsFillTrashFill, BsFillXCircleFill,
    BsFloppyFill,
    BsPencilSquare, BsRecord, BsRecord2, BsSortDown, BsSortUp
} from "react-icons/bs";
import StyledInput from "./StyledInput.tsx";
import StyledSelect from "./StyledSelect.tsx";
import {BSIconDimensions} from "../../utils/ui.ts";

const TableViewHeader = ({header, orderType, orderBy, setOrderBy, setOrderType}: {
    header?: (string | TableHead)[],
    orderBy: null | number,
    orderType: OrderType,
    setOrderBy: (orderBy: number) => void,
    setOrderType: (orderType: OrderType) => void,
}) => {
    if (!header || !header.length) {
        return null;
    }

    const updateOrderBy = (index: number) => {
        if (orderBy === index) {
            setOrderType(orderType === 'ASC' ? 'DSC' : 'ASC')
        } else {
            setOrderBy(index);
        }
    }

    return (
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
            {header.map((head, index) => (
                <th
                    scope="col"
                    key={"table_header_" + index}
                    className={
                    (index === header.length - 1 ? "px-3 py-2 text-right flex justify-end" : "px-3 py-2") +
                        (head === '#' && !index ? " w-[1em] text-center" : "" )
                }
                >
                    <div className={head === '#' && !index ? "flex justify-center": "flex items-center"}>
                        {typeof head === "string" ? (head) : head.value}

                        {typeof head !== "string" && head.sortable && orderType === 'DSC' &&
                            <div className="text-xl ms-1"><BsSortUp onClick={() => updateOrderBy(index)}/></div>}

                        {typeof head !== "string" && head.sortable && orderType === 'ASC' &&
                            <div className="text-xl ms-1"><BsSortDown onClick={() => updateOrderBy(index)}/></div>}
                    </div>
                </th>
            ))}
        </tr>
        </thead>
    )
};


const TableViewEditableElement = (element: TableLineElementType, options: TableHead, onChange: TableOnChangeMethod, index: number, col: number) => {

    const [editMode, setEditMode] = useState<boolean>(false);
    const [value, setValue] = useState<TableLineElementType>(element);

    if (!editMode) {
        // Support outside changing from DB
        if (element !== value) {
            setValue(element)
        }
        return <div onClick={() => setEditMode(true)}>{element} {options.postFix}</div>;
    }

    const closeEditMode = () => {
        if (element !== value) {
            onChange(index, col, value);
        }
        setEditMode(false);
    };

    const closeButton = <div
        className="text-sm ms-1"
        onClick={() => closeEditMode()}

    ><BsFillXCircleFill/></div>

    switch (options.type) {
        case 'steps':
            return (
                <div className="flex flex-row items-center cursor-pointer">
                    <BsArrowLeftSquare
                        style={BSIconDimensions}
                        onClick={() => setValue(Number(value) - 1)}/>
                    <span className="m-0 w-1/2 ms-1 me-1 text-xl">
                        <StyledInput type="number" value={value as number || 0}
                                     className="mt-0 w-[50px] me-1 hide-arrows"
                                     onChange={(e) => setValue(e.target.value)}
                                     onEnter={() => closeEditMode()}
                        />
                    </span>
                    <BsArrowRightSquare
                        style={BSIconDimensions}
                        onClick={() => setValue(Number(value) + 1)}/>
                    {options.postFix}
                    {closeButton}
                </div>
            )
        case 'number':
            return <div className="flex flex-row text-xl items-center cursor-pointer">
                <StyledInput
                    type="number"
                    value={value as number || 0}
                    className="mt-0 w-auto me-1 max-w-28 min-w-12"
                    onEnter={() => closeEditMode()}
                    onChange={(e) => setValue(e.target.value)}
                />{options.postFix}
                {closeButton}</div>;
        case 'text':
            return <div className="flex flex-row text-xl items-center cursor-pointer">
                <StyledInput
                    type="text"
                    value={value as string || ''}
                    className="mt-0 w-auto me-1 min-w-4"
                    onEnter={() => closeEditMode()}
                    onChange={(e) => setValue(e.target.value)}
                />
                {closeButton}</div>;
        case 'checkbox':
            break;
        case 'select':
            return <div className="flex flex-row text-xl items-center cursor-pointer">
                <StyledSelect
                    type="text" name={options.value + '_' + index}
                    options={options.options as StyledSelectOption[]}
                    value={value as string || ''}
                    onSelect={(e) => setValue((e as unknown as ChangeEvent<HTMLInputElement>).target?.value)}
                    label={false}
                />
                {closeButton}
            </div>;
        default:
            return element;
    }
}


const TableViewLine = ({line, index, header, onChange, onClick, isSelected}: TableViewLineArguments) => {

    const onSelect = (e: MouseEvent<HTMLTableHeaderCellElement>) => {
        e.preventDefault();
        if (typeof onClick === 'function') {
            onClick(index);
        }
    };

    const _line = [...line];
    if (typeof isSelected === 'boolean') {
        _line.unshift(isSelected ? <BsRecord2 /> : <BsRecord />);
    }

    return (_line.map((column, columnIndex) => (
        <td scope="col" key={'column_' + columnIndex + '_' + index}
            className={"font-medium text-gray-900 whitespace-nowrap dark:text-white" +
                (columnIndex === _line.length - 1 ? " text-right py-1 pe-1" : " px-2 py-2") +
                (typeof isSelected === 'boolean' && !columnIndex ? " text-lg" : "")
        } onClick={(e)=>onSelect(e)}>
            {header && typeof header[columnIndex] !== 'string' && header[columnIndex].editable ?
                TableViewEditableElement(column, header[columnIndex], onChange || (() => false), index,
                    columnIndex) : column}

            {header && typeof header[columnIndex] !== 'string' &&
                !header[columnIndex].editable && header[columnIndex].postFix
            }
        </td>
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
        <div className="inline-flex rounded-md shadow-sm align-middle" role="group">
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

const TableViewComponent = (
    {
        header,
        lines,
        children,
        onChange,
        onClick,
        selectedIndexes,
        isHighlighted,
        tableLimits,
    }: TableViewArguments) => {
    const [orderBy, setOrderBy] = useState<null|number>(null);
    const [orderType, setOrderType] = useState<OrderType>('ASC');

    const _header = selectedIndexes && header ? ["#", ...header] : header;
    const supportedOrderTypes = ['string', 'number'];
    const orderedLines = (!orderBy ? lines : lines.sort((a, b) => {
        if (a[orderBy] === undefined || b[orderBy] === undefined) {
            return 0; // If key doesn't exist, treat as equal
        }
        if (!supportedOrderTypes.includes(typeof a[orderBy]) ||
            !supportedOrderTypes.includes(typeof b[orderBy]) ||
            a[orderBy] === null || b[orderBy] === null) {
            return 0; // If key doesn't a string, treat as equal
        }
        if (orderType === 'ASC') {
            return a[orderBy] > b[orderBy] ? 1 : -1;
        } else {
            return a[orderBy] < b[orderBy] ? 1 : -1;
        }
    })).slice(0, tableLimits ?? 10000)
    return (
        <table className="text-sm text-left text-gray-500 dark:text-gray-400 max-w-screen-xl w-full shadow-md self-center">
            <TableViewHeader header={_header}
                             orderType={orderType} setOrderType={setOrderType}
                             orderBy={orderBy} setOrderBy={setOrderBy}/>
            <tbody>
            {orderedLines.map((line, index) =>
                <tr key={'key' + index} className={
                    " border-b dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800" +

                    (index % 2  ? " bg-gray-100 dark:bg-gray-600" : " bg-white dark:bg-gray-900") +
                    (typeof isHighlighted === 'function' && isHighlighted(line, index) ? " bg-yellow-50 dark:bg-yellow-950" : "") +
                    (selectedIndexes?.[index] ? " bg-gray-300 dark:bg-gray-700" : "") +

                    (onClick ? " cursor-pointer" : "")
                }>
                    <TableViewLine line={line} index={index} header={_header} onChange={onChange} onClick={onClick}
                        isSelected={selectedIndexes ? !!selectedIndexes?.[index] : undefined}/>
                </tr>
            )}
            {children}
            </tbody>
        </table>
    )
};

export default TableViewComponent;
