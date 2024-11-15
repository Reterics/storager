// UserModal.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react';
import UserModal from './UserModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import {
    GeneralModalArguments, GeneralModalButtons,
    IAuth,
    Shop,
    StyledInputArgs,
    StyledSelectArgs,
    StyledSelectOption,
    UserModalInput
} from "../../interfaces/interfaces.ts";
import {AuthContext} from "../../store/AuthContext.tsx";



// Mock AuthContext and SignUp function
const SignUpMock = vi.fn();


// Mock GeneralModal component
vi.mock('./GeneralModal.tsx', () => ({
    default: ({ children, buttons }: GeneralModalArguments) => (
        <div>
            {buttons && buttons.map((button: GeneralModalButtons, index: number) => (
                <button key={index} onClick={button.onClick}>
                    {button.value}
                </button>
            ))}
            {children}
        </div>
    ),
}));

// Mock other components
vi.mock('../elements/StyledInput.tsx', () => ({
    default: (props: StyledInputArgs) => (
        <input
            type={props.type}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            aria-label={props.label as string}
        />
    ),
}));

vi.mock('../elements/StyledSelect.tsx', () => ({
    default: (props: StyledSelectArgs) => (
        <select
            name={props.name}
            value={props.value}
            onChange={props.onSelect}
            aria-label={props.label as string}
        >
            {props.options.map((option: StyledSelectOption) => (
                <option key={option.value} value={option.value}>
                    {option.name}
                </option>
            ))}
        </select>
    ),
}));

vi.mock('../elements/FormRow.tsx', () => ({
    default: ({ children }: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('../AlertBox.tsx', () => ({
    default: ({ message }: {message: React.ReactNode|string|undefined}) => <div>{message}</div>,
}));

describe('UserModal', () => {
    const onCloseMock = vi.fn();
    const setUserMock = vi.fn();
    const onSaveMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const RenderModal = ({onClose, user, setUser, onSave, inPlace, shops}: UserModalInput) => {

        return (
            <AuthContext.Provider value={{ SignUp: SignUpMock } as unknown as IAuth}>
                <UserModal onClose={onClose} user={user} setUser={setUser} onSave={onSave} inPlace={inPlace} shops={shops}
                />
            </AuthContext.Provider>
        )
    }

    it('renders correctly with existing user', () => {
        const user = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            shop_id: ['1'],
            role: 'admin',
        };

        const shops = [
            { id: '1', name: 'Shop 1' },
            { id: '2', name: 'Shop 2' },
        ];

        const { getByLabelText, queryByLabelText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        expect(getByLabelText('Username')).toBeInTheDocument();
        expect(getByLabelText('Email')).toBeInTheDocument();
        expect(getByLabelText('Assigned Shop')).toBeInTheDocument();
        expect(getByLabelText('Role')).toBeInTheDocument();

        // Password fields should not be rendered when user.id exists
        expect(queryByLabelText('Password')).not.toBeInTheDocument();
        expect(queryByLabelText('Password Confirmation')).not.toBeInTheDocument();
    });

    it('renders correctly when creating new user', () => {
        const user = {
            id: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            shop_id: [],
            role: '',
        };

        const shops = [
            { id: '1', name: 'Shop 1' },
            { id: '2', name: 'Shop 2' },
        ];

        const { getByLabelText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        expect(getByLabelText('Username')).toBeInTheDocument();
        expect(getByLabelText('Email')).toBeInTheDocument();
        expect(getByLabelText('Password')).toBeInTheDocument();
        expect(getByLabelText('Password Confirmation')).toBeInTheDocument();
        expect(getByLabelText('Assigned Shop')).toBeInTheDocument();
        expect(getByLabelText('Role')).toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', () => {
        const user = {
            id: '1',
            username: '',
            email: '',
            shop_id: [],
            role: '',
        };

        const shops = [] as Shop[];

        const { getByText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(onCloseMock).toHaveBeenCalled();
    });

    it('updates user state when input changes', () => {
        const user = {
            id: '1',
            username: '',
            email: '',
            shop_id: [],
            role: '',
        };

        const shops = [] as Shop[];

        const { getByLabelText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const usernameInput = getByLabelText('Username');
        fireEvent.change(usernameInput, { target: { value: 'newusername' } });

        expect(setUserMock).toHaveBeenCalledWith({
            ...user,
            username: 'newusername',
        });
    });

    it('shows error if email is missing when saving', async () => {
        const user = {
            id: '1',
            username: 'testuser',
            email: '',
            shop_id: [''],
            role: '',
        };

        const shops = [] as Shop[];

        const { getByText, findByText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        const errorMessage = await findByText('Email must be provided');
        expect(errorMessage).toBeInTheDocument();

        expect(onSaveMock).not.toHaveBeenCalled();
    });

    it('shows error if passwords mismatch when creating new user', async () => {
        const user = {
            id: '',
            username: 'testuser',
            email: 'test@example.com',
            password: 'password1',
            password_confirmation: 'password2',
            shop_id: [],
            role: '',
        };

        const shops = [] as Shop[];

        const { getByText, findByText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        const errorMessage = await findByText('Passwords mismatch');
        expect(errorMessage).toBeInTheDocument();

        expect(onSaveMock).not.toHaveBeenCalled();
    });

    it('calls SignUp and onSave when creating new user with valid data', async () => {
        const user = {
            id: '',
            username: 'testuser',
            email: 'test@example.com',
            password: 'password1',
            password_confirmation: 'password1',
            shop_id: [],
            role: '',
        };

        const shops = [] as Shop[];

        SignUpMock.mockResolvedValue({});

        const { getByText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(SignUpMock).toHaveBeenCalledWith({
                displayName: 'testuser',
                email: 'test@example.com',
                password: 'password1',
            });
        });

        expect(onSaveMock).toHaveBeenCalledWith({
            ...user,
        });
    });

    it('calls onSave when updating existing user', async () => {
        const user = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            shop_id: ['shop1'],
            role: '',
        };

        const shops = [] as Shop[];

        const { getByText } = render(
            <RenderModal
                onClose={onCloseMock}
                user={user}
                setUser={setUserMock}
                onSave={onSaveMock}
                inPlace={false}
                shops={shops}
            />
        );

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(SignUpMock).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(onSaveMock).toHaveBeenCalledWith(user);
        });
    });
});
