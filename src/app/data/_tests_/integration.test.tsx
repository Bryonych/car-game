import { getTodaysCar } from '../getData';
import { server } from './mocks/server';

describe("Get data integration test", () => {
    beforeAll(() => {
        process.env.API_URL = "https://api.test.com/car";
    })
    it("should return data from the API", async () => {
        server.listen();
        const result = await getTodaysCar("19/03/2025");
        expect(result["image"]).toContain("blob");
        // Check it has sorted them
        expect(result["carlist"][0]).toEqual("carone");
        expect(result["cardata"]["Model"]).toEqual("test model");
        server.close();
    });
});