import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe("Testing para sesiones", () => {
    describe("POST /login", () => {
        it("Iniciar sesión exitosamente", async () => {
            const response = await requester
                .post("/login")
                .send({
                    email: "juanm@gmail.com",
                    password: "0123456789"
                });
            
            console.log("Response Status Code:", response.statusCode);
            console.log("Response Body:", response.body);
            
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('token');
        });
    });
});
