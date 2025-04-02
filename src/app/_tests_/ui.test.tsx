/** @jest-environment jsdom */
import { render, screen, act } from '@testing-library/react';
import App from '../page';
// import { server } from '../data/_tests_/mocks/server';
import * as getData from '../data/getData';

// jest.mock('../data/getData');
const mockCarData = {
    "image": Buffer.from("123456789", 'binary').toString('base64'),
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
    });
    test('check text is displayed', async () => {
        await act(async () => {
            render(<App />);
        })
        const upperText = screen.getByText("Remove a block to make a guess");
        expect(upperText).toBeDefined();
        const lowerText = screen.getByText("Number of blocks removed: 0");
        expect(lowerText).toBeDefined();
    });
});


