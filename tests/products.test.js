import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe("Testing para productos", () => {
    describe("GET /products/64c137e68ba544f9ec905f32", () => {
        it("Obtener un producto específico", async () => {
            const response = await requester.get("/products/64c137e68ba544f9ec905f32");
            
            console.log("Response Status Code:", response.statusCode);
            console.log("Response Body:", response.body);
            
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('_id');
        });
    });
});
