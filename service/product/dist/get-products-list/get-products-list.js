"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const data = [
    {
        description: "Valera",
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        price: 24,
        title: "Product One",
    },
    {
        description: "Short Product Description",
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
        price: 15,
        title: "Product Title",
    },
    {
        description: "Short Product Description",
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
        price: 23,
        title: "Product",
    },
    {
        description: "Short Product Description",
        id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
        price: 15,
        title: "Product Test",
    },
    {
        description: "Short Product Description",
        id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
        price: 23,
        title: "Product 2",
    },
    {
        description: "Short Product Description",
        id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
        price: 15,
        title: "Product Name",
    },
];
const handler = async () => {
    try {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error }),
        };
    }
};
exports.handler = handler;
