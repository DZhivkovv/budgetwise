import validateUserBudget from "../../utils/validation/validateUserBudget";

describe('validateUserBudget', () => {
  
    // ---------------- SUCCESSFUL TESTS ---------------------
    describe('Successful tests', () => {
        it('should accept numeric budget passed as a string', () => {
            const budget = "2000";
            const currency = "EUR";

            const result = validateUserBudget(budget, currency);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
        });

        it('should accept BGN as a currency',()=>{
            const budget = 2000;
            const currency = 'BGN';

            const result = validateUserBudget(budget, currency);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
        });

        it('should accept USD as a valid currency',()=>{
            const budget = 2000;
            const currency = 'USD';

            const result = validateUserBudget(budget, currency);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
        });

        it('should accept EUR as a valid currency',()=>{
            const budget = 2000;
            const currency = 'EUR';

            const result = validateUserBudget(budget, currency);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
        });
    });

    // ---------------------- VALIDATION ERRORS ----------------------
    describe('Validation errors', () => {

        describe('Invalid budget:', () => {
            it('should return 400 Bad Request when the budget value is a non-numeric string',()=>{
                const budget = 'not a number';
                const currency = 'EUR';

                const result = validateUserBudget(budget, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            });

            it('should return 400 Bad Request when the budget value is zero', ()=>{
                const budget = 0;
                const currency = 'EUR'
                const result = validateUserBudget(budget, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            });

            it('should return 400 Bad Request when the budget value is a negative number', ()=>{
                const budget = -1000;
                const currency = 'EUR'
                const result = validateUserBudget(budget, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            });

            it('should return 400 Bad Request when the budget is undefined', ()=>{
                const currency = 'EUR';
                const result = validateUserBudget(undefined, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            })

            it('should return 400 Bad Request when the budget value is null', ()=>{
                const budget = null;
                const currency = 'EUR'
                const result = validateUserBudget(budget, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            });

            it('should return 400 Bad Request when the budget value is an empty object', ()=>{
                const budget = {};
                const currency = 'EUR'
                const result = validateUserBudget(budget, currency);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid budget value");
            });
        });

        describe('Invalid currency:', () => {
            it('should return 400 Bad Request when the currency is not BGN, USD or EUR',()=>{
                const budget = 4000;
                const currenecy = 'SGD';

                const result = validateUserBudget(budget, currenecy);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });

            it('should return 400 Bad Request when the currency is a number',()=>{
                const budget = 5000;
                const currency = 12;
                const result = validateUserBudget(budget, currency);
                
                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });

            it('should return 400 Bad Request when the currency is undefined',()=>{
                const budget = 5000;
                const currency = undefined;
                const result = validateUserBudget(budget, currency);
                
                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });

            it('should return 400 Bad Request when the currency is null',()=>{
                const budget = 5000;
                const currency = null;
                const result = validateUserBudget(budget, currency);
                
                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });        

            it('should return 400 Bad Request when the currency is an empty object',()=>{
                const budget = 5000;
                const currency = {};
                const result = validateUserBudget(budget, currency);
                
                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });

            it('should return 400 Bad Request when the currency is not provided',()=>{
                const budget = 5000;
                const result = validateUserBudget(budget);
                
                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe("Invalid currency value");
            });
        });
    });
});