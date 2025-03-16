import {StyledSelectOption} from "../interfaces/interfaces.ts";


export const BSIconDimensions = {
    height: '1.25rem',
    width: '1.4rem'
};

export const textToOptions = (strings: string[], names: string[]|undefined):  StyledSelectOption[] => {
    return strings.map((string, index) => {
        return {value: string, name: names ? names[index] : string}
    });
}