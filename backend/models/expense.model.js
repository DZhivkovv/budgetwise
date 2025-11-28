export default (sequelize, Sequelize) => {
    // Define the Expense model with fields and validation rules
    const Expense = sequelize.define("expense", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // User ID. References the user that made the expense.  
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        // Category ID. References the expense category.  
        categoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "categories",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        // Expense amount.
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        // Date of expense
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        // A boolean value showing if the purchase will be made more than once over a period of time 
        // Bills, subscriptions, etc ...
        isPeriodic: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        // A value showing the recurring period of the expense. 
        recurringPeriod: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        // Date of the next expense of the same kind.
        // It is not a required field because an expense can also be not periodic.
        nextDueDate: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        // Notes.
        notes: {
            type: Sequelize.STRING,
            allowNull: true,
        }
    });
    
    // Return the Expense model to be used elsewhere in the app
    return Expense;
};