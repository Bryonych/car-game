import { expect, it } from '@jest/globals';
import { getTodaysCar, getRandomNumbers } from '../getData';
import { Buffer } from "buffer";

describe('Get data tests', () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return car data when api call is successful", async () => {
        const mockData = { 
            "image": "test.url/toimage.jpg",
            "carlist": ["cartwo", "carone"], 
            "cardata": { "Make": "Test Make", "Model": "Test Model", "Year": 1983 }
        }
        const date = "19/03/2025";

        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true, 
            json: async () => (mockData),
        } as unknown as Response);

        const result = await getTodaysCar(date);
        expect(result).not.toBeUndefined();
        expect(result!["carlist"][0]).toEqual("carone");
        expect(result!["cardata"]).toEqual(mockData["cardata"]);
        expect(result!["image"]).toContain("toimage.jpg");
        expect(global.fetch).toHaveBeenCalledWith(process.env.API_URL + "?date=19/03/2025");
    });

    it("should return the right number of numbers within the range", () => {
        const result: Set<number> = getRandomNumbers(1000, 5);
        expect(Array.from(result)).toHaveLength(5);
        result.forEach((x) => { 
            expect(x).toBeLessThan(1001); 
            expect(x).toBeGreaterThanOrEqual(0);
        })
    });
})