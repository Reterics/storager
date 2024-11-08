import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import StyledInput from "./StyledInput";
import { ChangeEvent } from "react";

describe("StyledInput", () => {
    const onChangeMock = vi.fn();
    const onEnterMock = vi.fn();

    beforeEach(() => {
        onChangeMock.mockClear();
        onEnterMock.mockClear();
    });

    it("renders the label if provided", () => {
        render(
            <StyledInput
                value=""
                onChange={onChangeMock}
                name="test-input"
                label="Test Label"
            />
        );

        expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("renders with correct placeholder text", () => {
        render(
            <StyledInput
                value=""
                onChange={onChangeMock}
                name="test-input"
                placeholder="Enter text here"
            />
        );

        expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
    });

    it("calls onChange when input value changes", () => {
        render(
            <StyledInput
                value=""
                onChange={onChangeMock}
                name="test-input"
            />
        );

        const inputElement = screen.getByRole("textbox");
        fireEvent.change(inputElement, { target: { value: "new value" } });
        fireEvent.keyDown(inputElement, { target: {value: "new value" } });

        expect(onChangeMock).toHaveBeenCalled();
        expect(onChangeMock.mock.calls[0][0].target.value).toBe("new value");
    });

    it("calls onEnter when Enter key is pressed", () => {
        render(
            <StyledInput
                value=""
                onChange={onChangeMock}
                onEnter={onEnterMock}
                name="test-input"
            />
        );

        const inputElement = screen.getByRole("textbox");
        fireEvent.keyDown(inputElement, { key: "A", code: "KeyA" });
        expect(onEnterMock).not.toHaveBeenCalled();

        fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter" });
        expect(onEnterMock).toHaveBeenCalled();
    });

    it("validates pattern on focus loss", () => {
        const consoleWarnMock = vi.spyOn(console, "warn").mockImplementation(() => {});
        const pattern = "^\\d{3}$"; // Accepts exactly 3 digits

        const {rerender} = render(
            <StyledInput
                value="abc"
                onChange={onChangeMock}
                name="test-input"
                pattern={pattern}
            />
        );

        let inputElement = screen.getByRole("textbox");
        fireEvent.blur(inputElement);

        expect(consoleWarnMock).toHaveBeenCalledWith("Value is not matching with ^\\d{3}$");

        rerender(<StyledInput
            value="abc"
            onChange={onChangeMock}
            name="test-input"
        />)

        consoleWarnMock.mockReset();
        inputElement = screen.getByRole("textbox");
        fireEvent.blur(inputElement);

        expect(consoleWarnMock.mock.calls.length).toEqual(0);

        consoleWarnMock.mockRestore();
    });

    it("does not warn if pattern matches on focus loss", () => {
        const consoleWarnMock = vi.spyOn(console, "warn").mockImplementation(() => {});
        const pattern = "^\\d{3}$"; // Accepts exactly 3 digits

        render(
            <StyledInput
                value="123"
                onChange={onChangeMock}
                name="test-input"
                pattern={pattern}
            />
        );

        const inputElement = screen.getByRole("textbox");
        fireEvent.blur(inputElement);

        expect(consoleWarnMock).not.toHaveBeenCalled();
        consoleWarnMock.mockRestore();
    });

    it("renders a textarea when type is 'textarea'", () => {
        render(
            <StyledInput
                value=""
                onChange={onChangeMock as unknown as (e: ChangeEvent<HTMLInputElement>) => void}
                name="test-textarea"
                type="textarea"
            />
        );

        expect(screen.getByRole("textbox")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveAttribute("id", "test-textarea");
    });
});
