export default (sequelize, Sequelize) => {
    // Define the Budget model with fields and validation rules
    const Budget = sequelize.define("budget", {
        // User ID. References the user with the budget.  
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: "user",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        // Budget amount: float number
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: Sequelize.ENUM("BGN", "EUR", "USD"),
            allowNull: false,
        },
    });
    
    // Return the Budget model to be used elsewhere in the app
    return Budget;
};