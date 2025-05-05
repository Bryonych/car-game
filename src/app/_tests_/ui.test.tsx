/** @jest-environment jsdom */
import { render, screen, act, fireEvent } from '@testing-library/react';
import App from '../page';
import userEvent from "@testing-library/user-event";
import * as getData from '../data/getData';
import { localStateStore } from '../data/handleLocalState';

const mockCarData = {
    "image": "https://testimage.jpg",
    "carlist": ["cartwo", "carone"],
    "cardata": {
        "Make": "test make",
        "Model": "test model",
        "Year": 1983,
        "S3-Key": "test s3 key"
    }
};

describe('Render UI Tests', () => {
    beforeAll(() => {
        jest.spyOn(getData, 'getTodaysCar').mockResolvedValue(mockCarData);
        const localStorageMock = (function () {
            const store: { [key: string]: string; } = {};
            return {
                getItem: jest.fn((key) => store[key] || null),
                setItem: jest.fn((key, value) => {
                    store[key] = value.toString();
                }),
                removeItem: jest.fn((key) => {
                    delete store[key];
                }),
            };
        })();
    
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });
    });
    test('check text is displayed', async () => {
        await act(async () => {
            render(<App />);
        });
        const upperText = screen.getByText("Remove a tile to make a guess");
        expect(upperText).toBeDefined();
        const lowerText = screen.getByText("Tiles removed: 0");
        expect(lowerText).toBeDefined();
    });
    test('check image loads', async () => {
        await act(async () => {
            render(<App />);
        });
        if (typeof window !== "undefined") {
            const image = document.querySelector("img") as HTMLImageElement;
            expect(image.src).toContain("testimage");
        }
    });
    test('check button and drop down load and are disabled', async () => {
        await act(async () => {
            render(<App />);
        });
        const button = screen.getByText("Submit");
        const dropDown = screen.getByLabelText("Guess");
        expect(button).toHaveProperty('disabled', true);
        expect(dropDown).toHaveProperty('disabled', true);
    });
    test('check that tiless are rendered', async () => {
        await act(async () => {
            render(<App />);
        });
        const tiles = screen.getAllByTitle("tile");
        expect(tiles).toHaveLength(15);
    });
    test('check that dropdown and button are enabled after two tile clicks', async () => {
        await act(async () => {
            render(<App />);
        });
        const tiles = screen.getAllByTitle("tile");
        const button = screen.getByText("Submit");
        const dropDown = screen.getByRole("combobox");
        fireEvent.click(tiles[7]);
        expect(button).toHaveProperty('disabled', true);
        expect(dropDown).toHaveProperty('disabled', true);
        fireEvent.click(tiles[7]);
        expect(dropDown).toHaveProperty('disabled', false);
        await userEvent.type(dropDown, "cartwo");
        await userEvent.click(screen.getByText("cartwo"));
        // Check Button is now enabled
        expect(button).toHaveProperty('disabled', false);
    });

    it("should store item in local storage and then retrieve it", () => {
        localStateStore.setItem('test value');
        expect(window.localStorage.setItem).toHaveBeenCalledWith('car-game', 'test value');
        const result = localStateStore.getItem();
        expect(result).toBe('test value');
    });

    it("should delete the item from local storage and then not be there to retrieve", () => {
        localStateStore.removeItem();
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('car-game');
        const result = localStateStore.getItem();
        expect(result).toBe(null);
    })
});


