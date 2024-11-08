import { render, screen, fireEvent } from "@testing-library/react";
import ScreenMessage from "./ScreenMessage";
import {describe, expect, it, vi } from "vitest";

// Mocking logo import
vi.mock("../assets/logo.svg", () => (
    {
        "default": "mockedLogo.svg"
    }
));

describe("ScreenMessage Component", () => {
    it("renders children correctly", () => {
        render(<ScreenMessage>Test Message</ScreenMessage>);
        expect(screen.getByText("Test Message")).toBeInTheDocument();
    });

    it("renders logo with correct alt text", () => {
        render(<ScreenMessage>Test Message</ScreenMessage>);
        expect(screen.getByAltText("Reterics logo")).toHaveAttribute("src", "mockedLogo.svg");
    });

    it("renders the button when button prop is provided", () => {
        render(<ScreenMessage button="Click Me">Test Message</ScreenMessage>);
        expect(screen.getByRole("button", { name: /Click Me/i })).toBeInTheDocument();
    });

    it("does not render the button when button prop is not provided", () => {
        render(<ScreenMessage>Test Message</ScreenMessage>);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("calls onClick when button is clicked", () => {
        const onClickMock = vi.fn();
        render(<ScreenMessage button="Click Me" onClick={onClickMock}>Test Message</ScreenMessage>);
        fireEvent.click(screen.getByRole("button", { name: /Click Me/i }));
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("calls onClick when the container div is clicked", () => {
        const onClickMock = vi.fn();
        render(<ScreenMessage onClick={onClickMock}>Test Message</ScreenMessage>);
        fireEvent.click(screen.getByText("Test Message").closest("div")!);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});
