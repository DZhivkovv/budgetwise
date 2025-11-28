import validateExpenseInput from "../../utils/validation/validateExpenseInput.js";

describe('validateExpenseInput', () => {
   // ---------------- SUCCESSFUL TESTS ---------------------
    describe('Successful tests', () => {
        it('should accept valid non-periodic expense data', () => {
            const expenseCategoryId = 1;
            const expenseAmount = 2000;
            const expenseDate = '2025-10-25';
            const expenseIsPeriodic = false;

            const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
            expect(result.message).toBe('Expense input valid.');
        });

        it('should accept valid weekly expense data', () => {
            const expenseCategoryId = 1;
            const expenseAmount = 2000;
            const expenseDate = '2025-10-25';
            const expenseIsPeriodic = true;
            const recurringPeriod = 'weekly';

            const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
            expect(result.message).toBe('Expense input valid.');
        });

        it('should accept valid monthly expense data', () => {
            const expenseCategoryId = 1;
            const expenseAmount = 2000;
            const expenseDate = '2025-10-25';
            const expenseIsPeriodic = true;
            const recurringPeriod = 'monthly';

            const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
            expect(result.message).toBe('Expense input valid.');
        });

        it('should accept valid yearly expense data', () => {
            const expenseCategoryId = 1;
            const expenseAmount = 2000;
            const expenseDate = '2025-10-25';
            const expenseIsPeriodic = true;
            const recurringPeriod = 'yearly';

            const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

            expect(result.valid).toBe(true);
            expect(result.status).toBe(200);
            expect(result.message).toBe('Expense input valid.');
        });

    });

   // ---------------- VALIDATION ERRORS ---------------------
    describe('Validation errors', () => {
        it('should reject when all arguments are missing', () => {
            const result = validateExpenseInput();

            expect(result.valid).toBe(false);
            expect(result.status).toBe(400);
            expect(result.message).toBe('Invalid expense category ID.');
        });

        describe('Invalid expense value:', () => {
            it('should reject when expense amount value is undefined', () => {
                const expenseCategoryId = 1;
                const expenseAmount = undefined;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount');
            }); 

            it('should reject when expense amount value is null', () => {
                const expenseCategoryId = 1;
                const expenseAmount = null;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount');
            }); 

            it('should reject when the expense amount value is a negative number', () => {
                const expenseCategoryId = 1;
                const expenseAmount = -2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount');
            });  

            it('should reject when the expense amount value is zero', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 0;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount')
            });  

            it('should reject when the expense amount value is a string', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 'not a number';
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount');
            }); 

            it('should reject when the expense amount value is an empty string', () => {
                const expenseCategoryId = 1;
                const expenseAmount = '';
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense amount');
            }); 
        });

        describe('Invalid expense category:', () => {
            it('should reject when category ID is a string', async () => {
                const expenseCategoryId = 'A string';
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is a floating point number', async () => {
                const expenseCategoryId = 3.5;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is a negative number', async () => {
                const expenseCategoryId = -3;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is zero', async () => {
                const expenseCategoryId = 0;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is a boolean value', async () => {
                const expenseCategoryId = true;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is null', async () => {
                const expenseCategoryId = null;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

            it('should reject when category ID is undefined', async () => {
                const expenseCategoryId = undefined;
                const expenseAmount = 1000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense category ID.');
            });

        });

        describe('Invalid expense date:', () => {

            it('should reject when the expense date is invalid string', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = 'Not a date';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            }); 

            it('should reject when the expense date is a number', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = 2;
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            }); 

            it('should reject when the date value is an empty string', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '';
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            });

            it('should reject when the date value is undefined', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = undefined;
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            });

            it('should reject when the date value is null', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = null;
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            });

            it('should reject when the date value is boolean', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = true;
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            });

            it('should reject when the date value is an empty object', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = {};
                const expenseIsPeriodic = false;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expense date');                
            });
        });

        describe('Invalid expenseIsPeriodic value:', () => {

            it('should reject when expenseIsPeriodic value is a string', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = 'Not a boolean';

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expenseIsPeriodic value');
            }); 

            it('should reject when expenseIsPeriodic value is a number', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = 2;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expenseIsPeriodic value');
            }); 

            it('should reject when expenseIsPeriodic value is undefined', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = undefined;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expenseIsPeriodic value');
            }); 

            it('should reject when expenseIsPeriodic value is null', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = null;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expenseIsPeriodic value');
            }); 

            it('should reject when expenseIsPeriodic value is an empty object', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = {};

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid expenseIsPeriodic value');
            }); 

        });

        describe('Invalid recurring period value:', () => {

            it('should reject when the recurring period value is not weekly, monthly or yearly', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = 'daily';

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });

            it('should reject when the recurring period value is in uppercase', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = 'WEEKLY';

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            }); 

            it('should reject when the recurring period value is in mixed case', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = 'Weekly';

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });

            it('should reject when the recurring period value is undefined', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = undefined;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });
           
            it('should reject when the recurring period value is null', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = null;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });

            it('should reject when the recurring period value is a number', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = 1;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });


            it('should reject when the recurring period value is boolean', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = true;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });
        
            it('should reject when the recurring period value is an empty object', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;
                const recurringPeriod = {};

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            });

            it('should reject when the recurring period value is missing but the expense is periodic', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = true;

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('Invalid recurring period');
            }); 

            it('should reject when there is recurring period in non-periodic expense', () => {
                const expenseCategoryId = 1;
                const expenseAmount = 2000;
                const expenseDate = '2025-10-25';
                const expenseIsPeriodic = false;
                const recurringPeriod = 'weekly';

                const result = validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod);

                expect(result.valid).toBe(false);
                expect(result.status).toBe(400);
                expect(result.message).toBe('The expense is not periodic');
            });     
        });
    });
});
