import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe("Testing para carritos", () => {
    describe("GET /api/carts/64c0be9764940b2a6dcfe013", () => {
        it("Obtener productos de un carrito específico", async () => {
            const response = await requester.get("/api/carts/64c0be9764940b2a6dcfe013");
            
            console.log("Response Status Code:", response.statusCode);
            console.log("Response Body:", response.body);
            
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.be.an('array');
        });
    });
});
